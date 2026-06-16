import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/sessions-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('x-session-token');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = validateSession(token);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Ensure table exists before querying
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

        const { rows } = await pool.query(
            `SELECT * FROM "AuditLog" ORDER BY created_at DESC LIMIT 100`
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Audit Log GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
