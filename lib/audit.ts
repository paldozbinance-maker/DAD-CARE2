import pool from './db';
import { validateSession } from './sessions-store';

/**
 * Ensures the AuditLog table exists.
 */
async function ensureAuditLogTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "AuditLog" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username TEXT NOT NULL,
            role TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    `);
}

/**
 * Log an action to the Audit Trail.
 * Safely ignores if the token is invalid to not break main logic.
 */
export async function logAudit(request: Request, action: string, details: string) {
    try {
        const token = request.headers.get('x-session-token');
        if (!token) return;

        const session = validateSession(token);
        if (!session) return; // Unauthenticated or expired

        await ensureAuditLogTable();

        await pool.query(
            `INSERT INTO "AuditLog" (username, role, action, details) VALUES ($1, $2, $3, $4)`,
            [session.username, session.role, action, details]
        );
    } catch (e) {
        console.error('Audit Log failed:', e);
        // We catch and ignore errors so business logic isn't blocked by audit failures
    }
}
