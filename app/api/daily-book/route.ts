import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    const supabase = await createClient();

    // Get Book
    const { data: book, error: bookError } = await supabase
        .from('DailyBook')
        .select('*')
        .eq('date', dateStr)
        .single();

    if (bookError && bookError.code !== 'PGRST116') { // PGRST116 is 'not found'
        console.error('Fetch Book Error:', bookError);
        return NextResponse.json({ error: bookError.message }, { status: 500 });
    }

    if (!book) return NextResponse.json(null);

    // Get Items with Customer data
    const { data: items, error: itemsError } = await supabase
        .from('DailyBookItem')
        .select(`
        *,
        customer:Customer (id, name, customer_code)
    `)
        .eq('daily_book_id', book.id);

    if (itemsError) {
        console.error('Fetch Items Error:', itemsError);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ ...book, items });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { date: dateStr, items } = body;
    const supabase = await createClient();

    try {
        // 1. Get or Create DailyBook
        let { data: book, error: findError } = await supabase
            .from('DailyBook')
            .select('id')
            .eq('date', dateStr)
            .single();

        if (!book) {
            const { data: newBook, error: createError } = await supabase
                .from('DailyBook')
                .insert({ date: dateStr })
                .select('id')
                .single();
            if (createError) throw createError;
            book = newBook;
        }

        // 2. Delete existing items for this book (Draft mode overwrite)
        await supabase.from('DailyBookItem').delete().eq('daily_book_id', book.id);

        // 3. Insert new items
        if (items && items.length > 0) {
            const itemsToInsert = items
                .filter((i: any) => i.kg > 0 || i.present === false || (i.note && i.note.trim() !== ''))
                .map((i: any) => ({
                    daily_book_id: book.id,
                    customer_id: i.customer_id,
                    kg: parseFloat(i.kg) || 0,
                    present: i.present !== false, // true by default
                    note: i.note || null
                }));

            if (itemsToInsert.length > 0) {
                const { error: insertError } = await supabase.from('DailyBookItem').insert(itemsToInsert);
                if (insertError) throw insertError;
            }
        }

        await logAudit(request, 'SAVE_DAILY_BOOK', `Saved daily book entry for ${dateStr} with ${itemsToInsert?.length || 0} items`);
        return NextResponse.json({ success: true, bookId: book.id });
    } catch (error: any) {
        console.error('Save DailyBook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    const supabase = await createClient();
    try {
        // First get the book ID
        const { data: book, error: findError } = await supabase
            .from('DailyBook')
            .select('id')
            .eq('date', dateStr)
            .single();

        if (findError || !book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        // Must delete child items first to avoid foreign key constraint errors!
        const { error: itemsError } = await supabase.from('DailyBookItem').delete().eq('daily_book_id', book.id);
        if (itemsError) throw itemsError;

        // Now safe to delete the main book
        const { error: bookError } = await supabase.from('DailyBook').delete().eq('id', book.id);
        if (bookError) throw bookError;

        await logAudit(request, 'DELETE_DAILY_BOOK', `Deleted daily book entry for ${dateStr}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
