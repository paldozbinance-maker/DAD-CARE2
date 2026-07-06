import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;

    try {
        const { rows: historyResult } = await pool.query(`
            SELECT 
                db.id, 
                db.date,
                COALESCE(SUM(dbi.kg), 0)::float as total_kg,
                COUNT(dbi.id) as item_count
            FROM "DailyBook" db
            LEFT JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id AND dbi.deleted_at IS NULL
            WHERE db.deleted_at IS NULL
            GROUP BY db.id, db.date
            ORDER BY db.date DESC
            LIMIT 15
        `);

        // Transform data to match the SavedEntry format expected by the frontend
        const history = (historyResult || []).map((book: any) => {
            return {
                id: book.id,
                date: book.date,
                totalKg: parseFloat(book.total_kg) || 0,
                itemCount: parseInt(book.item_count) || 0,
                items: [] // Empty array to satisfy frontend types initially, loaded lazily on edit
            };
        });

        const response = NextResponse.json(history);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;
    } catch (error: any) {
        console.error('Fetch Daily Book History Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
