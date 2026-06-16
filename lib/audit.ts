import pool from './db';
import { validateSession } from './sessions-store';

/**
 * Ensures the AuditLog table exists with all required columns.
 * Safe to call repeatedly — uses CREATE TABLE IF NOT EXISTS + ALTER TABLE for migrations.
 */
export async function ensureAuditLogTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "AuditLog" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT,
            username TEXT NOT NULL,
            name TEXT,
            role TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    `);
    // Migrate: add columns if they don't exist yet (safe on existing tables)
    const migrations = [
        `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS user_id TEXT`,
        `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS name TEXT`,
        `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS ip_address TEXT`,
        `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS user_agent TEXT`,
    ];
    for (const sql of migrations) {
        try { await pool.query(sql); } catch (_) { /* column may already exist */ }
    }
}

/**
 * Log an action to the Audit Trail from an API request.
 * Reads the session token from: httpOnly cookie OR x-session-token header.
 * Safely ignores if the token is invalid to not break main logic.
 */
export async function logAudit(request: Request, action: string, details: string) {
    try {
        // Read token from httpOnly cookie first, then fall back to header
        const cookieHeader = request.headers.get('cookie') || '';
        const cookieToken = cookieHeader.match(/dadwork_session=([^;]+)/)?.[1];
        const token = cookieToken || request.headers.get('x-session-token');
        if (!token) return;

        const session = await validateSession(token);
        if (!session) return;

        const ip = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await ensureAuditLogTable();

        await pool.query(
            `INSERT INTO "AuditLog" (user_id, username, role, action, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [session.userId, session.username, session.role, action, details, ip, userAgent]
        );
    } catch (e) {
        console.error('Audit Log failed:', e);
    }
}


/**
 * Directly log an event (no request needed — used for login/logout events).
 */
export async function logAuditDirect(params: {
    userId?: string;
    username: string;
    name?: string;
    role: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
}) {
    try {
        await ensureAuditLogTable();
        await pool.query(
            `INSERT INTO "AuditLog" (user_id, username, name, role, action, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                params.userId || null,
                params.username,
                params.name || null,
                params.role,
                params.action,
                params.details,
                params.ipAddress || null,
                params.userAgent || null,
            ]
        );
    } catch (e) {
        console.error('Direct Audit Log failed:', e);
    }
}
