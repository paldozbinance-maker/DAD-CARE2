import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/sessions-store';

export const dynamic = 'force-dynamic';

const getDashboardData = async (today: string) => {
    try {
        // Run queries concurrently for maximum speed
        const [
            totalCustomersResult,
            totalDebtResult,
            totalReestoResult,
            totalPaidResult,
            totalKgResult,
            todayStatsResult,
            topDebtorsResult,
            recentTransactionsResult
        ] = await Promise.all([
            // 1. Total customers count
            pool.query('SELECT count(*)::int as count FROM "Customer"'),
            
            // 2. Total Current Debt (Lacagta Guud)
            pool.query(`
                SELECT COALESCE(SUM(new_debt), 0)::float as total_debt
                FROM (
                    SELECT DISTINCT ON (customer_id) 
                        new_debt,
                        (type = 'PAYMENT') as is_reesto
                    FROM "Ledger"
                    ORDER BY customer_id, created_at DESC, id DESC
                ) latest_balances
                WHERE is_reesto = false AND new_debt != 0
            `),

            // 2b. Total Reesto
            pool.query(`
                SELECT ABS(COALESCE(SUM(new_debt), 0))::float as total_reesto
                FROM (
                    SELECT DISTINCT ON (customer_id) 
                        new_debt,
                        (type = 'PAYMENT') as is_reesto
                    FROM "Ledger"
                    ORDER BY customer_id, created_at DESC, id DESC
                ) latest_balances
                WHERE is_reesto = true AND new_debt != 0
            `),

            // 3. Total Payments
            pool.query(`
                SELECT COALESCE(SUM(amount), 0)::float as total_paid
                FROM "Ledger"
                WHERE type = 'PAYMENT'
            `),

            // 4. Total KG all time
            pool.query(`
                SELECT COALESCE(SUM(kg), 0)::float as total_kg
                FROM "Ledger"
                WHERE type = 'PRODUCT'
            `),

            // 5. Today's daily book stats (KG and active customer count)
            pool.query(`
                SELECT 
                    COALESCE(SUM(dbi.kg), 0)::float as today_kg, 
                    COUNT(dbi.id)::int as today_customer_count
                FROM "DailyBookItem" dbi
                JOIN "DailyBook" db ON dbi.daily_book_id = db.id
                WHERE db.date = $1
            `, [today]),

            // 6. Top Debtors — percentage_paid based on LATEST receipt only (not all-time)
            pool.query(`
                WITH LatestProductReceipt AS (
                    SELECT DISTINCT ON (customer_id)
                        customer_id,
                        receipt_id,
                        created_at as receipt_created_at
                    FROM "Ledger"
                    WHERE type = 'PRODUCT' AND deleted_at IS NULL AND receipt_id IS NOT NULL
                    ORDER BY customer_id, created_at DESC
                ),
                LatestMaqal AS (
                    SELECT 
                        lpr.customer_id,
                        SUM(l.amount)::float as latest_maqal
                    FROM LatestProductReceipt lpr
                    JOIN "Ledger" l ON l.customer_id = lpr.customer_id 
                        AND l.receipt_id = lpr.receipt_id 
                        AND l.type = 'PRODUCT' 
                        AND l.deleted_at IS NULL
                    GROUP BY lpr.customer_id
                ),
                LatestPayments AS (
                    SELECT 
                        lpr.customer_id,
                        SUM(l.amount)::float as latest_payments
                    FROM LatestProductReceipt lpr
                    JOIN "Ledger" l ON l.customer_id = lpr.customer_id 
                        AND l.type = 'PAYMENT' 
                        AND l.deleted_at IS NULL
                        AND l.created_at >= lpr.receipt_created_at
                    GROUP BY lpr.customer_id
                )
                SELECT 
                    l.customer_id as id, 
                    c.name, 
                    c.customer_code as code, 
                    l.new_debt::float as debt,
                    l.is_reesto,
                    COALESCE(lp.latest_payments, 0) as total_payments,
                    COALESCE(lm.latest_maqal, 0) as total_maqal,
                    CASE 
                        WHEN COALESCE(lm.latest_maqal, 0) = 0 THEN 0
                        ELSE LEAST(100, ROUND((COALESCE(lp.latest_payments, 0) / lm.latest_maqal) * 100))
                    END as percentage_paid
                FROM (
                    SELECT DISTINCT ON (customer_id) 
                        customer_id, 
                        new_debt,
                        (type = 'PAYMENT') as is_reesto
                    FROM "Ledger"
                    WHERE deleted_at IS NULL
                    ORDER BY customer_id, created_at DESC, id DESC
                ) l
                JOIN "Customer" c ON l.customer_id = c.id
                LEFT JOIN LatestMaqal lm ON l.customer_id = lm.customer_id
                LEFT JOIN LatestPayments lp ON l.customer_id = lp.customer_id
                WHERE l.new_debt != 0 OR COALESCE(lm.latest_maqal, 0) > 0
            `),

            // 7. Recent transactions (last 5)
            pool.query(`
                SELECT 
                    l.*, 
                    c.name as "customerName"
                FROM "Ledger" l
                JOIN "Customer" c ON l.customer_id = c.id
                ORDER BY l.created_at DESC
                LIMIT 5
            `)
        ]);

        const totalCustomers = totalCustomersResult.rows[0]?.count || 0;
        const totalDebt = totalDebtResult.rows[0]?.total_debt || 0;
        const totalReesto = totalReestoResult.rows[0]?.total_reesto || 0;
        const totalPaid = totalPaidResult.rows[0]?.total_paid || 0;
        const totalKg = totalKgResult.rows[0]?.total_kg || 0;
        const todayKg = todayStatsResult.rows[0]?.today_kg || 0;
        const todayCustomerCount = todayStatsResult.rows[0]?.today_customer_count || 0;
        const topDebtors = topDebtorsResult.rows || [];

        // Map recent transactions format back to what the frontend expects
        const recentTransactions = recentTransactionsResult.rows.map(row => ({
            id: row.id,
            customer_id: row.customer_id,
            type: row.type,
            reference_date: row.reference_date,
            kg: row.kg,
            price_per_kg: row.price_per_kg,
            amount: row.amount,
            previous_debt: row.previous_debt,
            new_debt: row.new_debt,
            note: row.note,
            created_at: row.created_at,
            customer: {
                name: row.customerName
            }
        }));

        return {
            totalCustomers,
            totalDebt,
            totalReesto,
            totalPaid,
            totalKg,
            todayKg,
            todayCustomerCount,
            topDebtors,
            recentTransactions
        };
    } catch (e) {
        throw e;
    }
};

export async function GET(request: Request) {
    // Double-check auth even though middleware already guards this route
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieToken = cookieHeader.match(/dadwork_session=([^;]+)/)?.[1];
    const token = cookieToken || request.headers.get('x-session-token');
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await validateSession(token);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {

        const today = new Date().toISOString().split('T')[0];
        
        const data = await getDashboardData(today);

        const response = NextResponse.json(data);
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;

    } catch (error: any) {
        console.error('Dashboard Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch dashboard' }, { status: 500 });
    }
}
