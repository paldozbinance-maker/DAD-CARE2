import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

async function getDailyBookInit() {
    // Fetch customers only
    const { rows: customers } = await pool.query(`
      SELECT id, name, customer_code, gender, phone
      FROM "Customer"
      WHERE deleted_at IS NULL
      ORDER BY name ASC
    `);

    // Get the most recent daily‑book date (no full history)
    const { rows: recent } = await pool.query(`
      SELECT date FROM "DailyBook"
      WHERE deleted_at IS NULL
      ORDER BY date DESC
      LIMIT 1
    `);
    const latestDate = recent.length > 0 ? recent[0].date : null;

    return {
      customers,
      latestDate,
    };
}

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const data = await getDailyBookInit();
        const response = NextResponse.json(data);
        // Added Cache-Control so the Daily Book page loads instantly on repeat visits.
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;
    } catch (error: any) {
        console.error('Daily Book Init Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
