import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import pool from '@/lib/db';
import { trackApiRoute } from '@/lib/egress-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = trackApiRoute('/api/daily-book-history', async (request: Request) => {
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
                            'note',        dbi.note,
                            'customer',    json_build_object(
                                'id',            c.id,
                                'name',          c.name,
                                'customer_code', c.customer_code,
                                'gender',        c.gender,
                                'avatar_url',    c.avatar_url
                            )
                        )
                        ORDER BY c.customer_code::text ASC
                    ) FILTER (WHERE dbi.id IS NOT NULL),
                    '[]'::json
                ) as items
            FROM "DailyBook" db
            LEFT JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id AND dbi.deleted_at IS NULL
            LEFT JOIN "Customer" c ON c.id = dbi.customer_id
            WHERE db.deleted_at IS NULL
            GROUP BY db.id, db.date
            ORDER BY db.date DESC
            LIMIT 14
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
                    customer:    item.customer,
                }))
            };
        });

        const response = NextResponse.json(history);
        // Force no-store to prevent stuck UI issues
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
    } catch (error: any) {
        console.error('Fetch Daily Book History Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
