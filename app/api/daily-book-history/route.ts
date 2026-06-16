import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const supabase = await createClient();

    try {
        const { data: books, error: booksError } = await supabase
            .from('DailyBook')
            .select(`
                id, 
                date,
                items:DailyBookItem (
                    id,
                    kg,
                    present,
                    note,
                    customer:Customer (
                        id,
                        name,
                        customer_code,
                        gender,
                        avatar_url
                    )
                )
            `)
            .order('date', { ascending: false });

        if (booksError) throw booksError;

        // Transform data to match the SavedEntry format expected by the frontend
        const history = books.map((book: any) => {
            const totalKg = book.items.reduce((sum: number, item: any) => sum + (item.kg || 0), 0);
            return {
                id: book.id,
                date: book.date,
                totalKg: totalKg,
                items: book.items.map((item: any) => ({
                    customer_id: item.customer?.id,
                    kg: item.kg,
                    present: item.present,
                    note: item.note,
                    customer: item.customer
                }))
            };
        });

        return NextResponse.json(history);
    } catch (error: any) {
        console.error('Fetch Daily Book History Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
