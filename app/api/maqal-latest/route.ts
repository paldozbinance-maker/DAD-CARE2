import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

// Returns the LATEST maqal pair with full customer list and payment status per customer
export async function GET(request: NextRequest) {
    try {
        const sessionRes = await requireSession(request);
        if (sessionRes instanceof NextResponse) return sessionRes;

        const query = `
            WITH past_dates AS (
                SELECT DISTINCT date::date as db_date
                FROM "DailyBook"
                WHERE deleted_at IS NULL
            ),
            numbered_dates AS (
                SELECT db_date,
                       ROW_NUMBER() OVER (ORDER BY db_date DESC) as rn
                FROM past_dates
            ),
            latest_pair AS (
                SELECT n2.db_date::date as date1, n1.db_date::date as date2
                FROM numbered_dates n1
                JOIN numbered_dates n2 ON n1.rn = n2.rn - 1
                WHERE n1.rn % 2 = 1
                ORDER BY n2.db_date DESC
                LIMIT 1
            ),
            pair_customers AS (
                SELECT DISTINCT
                    c.id,
                    c.name,
                    c.customer_code,
                    c.avatar_url
                FROM "Customer" c
                JOIN "Ledger" l ON l.customer_id = c.id
                CROSS JOIN latest_pair lp
                WHERE l.type = 'PRODUCT'
                  AND l.deleted_at IS NULL
                  AND c.deleted_at IS NULL
                  AND COALESCE(l.reference_date::date, l.created_at::date) IN (lp.date1, lp.date2)
            ),
            customer_payments AS (
                SELECT
                    pc.id as customer_id,
                    EXISTS (
                        SELECT 1
                        FROM "Ledger" prod
                        JOIN latest_pair lp ON TRUE
                        WHERE prod.customer_id = pc.id
                          AND prod.type = 'PRODUCT'
                          AND prod.deleted_at IS NULL
                          AND COALESCE(prod.reference_date::date, prod.created_at::date) IN (lp.date1, lp.date2)
                          AND EXISTS (
                              SELECT 1
                              FROM "Ledger" pay
                              WHERE pay.customer_id = prod.customer_id
                                AND pay.type = 'PAYMENT'
                                AND pay.deleted_at IS NULL
                                AND pay.created_at >= prod.created_at
                                AND pay.created_at < COALESCE(
                                    (SELECT MIN(created_at) FROM "Ledger" next_prod
                                     WHERE next_prod.customer_id = prod.customer_id
                                       AND next_prod.type = 'PRODUCT'
                                       AND next_prod.deleted_at IS NULL
                                       AND next_prod.created_at > prod.created_at
                                    ),
                                    'infinity'::timestamp
                                )
                          )
                    ) as has_payment
                FROM pair_customers pc
            )
            SELECT
                (SELECT date1::text FROM latest_pair) as date1,
                (SELECT date2::text FROM latest_pair) as date2,
                json_agg(
                    json_build_object(
                        'id', pc.id,
                        'name', pc.name,
                        'customer_code', pc.customer_code,
                        'avatar_url', pc.avatar_url,
                        'has_payment', cp.has_payment
                    ) ORDER BY pc.customer_code ASC
                ) as customers
            FROM pair_customers pc
            JOIN customer_payments cp ON cp.customer_id = pc.id;
        `;

        const result = await pool.query(query);
        const row = result.rows[0];

        if (!row || !row.date1) {
            return NextResponse.json({ date1: null, date2: null, customers: [] });
        }

        const res = NextResponse.json({
            date1: row.date1,
            date2: row.date2,
            customers: row.customers || [],
        });
        res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
        return res;
    } catch (error: any) {
        console.error('Error fetching latest maqal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
