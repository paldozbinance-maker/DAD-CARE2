import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const customerId = searchParams.get('customerId');

    const supabase = await createClient();

    try {
        let query = supabase
            .from('Ledger')
            .select('*, customer:Customer(id, name, customer_code)')
            .eq('type', 'PAYMENT')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (customerId) {
            query = query.eq('customer_id', customerId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Calculate today's total
        const today = new Date().toISOString().split('T')[0];
        const todayPayments = data?.filter(p => 
            p.created_at?.startsWith(today)
        ).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Total all-time payments
        const { data: allPayments, error: allError } = await supabase
            .from('Ledger')
            .select('amount')
            .eq('type', 'PAYMENT');

        if (allError) throw allError;

        const totalAllTime = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        return NextResponse.json({
            payments: data || [],
            todayTotal: todayPayments,
            totalAllTime,
            count: data?.length || 0
        });
    } catch (error: any) {
        console.error('Payments Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
        const { customerId, amount, note, date } = body;
        const supabase = await createClient();

        try {
            if (!customerId || !amount) {
                return NextResponse.json({ error: 'Customer and amount required' }, { status: 400 });
            }

        // Get previous debt
        const { data: lastEntry } = await supabase
            .from('Ledger')
            .select('new_debt')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(1);

        const previousDebt = lastEntry?.[0]?.new_debt || 0;
        const paymentAmount = Math.round(parseFloat(amount));
        const newDebt = Math.round(previousDebt - paymentAmount);

        const refDate = date || new Date().toISOString().split('T')[0];

        const { error: insertError } = await supabase
            .from('Ledger')
            .insert({
                customer_id: customerId,
                type: 'PAYMENT',
                reference_date: refDate,
                amount: paymentAmount,
                previous_debt: previousDebt,
                new_debt: newDebt,
                note: note || null,
                receipt_id: body.receipt_id || null
            });

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, newDebt });
    } catch (error: any) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
