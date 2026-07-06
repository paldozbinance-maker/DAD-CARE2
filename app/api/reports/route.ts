import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;

    try {
        // Single aggregated SQL query — computes all stats in the DB.
        // This avoids fetching ALL ledger rows over the Supabase PostgREST API
        // (which was the #1 cause of Supabase egress usage).
        const { rows } = await pool.query(`
            SELECT
                c.id,
                c.name,
                c.customer_code as code,

                -- Total KG from all PRODUCT entries
                COALESCE(SUM(CASE WHEN l.type = 'PRODUCT' THEN l.kg ELSE 0 END), 0)::float        AS "totalKg",

                -- Total PRODUCT amount (what they consumed = maqal)
                COALESCE(SUM(CASE WHEN l.type = 'PRODUCT' THEN l.amount ELSE 0 END), 0)::float    AS "totalProductAmount",

                -- Total payments made
                COALESCE(SUM(CASE WHEN l.type = 'PAYMENT' THEN l.amount ELSE 0 END), 0)::float    AS "totalPaid",

                -- Count of PRODUCT transactions
                COUNT(CASE WHEN l.type = 'PRODUCT' THEN 1 END)::int                               AS "productTxnCount",

                -- Current balance = new_debt from the most recent ledger entry
                COALESCE((
                    SELECT new_debt FROM "Ledger" l2
                    WHERE l2.customer_id = c.id AND l2.deleted_at IS NULL
                    ORDER BY l2.created_at DESC, l2.id DESC
                    LIMIT 1
                ), 0)::float AS "currentDebt",

                -- Is Reesto = last transaction was a PAYMENT (meaning balance is negative/credit)
                COALESCE((
                    SELECT (type = 'PAYMENT') FROM "Ledger" l2
                    WHERE l2.customer_id = c.id AND l2.deleted_at IS NULL
                    ORDER BY l2.created_at DESC, l2.id DESC
                    LIMIT 1
                ), false) AS "is_reesto"

            FROM "Customer" c
            LEFT JOIN "Ledger" l ON l.customer_id = c.id AND l.deleted_at IS NULL
            GROUP BY c.id, c.name, c.customer_code
            ORDER BY c.name ASC
        `);

        const reportData = rows.map((stats: any) => {
            const totalProductAmount = parseFloat(stats.totalProductAmount) || 0;
            const totalPaid = parseFloat(stats.totalPaid) || 0;
            const totalKg = parseFloat(stats.totalKg) || 0;
            const productTxnCount = parseInt(stats.productTxnCount) || 0;
            const averageKg = productTxnCount > 0 ? totalKg / productTxnCount : 0;

            let performanceScore = 0;
            if (totalProductAmount === 0 && totalPaid === 0) {
                performanceScore = 100;
            } else if (totalProductAmount === 0 && totalPaid > 0) {
                performanceScore = 100;
            } else {
                performanceScore = Math.min((totalPaid / totalProductAmount) * 100, 100);
            }

            return {
                id: stats.id,
                name: stats.name,
                code: stats.code,
                totalPaid,
                totalProductAmount,
                totalKg,
                averageKg,
                productTxnCount,
                currentDebt: parseFloat(stats.currentDebt) || 0,
                is_reesto: stats.is_reesto,
                performanceScore
            };
        });

        const res = NextResponse.json(reportData);
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return res;
    } catch (error: any) {
        console.error('Reports API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
