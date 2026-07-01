import pool from '@/lib/db';
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

    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch unprocessed items in a single blazing fast query!
        // We get items from DailyBookItem + DailyBook that are before today
        // AND not already in Ledger (type = PRODUCT, deleted_at is null).
        const query = `
            SELECT TO_CHAR(db.date, 'YYYY-MM-DD') as date, dbi.kg, dbi.note
            FROM "DailyBookItem" dbi
            JOIN "DailyBook" db ON dbi.daily_book_id = db.id
            WHERE dbi.customer_id = $1 
              AND db.date < $2
              ${startDate ? 'AND db.date >= $3' : ''}
              AND NOT EXISTS (
                  SELECT 1 FROM "Ledger" l 
                  WHERE l.customer_id = dbi.customer_id 
                    AND l.reference_date = db.date 
                    AND l.type = 'PRODUCT' 
                    AND l.deleted_at IS NULL
              )
            ORDER BY db.date ASC
        `;
        
        const params = startDate ? [customerId, todayStr, startDate] : [customerId, todayStr];
        const { rows: items } = await pool.query(query, params);

        let pastUnprocessed = items.map(item => ({
            date: item.date as string,
            kg: Number(item.kg),
            note: (item.note as string | null) ?? null,
            processed: false,
        }));

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

