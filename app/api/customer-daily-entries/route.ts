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
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Mogadishu', year: 'numeric', month: '2-digit', day: '2-digit' });
        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const todayStr = `${year}-${month}-${day}`;

        // Fetch unprocessed items AND global pair index in a single query
        const query = `
            WITH past_dates AS (
                SELECT DISTINCT date::date as db_date
                FROM "DailyBook"
                WHERE deleted_at IS NULL AND date::date < $2::date
            ),
            numbered_dates AS (
                SELECT db_date, ROW_NUMBER() OVER (ORDER BY db_date DESC) as rn
                FROM past_dates
            ),
            global_pairs AS (
                SELECT db_date, CEIL(rn / 2.0) as pair_index
                FROM numbered_dates
            ),
            customer_unprocessed AS (
                SELECT gp.pair_index, TO_CHAR(db.date, 'YYYY-MM-DD') as date, dbi.kg, dbi.note
                FROM "DailyBookItem" dbi
                JOIN "DailyBook" db ON dbi.daily_book_id = db.id
                JOIN global_pairs gp ON gp.db_date = db.date::date
                WHERE dbi.customer_id = $1 
                  ${startDate ? 'AND db.date::date >= $3::date' : ''}
                  AND NOT EXISTS (
                      SELECT 1 FROM "Ledger" l 
                      WHERE l.customer_id = dbi.customer_id 
                        AND l.reference_date::date = db.date::date 
                        AND l.type = 'PRODUCT' 
                        AND l.deleted_at IS NULL
                  )
            )
            SELECT * FROM customer_unprocessed
            ORDER BY date ASC
        `;
        
        const params = startDate ? [customerId, todayStr, startDate] : [customerId, todayStr];
        const { rows: items } = await pool.query(query, params);

        let rawUnprocessed = items.map(item => ({
            date: item.date as string,
            kg: Number(item.kg),
            note: (item.note as string | null) ?? null,
            pair_index: Number(item.pair_index),
            processed: false,
        }));

        // Deduplicate defensively (in case multiple DailyBook rows exist for the same date due to race conditions)
        const uniqueDatesMap = new Map<string, typeof rawUnprocessed[0]>();
        for (const item of rawUnprocessed) {
            uniqueDatesMap.set(item.date, item);
        }
        let pastUnprocessed = Array.from(uniqueDatesMap.values());

        // 6. Apply the PAIR RULE: only release complete pairs based on GLOBAL boundaries.
        // We find the oldest pair_index, and return all unprocessed dates belonging to that pair_index.
        const result: Omit<typeof pastUnprocessed[0], 'pair_index'>[] = [];
        if (pastUnprocessed.length > 0) {
            // Because it's ordered by date ASC, the first item has the oldest date (which has the HIGHEST pair_index)
            const oldestPairIndex = pastUnprocessed[0].pair_index;
            
            // Collect all dates that belong to this exact same global pair
            for (const item of pastUnprocessed) {
                if (item.pair_index === oldestPairIndex) {
                    const { pair_index, ...cleanItem } = item;
                    result.push(cleanItem);
                }
            }
        }

        // 7. Also return allUnprocessedDates so the frontend can build a date picker
        const allUnprocessedDates = pastUnprocessed.map(d => d.date);

        const res = NextResponse.json(result, {
            headers: {
                'x-all-unprocessed-dates': JSON.stringify(allUnprocessedDates),
            }
        });
        res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
        return res;
    } catch (error: any) {
        console.error('Fetch Customer Daily Entries Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

