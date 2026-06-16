import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const query = `
            SELECT
                a.username,
                COALESCE(MAX(u.name), MAX(a.name)) as name,
                COALESCE(MAX(u.role), MAX(a.role)) as role,
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
        `;
        const { rows } = await pool.query(query);
        return NextResponse.json({ rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
    }
}
