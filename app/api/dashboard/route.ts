import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/sessions-store';
import { trackApiRoute } from '@/lib/egress-tracker';

const getDashboardData = async (today: string) => {
    try {
        // Run queries concurrently for maximum speed
        const [
            totalCustomersResult,
            totalDebtResult,
            totalReestoResult,
            totalPaidResult,
            totalKgResult,
            todayStatsResult
        ] = await Promise.all([
            // 1. Total customers count
            pool.query('SELECT count(*)::int as count FROM "Customer" WHERE deleted_at IS NULL'),
            
            // 2. Total Current Debt (Lacagta Guud) — sum of all customers with positive balance
            pool.query(`
                SELECT COALESCE(SUM(CASE WHEN new_debt > 0 THEN new_debt ELSE 0 END), 0)::float as total_debt
                FROM (
                    SELECT DISTINCT ON (customer_id) new_debt
                    FROM "Ledger"
                    WHERE deleted_at IS NULL
                    ORDER BY customer_id, created_at DESC, id DESC
                ) latest_balances
            `),

            // 2b. Total Reesto — sum of all customers who have overpaid (negative balance)
            pool.query(`
                SELECT ABS(COALESCE(SUM(CASE WHEN new_debt < 0 THEN new_debt ELSE 0 END), 0))::float as total_reesto
                FROM (
                    SELECT DISTINCT ON (customer_id) new_debt
                    FROM "Ledger"
                    WHERE deleted_at IS NULL
                    ORDER BY customer_id, created_at DESC, id DESC
                ) latest_balances
            `),

            // 3. Total Payments
            pool.query(`
                SELECT COALESCE(SUM(amount), 0)::float as total_paid
                FROM "Ledger"
                WHERE type = 'PAYMENT' AND deleted_at IS NULL
            `),

            // 4. Total KG all time
            pool.query(`
                SELECT COALESCE(SUM(kg), 0)::float as total_kg
                FROM "Ledger"
                WHERE type = 'PRODUCT' AND deleted_at IS NULL
            `),

            // 5. Today's daily book stats (KG and active customer count)
            pool.query(`
                SELECT 
                    COALESCE(SUM(dbi.kg), 0)::float as today_kg, 
                    COUNT(dbi.id)::int as today_customer_count
                FROM "DailyBookItem" dbi
                JOIN "DailyBook" db ON dbi.daily_book_id = db.id
                WHERE db.date = $1 AND dbi.deleted_at IS NULL AND db.deleted_at IS NULL
            `, [today]),

            // Removed topDebtors and recentTransactions to save massive egress bandwidth, 
            // since the dashboard UI no longer renders them (moved to reports).
        ]);

        const totalCustomers = totalCustomersResult.rows[0]?.count || 0;
        const totalDebt = totalDebtResult.rows[0]?.total_debt || 0;
        const totalReesto = totalReestoResult.rows[0]?.total_reesto || 0;
        const totalPaid = totalPaidResult.rows[0]?.total_paid || 0;
        const totalKg = totalKgResult.rows[0]?.total_kg || 0;
        const todayKg = todayStatsResult.rows[0]?.today_kg || 0;
        const todayCustomerCount = todayStatsResult.rows[0]?.today_customer_count || 0;
        const topDebtors: any[] = [];
        const recentTransactions: any[] = [];

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

export const GET = trackApiRoute('/api/dashboard', async (request: Request) => {
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
        // Cache dashboard data for 10 minutes to save egress (dashboard data is not real-time critical)
        response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
        return response;

    } catch (error: any) {
        console.error('Dashboard Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch dashboard' }, { status: 500 });
    }
});
