import pool from './db';
import { validateSession } from './sessions-store';

// ── Per-instance flags using globalThis so they survive warm Vercel instances ──
declare global {
    var _auditTableEnsured: boolean | undefined;
    var _auditLastCleanup: number | undefined;
}

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run cleanup at most ONCE per hour per instance

/**
 * Ensures the AuditLog table exists with all required columns.
 * Cleanup queries (DELETE old records) run at most ONCE per hour per Vercel instance
 * to prevent destroying Supabase egress budget on every API call.
 *
 * ROOT CAUSE FIX: Previously the 5x DELETE cleanup queries ran on EVERY API call
 * because the in-memory flag reset on every cold start. This was the primary cause
 * of 4+ GB of Supabase egress in 2 days.
 */
export async function ensureAuditLogTable() {
    // Table structure setup — only once per serverless instance lifecycle
    if (!globalThis._auditTableEnsured) {
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
            // Safe column migrations
            const migrations = [
                `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS user_id TEXT`,
                `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS name TEXT`,
                `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS ip_address TEXT`,
                `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS user_agent TEXT`,
            ];
            for (const sql of migrations) {
                try { await pool.query(sql); } catch (_) { /* column may already exist */ }
            }
            globalThis._auditTableEnsured = true;
        } catch (e) {
            console.error("Failed to ensure AuditLog table", e);
            return; // Don't proceed to cleanup if setup failed
        }
    }

    // ── THROTTLED CLEANUP: Run at most once per hour per instance ──────────────
    // Previously this ran on EVERY API call, burning through Supabase egress budget.
    const now = Date.now();
    const lastCleanup = globalThis._auditLastCleanup ?? 0;
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    globalThis._auditLastCleanup = now;

    try {
        // Delete audit logs older than 30 days
        await pool.query(`DELETE FROM "AuditLog" WHERE created_at < NOW() - INTERVAL '30 days'`);
        // Delete expired admin sessions
        await pool.query(`DELETE FROM "AdminSession" WHERE expires_at < NOW()`);
        // Empty Trash older than 30 days (only soft-deleted records)
        await pool.query(`DELETE FROM "DailyBookItem" WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'`);
        await pool.query(`DELETE FROM "DailyBook" WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'`);
        await pool.query(`DELETE FROM "Ledger" WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'`);
        console.log('[AuditLog Cleanup] Hourly cleanup done.');
    } catch (e) {
        console.error('[AuditLog Cleanup] Cleanup failed:', e);
        globalThis._auditLastCleanup = 0; // retry next time
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
