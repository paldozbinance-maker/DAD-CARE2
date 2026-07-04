import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const supabase = await createClient();

    try {
        // Fetch all customers
        const { data: customers, error: custError } = await supabase
            .from('Customer')
            .select('id, name, customer_code');

        if (custError) throw custError;

        // Fetch all ledger entries to calculate metrics
        const { data: allLedger, error: ledgerError } = await supabase
            .from('Ledger')
            .select('customer_id, type, kg, amount, new_debt, created_at, id')
            .order('created_at', { ascending: false })
            .order('id', { ascending: false });

        if (ledgerError) throw ledgerError;

        // Group ledger entries by customer
        const customerStats: Record<string, any> = {};

        // Initialize
        customers.forEach(cust => {
            customerStats[cust.id] = {
                id: cust.id,
                name: cust.name,
                code: cust.customer_code,
                totalPaid: 0,
                totalKg: 0,
                totalProductAmount: 0,
                productTxnCount: 0,
                currentDebt: 0,
                hasDebtRecord: false
            };
        });

        // The query is ordered descending, so the FIRST entry we see for a customer
        // is their latest, which gives us their current balance.
        allLedger.forEach(entry => {
            const stats = customerStats[entry.customer_id];
            if (!stats) return;

            // Capture the latest new_debt as the current debt
            if (!stats.hasDebtRecord) {
                stats.currentDebt = entry.new_debt || 0;
                stats.is_reesto = entry.type === 'PAYMENT';
                stats.hasDebtRecord = true;
            }

            if (entry.type === 'PRODUCT') {
                stats.totalKg += (entry.kg || 0);
                stats.totalProductAmount += (entry.amount || 0);
                stats.productTxnCount += 1;
            } else if (entry.type === 'PAYMENT') {
                stats.totalPaid += (entry.amount || 0);
            }
        });

        const reportData = Object.values(customerStats).map(stats => {
            // Calculate averages
            const averageKg = stats.productTxnCount > 0 ? (stats.totalKg / stats.productTxnCount) : 0;
            
            // Performance logic (CORRECTED):
            // Performance = how much of the PRODUCT charges (what they consumed) have they paid?
            // This ignores Initial Debt Setups (ADJUSTMENT entries) which are old pre-existing debts.
            //
            // Example: Customer bought $700 worth of product and paid $700 → 100% (GREEN)
            //   even if they have an old $1,365 initial debt setup. They paid what they consumed NOW.
            //
            // Formula: totalPaid / totalProductAmount * 100
            const totalProductAmount = stats.totalProductAmount;
            let performanceScore = 0;

            if (totalProductAmount === 0 && stats.totalPaid === 0) {
                // No activity at all
                performanceScore = 100;
            } else if (totalProductAmount === 0 && stats.totalPaid > 0) {
                // Paid something but no product entries (maybe pre-payment) → excellent
                performanceScore = 100;
            } else {
                // Core formula: paid vs what they consumed as products
                performanceScore = Math.min((stats.totalPaid / totalProductAmount) * 100, 100);
            }

            return {
                id: stats.id,
                name: stats.name,
                code: stats.code,
                totalPaid: stats.totalPaid,
                totalProductAmount: totalProductAmount,
                totalKg: stats.totalKg,
                averageKg: averageKg,
                productTxnCount: stats.productTxnCount,
                currentDebt: stats.currentDebt,
                is_reesto: stats.is_reesto,
                performanceScore: performanceScore
            };
        });

        const res = NextResponse.json(reportData);
        res.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
        return res;
    } catch (error: any) {
        console.error('Reports API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
