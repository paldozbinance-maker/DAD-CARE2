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
//
// ── OPTIONAL: startDate ────────────────────────────────────────────────────
// If ?startDate=YYYY-MM-DD is provided, only dates >= startDate are returned.
// The pair rule still applies on the filtered subset.
// ──────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate'); // Optional: YYYY-MM-DD

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
        let pastUnprocessed = (items || [])
            .map((item: any) => ({
                date: item.daily_book?.date as string,
                kg: item.kg as number,
                note: (item.note as string | null) ?? null,
                processed: false,
            }))
            .filter((item) => item.date && item.date < todayStr && !processedDates.has(item.date))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 5. If startDate is specified, filter to only dates >= startDate
        if (startDate) {
            pastUnprocessed = pastUnprocessed.filter((item) => item.date >= startDate);
        }

        // 6. Apply the PAIR RULE: only release complete pairs.
        //    We strictly return a maximum of 2 dates (1 pair) to force sequential processing.
        const result: typeof pastUnprocessed = [];
        if (pastUnprocessed.length >= 2) {
            result.push(pastUnprocessed[0]);
            result.push(pastUnprocessed[1]);
        }

        // 7. Also return allUnprocessedDates so the frontend can build a date picker
        const allUnprocessedDates = pastUnprocessed.map(d => d.date);

        return NextResponse.json(result, {
            headers: {
                'x-all-unprocessed-dates': JSON.stringify(allUnprocessedDates),
            }
        });
    } catch (error: any) {
        console.error('Fetch Customer Daily Entries Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

