import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions-store';
import { logAuditDirect } from '@/lib/audit';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;
        const supabase = await createClient();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const ip = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || 'localhost';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Check user credentials against database
        const { data: user, error } = await supabase
            .from('User')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error) throw error;

        let resolvedUser: any = null;

        // Fallback for hardcoded admin login
        if (username === 'admin' && password === '123' && !user) {
            resolvedUser = {
                id: 'admin-hardcoded',
                username: 'admin',
                name: 'Administrator',
                role: 'SUPER_ADMIN',
                is_active: true,
                assigned_customer_ids: []
            };
        } else {
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
            if (user.password !== password) {
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
        }

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
        // Set secure httpOnly cookie so middleware can enforce auth on page routes
        response.cookies.set('dadwork_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 12 * 60 * 60, // 12 hours – matches SESSION_TTL_HOURS
        });
        return response;
    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
    }
}
