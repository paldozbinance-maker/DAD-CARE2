import pool from './db';
import { validateSession } from './sessions-store';

let isAuditLogTableEnsured = false;

/**
 * Ensures the AuditLog table exists with all required columns.
 * Also runs automatic cleanup to delete logs older than 7 days.
 * Safe to call repeatedly — only runs ONCE per serverless instance lifecycle.
 */
export async function ensureAuditLogTable() {
    if (isAuditLogTableEnsured) return;

    try {
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

        // ── AUTO-CLEANUP: Delete audit logs older than 7 days ──────────────────
        // This is the key to preventing database bloat. Without this, audit logs
        // grow forever and can fill the 5 GB Supabase free tier in hours.
        const { rowCount: deletedAuditRows } = await pool.query(
            `DELETE FROM "AuditLog" WHERE created_at < NOW() - INTERVAL '30 days'`
        );
        if ((deletedAuditRows ?? 0) > 0) {
            console.log(`[AuditLog Cleanup] Deleted ${deletedAuditRows} old audit log entries (>7 days).`);
        }

        // ── AUTO-CLEANUP: Delete expired admin sessions ─────────────────────────
        const { rowCount: deletedSessions } = await pool.query(
            `DELETE FROM "AdminSession" WHERE expires_at < NOW()`
        );
        if ((deletedSessions ?? 0) > 0) {
            console.log(`[Session Cleanup] Deleted ${deletedSessions} expired admin sessions.`);
        }

        // ── AUTO-CLEANUP: Empty Trash older than 30 days ────────────────────────
        // Permanently delete soft-deleted records older than 30 days to free space
        await pool.query(`DELETE FROM "DailyBookItem" WHERE deleted_at < NOW() - INTERVAL '30 days'`);
        await pool.query(`DELETE FROM "DailyBook" WHERE deleted_at < NOW() - INTERVAL '30 days'`);
        await pool.query(`DELETE FROM "Ledger" WHERE deleted_at < NOW() - INTERVAL '30 days'`);

        isAuditLogTableEnsured = true;
    } catch (e) {
        console.error("Failed to ensure AuditLog table", e);
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
