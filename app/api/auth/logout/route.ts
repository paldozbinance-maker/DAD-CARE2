import { NextResponse } from 'next/server';
import { validateSession, deleteSession } from '@/lib/sessions-store';
import { logAuditDirect } from '@/lib/audit';

export async function POST(request: Request) {
    try {
        // Read token from httpOnly cookie OR legacy header
        const cookieHeader = request.headers.get('cookie') || '';
        const cookieToken = cookieHeader.match(/dadwork_session=([^;]+)/)?.[1];
        const token = cookieToken || request.headers.get('x-session-token');

        const response = NextResponse.json({ success: true });

        // Always clear both auth cookies
        response.cookies.set('dadwork_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });
        response.cookies.set('dadwork_claim', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });

        if (!token) {
            return response; // Already logged out
        }

        const session = await validateSession(token);

        if (session) {
            const ip = request.headers.get('x-forwarded-for')
                || request.headers.get('x-real-ip')
                || 'localhost';
            const userAgent = request.headers.get('user-agent') || 'unknown';

            await logAuditDirect({
                userId: session.userId,
                username: session.username,
                role: session.role,
                action: 'LOGOUT',
                details: `${session.username} logged out`,
                ipAddress: ip,
                userAgent,
            });
        }

        await deleteSession(token);
        return response;
    } catch (error: any) {
        console.error('Logout API Error:', error);
        const response = NextResponse.json({ success: true });
        response.cookies.set('dadwork_session', '', { maxAge: 0, path: '/' });
        return response;
    }
}

