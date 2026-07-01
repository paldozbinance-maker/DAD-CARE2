import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const sessionRes = await requireSession(request);
        if (sessionRes instanceof NextResponse) return sessionRes;

        // Query historical pairs from DailyBook
        // We return ALL consecutive pairs of dates (rolling window) to guarantee no pairs are missed
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
            pairs AS (
                SELECT n2.db_date::date as date1, n1.db_date::date as date2
                FROM numbered_dates n1
                JOIN numbered_dates n2 ON n1.rn = n2.rn - 1
                WHERE n1.rn % 2 = 1
            )
            SELECT 
                p.date1::text as date1, 
                p.date2::text as date2,
                (
                    SELECT EXISTS (
                        SELECT 1
                        FROM "Ledger" prod
                        WHERE prod.type = 'PRODUCT' AND prod.deleted_at IS NULL
                        AND COALESCE(prod.reference_date::date, prod.created_at::date) IN (p.date1, p.date2)
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
                    )
                ) as has_payments,
                -- Count of distinct customers who have products in this pair
                (
                    SELECT COUNT(DISTINCT prod.customer_id)
                    FROM "Ledger" prod
                    WHERE prod.type = 'PRODUCT' AND prod.deleted_at IS NULL
                    AND COALESCE(prod.reference_date::date, prod.created_at::date) IN (p.date1, p.date2)
                ) as total_customers,
                -- Count of distinct customers who have payments for this pair
                (
                    SELECT COUNT(DISTINCT prod.customer_id)
                    FROM "Ledger" prod
                    WHERE prod.type = 'PRODUCT' AND prod.deleted_at IS NULL
                    AND COALESCE(prod.reference_date::date, prod.created_at::date) IN (p.date1, p.date2)
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
                ) as payment_count
            FROM pairs p
            ORDER BY p.date1 DESC;
        `;
        
        const result = await pool.query(query);
        
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching maqal pairs:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error', stack: error.stack }, { status: 500 });
    }
}
