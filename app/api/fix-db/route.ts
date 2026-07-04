import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
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
