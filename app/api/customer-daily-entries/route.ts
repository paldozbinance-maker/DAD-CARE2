import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

// Get all daily book entries for a specific customer (dates with KG values)
export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        // Get all DailyBookItems for this customer with their DailyBook date
        const { data: items, error } = await supabase
            .from('DailyBookItem')
            .select(`
                kg,
                daily_book:DailyBook (date)
            `)
            .eq('customer_id', customerId)
            .order('daily_book(date)', { ascending: false });

        if (error) throw error;

        // Get processed dates from Ledger
        const { data: ledgerEntries } = await supabase
            .from('Ledger')
            .select('reference_date')
            .eq('customer_id', customerId)
            .eq('type', 'PRODUCT');

        const processedDates = new Set(ledgerEntries?.map(le => le.reference_date) || []);

        // Transform to simpler format
        const result = (items || []).map((item: any) => ({
            date: item.daily_book?.date,
            kg: item.kg,
            processed: processedDates.has(item.daily_book?.date)
        })).filter((item: any) => item.date);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Fetch Customer Daily Entries Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
