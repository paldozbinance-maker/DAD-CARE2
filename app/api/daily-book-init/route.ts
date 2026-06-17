import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

import { unstable_cache } from 'next/cache';

const getCachedDailyBookInit = unstable_cache(
    async () => {
        const [customersResult, historyResult] = await Promise.all([
            pool.query(`
                SELECT id, name, customer_code, gender, avatar_url, phone
                FROM "Customer"
                ORDER BY name ASC
            `),
            pool.query(`
                SELECT 
                    db.id, 
                    db.date,
                    COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'id', dbi.id,
                                'kg', dbi.kg,
                                'present', dbi.present,
                                'note', dbi.note,
                                'customer', (
                                    SELECT json_build_object(
                                        'id', c.id,
                                        'name', c.name,
                                        'customer_code', c.customer_code,
                                        'gender', c.gender,
                                        'avatar_url', c.avatar_url
                                    )
                                    FROM "Customer" c WHERE c.id = dbi.customer_id
                                )
                            )
                        )
                        FROM "DailyBookItem" dbi 
                        WHERE dbi.daily_book_id = db.id
                    ), '[]'::json) as items
                FROM "DailyBook" db
                ORDER BY db.date DESC;
            `)
        ]);

        const history = (historyResult.rows || []).map((book: any) => {
            const totalKg = book.items.reduce((sum: number, item: any) => sum + (item.kg || 0), 0);
            return {
                id: book.id,
                date: book.date,
                totalKg,
                items: book.items.map((item: any) => ({
                    customer_id: item.customer?.id,
                    kg: item.kg,
                    present: item.present,
                    note: item.note,
                    customer: item.customer
                }))
            };
        });

        const latestDate = history.length > 0 ? history[0].date : null;

        return {
            customers: customersResult.rows,
            history,
            latestDate,
        };
    },
    ['daily-book-init'],
    { revalidate: 2, tags: ['daily-book'] }
);

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const data = await getCachedDailyBookInit();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Daily Book Init Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
