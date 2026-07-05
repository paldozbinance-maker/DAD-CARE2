import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

// Get all dates that have daily book entries
export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await pool.query(`
            SELECT id, date
            FROM "DailyBook"
            WHERE deleted_at IS NULL
            ORDER BY date DESC
        `);

        const res = NextResponse.json(rows || []);
        res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
        return res;
    } catch (error: any) {
        console.error('Fetch Daily Book Dates Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
