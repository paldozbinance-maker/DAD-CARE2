import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

// Get unprocessed daily book entries for a specific customer.
//
// ── PAIR RULE ──────────────────────────────────────────────────────────────
// Dates are paired mathematically using a HARDCODED epoch of 2026-06-28.
// Every even offset from epoch = Day 1 of pair, next day = Day 2.
// Pairs: Jun28+Jun29, Jun30+Jul01, Jul02+Jul03, Jul04+Jul05, ...
// A pair is only released when BOTH dates are in the past (< today).
// If Day 1 is unprocessed but Day 2 is missing from DB, it is INJECTED (0 KG).
// ──────────────────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

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
        // Get today's date in Africa/Mogadishu timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Mogadishu',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const todayStr = `${year}-${month}-${day}`;

        // HARDCODED epoch: Jun 28, 2026 = Day 0 (even offset = pair start)
        // This must NEVER change. It defines the global pair schedule forever.
        const EPOCH = new Date('2026-06-28');

        // Fetch all unprocessed items for this customer (before today, not yet in Ledger)
        const query = `
            SELECT TO_CHAR(db.date, 'YYYY-MM-DD') as date, dbi.kg, dbi.note
            FROM "DailyBookItem" dbi
            JOIN "DailyBook" db ON dbi.daily_book_id = db.id
            WHERE dbi.customer_id = $1
              AND db.date::date < $2::date
              ${startDate ? 'AND db.date::date >= $3::date' : ''}
              AND db.deleted_at IS NULL
              AND NOT EXISTS (
                  SELECT 1 FROM "Ledger" l
                  WHERE l.customer_id = dbi.customer_id
                    AND (
                        l.reference_date::date = db.date::date
                        OR
                        (l.reference_date::timestamptz AT TIME ZONE 'Africa/Mogadishu')::date = db.date::date
                    )
                    AND l.type = 'PRODUCT'
                    AND l.deleted_at IS NULL
              )
            ORDER BY db.date ASC
        `;

        const params = startDate ? [customerId, todayStr, startDate] : [customerId, todayStr];
        const { rows: items } = await pool.query(query, params);

        // Map and deduplicate
        const uniqueDatesMap = new Map<string, { date: string; kg: number; note: string | null; processed: boolean }>();
        for (const item of items) {
            const dateKey = item.date as string;
            if (!uniqueDatesMap.has(dateKey)) {
                uniqueDatesMap.set(dateKey, {
                    date: dateKey,
                    kg: Number(item.kg),
                    note: (item.note as string | null) ?? null,
                    processed: false,
                });
            }
        }
        const pastUnprocessed = Array.from(uniqueDatesMap.values());

        // ── MATHEMATICAL PAIR RULE ──
        // Calculate offset of firstItem from EPOCH to determine which slot in the pair it occupies.
        const result: typeof pastUnprocessed = [];

        if (pastUnprocessed.length > 0) {
            const firstItem = pastUnprocessed[0];
            const firstDate = new Date(firstItem.date);

            // Days since epoch (integer)
            const diffDays = Math.round((firstDate.getTime() - EPOCH.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays % 2 === 0) {
                // firstItem is the FIRST day of a pair — find or inject its twin (next day)
                const twinDate = new Date(firstDate);
                twinDate.setUTCDate(twinDate.getUTCDate() + 1);
                const twinDateStr = twinDate.toISOString().substring(0, 10);

                // Only release the pair if twin date is already in the past
                if (twinDateStr < todayStr) {
                    result.push(firstItem);

                    const existingTwin = pastUnprocessed.find(i => i.date === twinDateStr);
                    if (existingTwin) {
                        result.push(existingTwin);
                    } else {
                        // Check if it's missing because it's ALREADY in the Ledger
                        const { rows: ledgerCheck } = await pool.query(`
                            SELECT 1 FROM "Ledger"
                            WHERE customer_id = $1
                              AND (
                                  reference_date::date = $2::date
                                  OR
                                  (reference_date::timestamptz AT TIME ZONE 'Africa/Mogadishu')::date = $2::date
                              )
                              AND type = 'PRODUCT'
                              AND deleted_at IS NULL
                        `, [customerId, twinDateStr]);

                        if (ledgerCheck.length === 0) {
                            // Truly missing (no ledger, no daily book) -> Inject 0 KG
                            result.push({
                                date: twinDateStr,
                                kg: 0,
                                note: null,
                                processed: false,
                            });
                        }
                        // If it IS in the ledger, we just leave it alone. The UI will process Day 1 as an orphan.
                    }
                }
                // If twin not yet in the past, withhold everything (not ready yet)
            } else {
                // firstItem is the SECOND day of a pair — its partner was already processed.
                // Return it alone as an orphan so the user can clear it.
                result.push(firstItem);
            }
        }

        // Build allUnprocessedDates list for the UI date picker
        const allUnprocessedDates = pastUnprocessed.map(d => d.date);
        // If we injected a twin, add it to the list too
        if (result.length === 2 && !allUnprocessedDates.includes(result[1].date)) {
            allUnprocessedDates.push(result[1].date);
            allUnprocessedDates.sort();
        }

        const res = NextResponse.json(result, {
            headers: {
                'x-all-unprocessed-dates': JSON.stringify(allUnprocessedDates),
            }
        });
        res.headers.set('Cache-Control', 'no-store');
        return res;
    } catch (error: any) {
        console.error('Fetch Customer Daily Entries Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
