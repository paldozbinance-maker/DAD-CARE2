import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { session, errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        // Find epoch
        const epochQuery = `SELECT MIN(date::date)::text as start_date FROM "DailyBook" WHERE deleted_at IS NULL`;
        const { rows: epochRows } = await pool.query(epochQuery);
        const epochStr = epochRows[0]?.start_date;

        // Cleanup duplicates
        await pool.query(`
            DELETE FROM "DailyBook" a USING "DailyBook" b
            WHERE a.date = b.date AND a.created_at > b.created_at;
        `);

        return NextResponse.json({ success: true, epochStr });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
