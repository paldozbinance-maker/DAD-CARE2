import { NextResponse } from 'next/server';
import { validateSession, touchSession, getOnlineSessions, getAllSessions } from '@/lib/sessions-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin-sessions
 * Returns online and recent session data for the super admin dashboard.
 * Also updates the caller's lastSeenAt (heartbeat).
 */
export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || '';
        const cookieToken = cookieHeader.match(/dadwork_session=([^;]+)/)?.[1];
        const token = cookieToken || request.headers.get('x-session-token');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await validateSession(token);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Heartbeat — mark caller as still online
        await touchSession(token);

        const [onlineSessions, allSessions] = await Promise.all([
            getOnlineSessions(),
            getAllSessions(),
        ]);

        // Deduplicate by username — keep the most recently seen session per user
        const uniqueOnlineMap = new Map<string, any>();
        for (const s of onlineSessions) {
            const existing = uniqueOnlineMap.get(s.username);
            if (!existing || s.lastSeenAt > existing.lastSeenAt) {
                uniqueOnlineMap.set(s.username, s);
            }
        }

        const uniqueAllMap = new Map<string, any>();
        for (const s of allSessions) {
            const existing = uniqueAllMap.get(s.username);
            if (!existing || s.lastSeenAt > existing.lastSeenAt) {
                uniqueAllMap.set(s.username, s);
            }
        }

        const now = Date.now();
        const sanitize = (s: any) => ({
            username: s.username,
            name: s.name,
            avatarUrl: s.avatarUrl,
            role: s.role,
            loginAt: s.loginAt,
            lastSeenAt: new Date(s.lastSeenAt).toISOString(),
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            isOnline: (now - s.lastSeenAt) < 5 * 60 * 1000,
        });

        const onlineList = Array.from(uniqueOnlineMap.values()).map(sanitize);
        const allList = Array.from(uniqueAllMap.values()).map(sanitize);

        return NextResponse.json({
            online: onlineList,
            all: allList,
            totalOnline: onlineList.length,
        });
    } catch (error: any) {
        console.error('Admin Sessions Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/admin-sessions
 * Heartbeat endpoint — keeps the current user's session marked as "online".
 */
export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || '';
        const cookieToken = cookieHeader.match(/dadwork_session=([^;]+)/)?.[1];
        const token = cookieToken || request.headers.get('x-session-token');
        if (token) {
            await touchSession(token);
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: true });
    }
}
