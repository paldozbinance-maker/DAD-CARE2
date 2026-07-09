import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

async function getDailyBookInit() {
    // Fetch customers sorted by their numeric customer_code (so #1 comes before #2, etc.)
    const { rows: customers } = await pool.query(`
      SELECT id, name, customer_code, gender, phone
      FROM "Customer"
      WHERE deleted_at IS NULL
      ORDER BY 
        CASE WHEN customer_code ~ '^[0-9]+$' THEN customer_code::int ELSE 9999 END ASC,
        name ASC
    `);

    // Get the most recent daily-book date (no full history)
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const data = await getDailyBookInit();
        const response = NextResponse.json(data);
        // Force no-store to prevent stuck UI issues
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
    } catch (error: any) {
        console.error('Daily Book Init Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
