import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateSession, touchSession } from '@/lib/sessions-store';
import { ensureAuditLogTable } from '@/lib/audit';

export async function GET(request: Request) {
    try {
        // Accept token from httpOnly cookie OR x-session-token header
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

        await touchSession(token);


        const { searchParams } = new URL(request.url);
        const filterUser = searchParams.get('user') || '';
        const filterAction = searchParams.get('action') || '';
        const limit = parseInt(searchParams.get('limit') || '200', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        await ensureAuditLogTable();

        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filterUser) {
            conditions.push(`"AuditLog".username ILIKE $${idx++}`);
            params.push(`%${filterUser}%`);
        }
        if (filterAction) {
            conditions.push(`"AuditLog".action = $${idx++}`);
            params.push(filterAction);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Main logs query — includes device info for each event
        const logsQuery = `
            SELECT 
                "AuditLog".id, 
                "AuditLog".user_id, 
                "AuditLog".username, 
                COALESCE("User".name, "AuditLog".name) as name, 
                "AuditLog".role, 
                "AuditLog".action, 
                "AuditLog".details, 
                "AuditLog".ip_address, 
                "AuditLog".user_agent, 
                "AuditLog".created_at,
                "User".avatar_url
            FROM "AuditLog"
            LEFT JOIN "User" ON "AuditLog".username = "User".username
            ${where}
            ORDER BY "AuditLog".created_at DESC
            LIMIT $${idx++} OFFSET $${idx++}
        `;
        params.push(limit, offset);

        const { rows: logs } = await pool.query(logsQuery, params);

        // Count total
        const countParams = conditions.length > 0 ? params.slice(0, conditions.length) : [];
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) as total FROM "AuditLog" ${where}`,
            countParams
        );
        const total = parseInt(countRows[0]?.total || '0', 10);

        const includeStats = searchParams.get('stats') === 'true';

        let userStats = [];
        let actions: string[] = [];

        if (includeStats) {
            // Per-user activity summary (all time)
            const { rows: userStatsRows } = await pool.query(`
                SELECT
                    a.username,
                    COALESCE(MAX(u.name), MAX(a.name)) as name,
                    COALESCE(MAX(u.role)::text, MAX(a.role)) as role,
                    MAX(u.avatar_url) as avatar_url,
                    COUNT(a.id) as total_actions,
                    MAX(a.created_at) as last_activity,
                    MIN(CASE WHEN a.action = 'LOGIN' THEN a.created_at END) as first_login,
                    MAX(CASE WHEN a.action = 'LOGIN' THEN a.created_at END) as last_login,
                    COUNT(CASE WHEN a.action = 'LOGIN' THEN 1 END) as login_count,
                    COUNT(CASE WHEN a.action = 'LOGOUT' THEN 1 END) as logout_count,
                    COUNT(CASE WHEN a.action = 'LOGIN_FAILED' THEN 1 END) as failed_logins
                FROM "AuditLog" a
                LEFT JOIN "User" u ON a.username = u.username
                GROUP BY a.username
                ORDER BY last_activity DESC NULLS LAST
            `);
            userStats = userStatsRows;

            // Unique actions list for filter dropdown
            const { rows: actionRows } = await pool.query(
                `SELECT DISTINCT action FROM "AuditLog" ORDER BY action`
            );
            actions = actionRows.map(r => r.action);
        }

        const res = NextResponse.json({
            logs,
            total,
            limit,
            offset,
            userStats,
            actions,
        });
        res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
        return res;
    } catch (error: any) {
        console.error('Audit Log GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
