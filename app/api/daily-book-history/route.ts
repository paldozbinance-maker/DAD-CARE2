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
                COUNT(dbi.id) as item_count,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'customer_id', dbi.customer_id,
                            'kg',          dbi.kg,
                            'present',     dbi.present,
                            'note',        dbi.note
                        )
                    ) FILTER (WHERE dbi.id IS NOT NULL),
                    '[]'::json
                ) as items
            FROM "DailyBook" db
            LEFT JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id AND dbi.deleted_at IS NULL
            WHERE db.deleted_at IS NULL
            GROUP BY db.id, db.date
            ORDER BY db.date DESC
            LIMIT 60
        `);

        const history = (historyResult || []).map((book: any) => {
            const itemsList: any[] = typeof book.items === 'string'
                ? JSON.parse(book.items)
                : (book.items || []);

            return {
                id: book.id,
                date: book.date,
                totalKg: parseFloat(book.total_kg) || 0,
                itemCount: parseInt(book.item_count) || 0,
                items: itemsList.map((item: any) => ({
                    customer_id: item.customer_id,
                    kg:          item.kg,
                    present:     item.present,
                    note:        item.note,
                }))
            };
        });

        const response = NextResponse.json(history);
        // No server-side cache — history must always be fresh after saves
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;
    } catch (error: any) {
        console.error('Fetch Daily Book History Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
