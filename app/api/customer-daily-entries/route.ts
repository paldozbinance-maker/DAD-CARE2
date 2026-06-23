import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

// Get unprocessed daily book entries for a specific customer.
//
// ── PAIR RULE ──────────────────────────────────────────────────────────────
// Dates are processed in pairs of 2 consecutive days (e.g. Jun 20 + Jun 21,
// then Jun 22 + Jun 23).  A pair is only released when BOTH of its dates
// are strictly in the past (< today).  A lone trailing date (odd count) is
// withheld until its twin appears tomorrow.
// Today's date is NEVER included, even if saved in the daily book.
// ──────────────────────────────────────────────────────────────────────────
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
        // 1. Fetch all DailyBookItems for this customer
        const { data: items, error } = await supabase
            .from('DailyBookItem')
            .select(`
                kg,
                note,
                daily_book:DailyBook (date)
            `)
            .eq('customer_id', customerId)
            .order('daily_book(date)', { ascending: true });

        if (error) throw error;

        // 2. Fetch already-processed dates from the Ledger
        const { data: ledgerEntries } = await supabase
            .from('Ledger')
            .select('reference_date')
            .eq('customer_id', customerId)
            .eq('type', 'PRODUCT');

        const processedDates = new Set(
            ledgerEntries?.map((le: any) => le.reference_date) || []
        );

        // 3. Today's date string (YYYY-MM-DD) — used to exclude today and future
        const todayStr = new Date().toISOString().split('T')[0];

        // 4. Build the list of unprocessed past entries, sorted oldest-first
        const pastUnprocessed = (items || [])
            .map((item: any) => ({
                date: item.daily_book?.date as string,
                kg: item.kg as number,
                note: (item.note as string | null) ?? null,
                processed: false,
            }))
            .filter((item) => item.date && item.date < todayStr && !processedDates.has(item.date))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 5. Apply the PAIR RULE: only release complete pairs.
        //    Iterate in steps of 2; a lone final date is withheld.
        const result: typeof pastUnprocessed = [];
        for (let i = 0; i + 1 < pastUnprocessed.length; i += 2) {
            result.push(pastUnprocessed[i]);
            result.push(pastUnprocessed[i + 1]);
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Fetch Customer Daily Entries Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
