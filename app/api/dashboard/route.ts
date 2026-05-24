import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Total customers
        const { count: totalCustomers } = await supabase
            .from('Customer')
            .select('*', { count: 'exact', head: true });

        // 2. Get all ledger entries for aggregation
        const { data: allLedger, error: ledgerError } = await supabase
            .from('Ledger')
            .select('customer_id, type, amount, new_debt, kg');

        if (ledgerError) throw ledgerError;

        // 3. Calculate running balances per customer using historical sum
        const customerBalances: Record<string, number> = {};
        allLedger?.forEach(entry => {
            const current = customerBalances[entry.customer_id] || 0;
            if (entry.type === 'PRODUCT' || entry.type === 'ADJUSTMENT') {
                customerBalances[entry.customer_id] = current + (entry.amount || 0);
            } else if (entry.type === 'PAYMENT') {
                customerBalances[entry.customer_id] = current - (entry.amount || 0);
            }
        });

        // 4. Calculate total stats
        const totalCurrentDebt = Object.values(customerBalances)
            .filter(balance => balance > 0) // Only count what is actually OWED to us
            .reduce((sum, b) => sum + b, 0);

        const totalPayments = allLedger
            ?.filter(e => e.type === 'PAYMENT')
            .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        const totalKgAllTime = allLedger
            ?.filter(e => e.type === 'PRODUCT')
            .reduce((sum, e) => sum + (e.kg || 0), 0) || 0;

        // 5. Get current state for Top Debtors
        // (We still need the latest new_debt to correctly identify the current state for the list)
        const latestDebtPerCustomer: Record<string, number> = {};
        const { data: latestEntries } = await supabase
            .from('Ledger')
            .select('customer_id, new_debt')
            .order('created_at', { ascending: false });

        const seenInList = new Set<string>();
        latestEntries?.forEach(entry => {
            if (!seenInList.has(entry.customer_id)) {
                seenInList.add(entry.customer_id);
                latestDebtPerCustomer[entry.customer_id] = entry.new_debt || 0;
            }
        });

        // 5. Top 5 debtors
        const { data: customers } = await supabase
            .from('Customer')
            .select('id, name, customer_code');

        const customerMap: Record<string, { name: string; code: string }> = {};
        customers?.forEach(c => {
            customerMap[c.id] = { name: c.name, code: c.customer_code };
        });

        const topDebtors = Object.entries(latestDebtPerCustomer)
            .map(([id, debt]) => ({
                id,
                name: customerMap[id]?.name || 'Unknown',
                code: customerMap[id]?.code || '',
                debt
            }))
            .filter(d => d.debt > 0)
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 50);

        // 6. Today's daily book
        const today = new Date().toISOString().split('T')[0];
        const { data: todayBook } = await supabase
            .from('DailyBook')
            .select('id')
            .eq('date', today)
            .single();

        let todayKg = 0;
        let todayCustomerCount = 0;

        if (todayBook) {
            const { data: todayItems } = await supabase
                .from('DailyBookItem')
                .select('kg')
                .eq('daily_book_id', todayBook.id);

            todayKg = todayItems?.reduce((sum, i) => sum + (i.kg || 0), 0) || 0;
            todayCustomerCount = todayItems?.length || 0;
        }

        // 7. Recent transactions (last 5)
        const { data: recentTxns } = await supabase
            .from('Ledger')
            .select('*, customer:Customer(name)')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            totalCustomers: totalCustomers || 0,
            totalDebt: totalCurrentDebt,
            totalPaid: totalPayments,
            totalKg: totalKgAllTime,
            todayKg,
            todayCustomerCount,
            topDebtors,
            recentTransactions: recentTxns || []
        });
    } catch (error: any) {
        console.error('Dashboard Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
