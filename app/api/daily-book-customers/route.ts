import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

// Get customers with their KG for a specific date
export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
        return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    try {
        const { rows } = await pool.query(`
            SELECT 
                dbi.customer_id,
                dbi.kg,
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'customer_code', c.customer_code
                ) as customer
            FROM "DailyBookItem" dbi
            JOIN "DailyBook" db ON dbi.daily_book_id = db.id
            JOIN "Customer" c ON dbi.customer_id = c.id
            WHERE db.date = $1 AND db.deleted_at IS NULL AND dbi.deleted_at IS NULL
        `, [dateStr]);

        const res = NextResponse.json(rows || []);
        res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
        return res;
    } catch (error: any) {
        console.error('Fetch Customers By Date Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
