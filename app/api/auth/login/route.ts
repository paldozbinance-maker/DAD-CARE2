import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions-store';
import { logAuditDirect } from '@/lib/audit';
import { signClaim } from '@/lib/token';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const ip = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || 'localhost';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Check user credentials against database directly via pg pool
        const { rows } = await pool.query('SELECT * FROM "User" WHERE username = $1 LIMIT 1', [username]);
        const user = rows[0] || null;

        let resolvedUser: any = null;

        if (!user) {
            await logAuditDirect({
                username,
                role: 'UNKNOWN',
                action: 'LOGIN_FAILED',
                details: `Failed login attempt for username: ${username}`,
                ipAddress: ip,
                userAgent,
            });
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }
        if (user.username === 'admin') user.role = 'SUPER_ADMIN';
        
        // Strictly enforce bcrypt hashing (no plaintext fallback allowed)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            await logAuditDirect({
                userId: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                action: 'LOGIN_FAILED',
                details: `Wrong password for user: ${user.username}`,
                ipAddress: ip,
                userAgent,
            });
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }
        if (!user.is_active) {
            return NextResponse.json({ error: 'This user account is inactive' }, { status: 403 });
        }
        resolvedUser = user;

        // 🔒 Generate secure session token and persist to DB
        const token = randomBytes(32).toString('hex');
        await createSession(token, resolvedUser.id, resolvedUser.username, resolvedUser.role, {
            name: resolvedUser.name,
            avatarUrl: resolvedUser.avatar_url,
            ipAddress: ip,
            userAgent,
        });

        // ✅ Log successful login with device info
        await logAuditDirect({
            userId: resolvedUser.id,
            username: resolvedUser.username,
            name: resolvedUser.name,
            role: resolvedUser.role,
            action: 'LOGIN',
            details: `${resolvedUser.name || resolvedUser.username} logged in from ${ip}`,
            ipAddress: ip,
            userAgent,
        });

        const response = NextResponse.json({ ...resolvedUser, sessionToken: token });
        const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
        // Primary session cookie (opaque, used for DB-backed validation in API routes)
        response.cookies.set('dadwork_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });
        // Signed claim cookie — readable by Edge middleware without any DB call.
        // Contains: username, role, expiry. HMAC-signed so it cannot be forged.
        const claim = await signClaim(resolvedUser.username, resolvedUser.role, TTL_MS);
        response.cookies.set('dadwork_claim', claim, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });
        return response;
    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
    }
}
