import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Get customers with their KG for a specific date
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
        return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        // Get the daily book for this date
        const { data: book, error: bookError } = await supabase
            .from('DailyBook')
            .select('id')
            .eq('date', dateStr)
            .single();

        if (bookError || !book) {
            return NextResponse.json([]);
        }

        // Get all items with customer data for this date
        const { data: items, error: itemsError } = await supabase
            .from('DailyBookItem')
            .select(`
                customer_id,
                kg,
                customer:Customer (id, name, customer_code)
            `)
            .eq('daily_book_id', book.id);

        if (itemsError) throw itemsError;

        return NextResponse.json(items || []);
    } catch (error: any) {
        console.error('Fetch Customers By Date Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
