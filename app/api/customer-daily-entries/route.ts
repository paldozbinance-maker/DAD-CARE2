import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

// Get unprocessed daily book entries for a specific customer.
//
// ── PAIR RULE ──────────────────────────────────────────────────────────────
// Dates are paired mathematically using a HARDCODED epoch of 2026-06-28.
// Pairs: Jun28+Jun29, Jun30+Jul01, Jul02+Jul03, Jul04+Jul05, ...
// The GLOBAL ACTIVE PAIR is computed from today's date ONLY.
// All customers always see the same pair (e.g. Jul 02 + Jul 03 today).
// If a date is missing from DB for this customer, it is INJECTED (0 KG).
// ──────────────────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    try {
        // ── STEP 1: Get today in Africa/Mogadishu timezone as YYYY-MM-DD ──
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Africa/Mogadishu',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const todayStr = formatter.format(new Date()); // "2026-07-05"

        // ── STEP 2: Compute the Global Active Pair from today ──
        // EPOCH = Jun 28 2026 (Day 0). Even-offset days = pair start.
        const epochMs = new Date('2026-06-28T00:00:00Z').getTime();
        const todayMs = new Date(`${todayStr}T00:00:00Z`).getTime();
        const diffDaysToday = Math.floor((todayMs - epochMs) / 86400000);

        // Find the most recent even offset where BOTH day and day+1 are strictly < today
        let activeStartOffset = 0;
        for (let i = diffDaysToday - 1; i >= 0; i--) {
            if (i % 2 === 0 && (i + 1) < diffDaysToday) {
                activeStartOffset = i;
                break;
            }
        }

        const pad = (n: number) => String(n).padStart(2, '0');
        const day1Ms = epochMs + activeStartOffset * 86400000;
        const day2Ms = epochMs + (activeStartOffset + 1) * 86400000;

        const toDateStr = (ms: number) => {
            const d = new Date(ms);
            return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
        };

        const day1Str = toDateStr(day1Ms); // e.g. "2026-07-02"
        const day2Str = toDateStr(day2Ms); // e.g. "2026-07-03"

        // ── STEP 3: Fetch DB entries for EXACTLY the two active dates ──
        const query = `
            SELECT TO_CHAR((db.date AT TIME ZONE 'Africa/Mogadishu')::date, 'YYYY-MM-DD') as date,
                   dbi.kg, dbi.note
            FROM "DailyBookItem" dbi
            JOIN "DailyBook" db ON dbi.daily_book_id = db.id
            WHERE dbi.customer_id = $1
              AND (db.date AT TIME ZONE 'Africa/Mogadishu')::date IN ($2::date, $3::date)
              AND db.deleted_at IS NULL
              AND NOT EXISTS (
                  SELECT 1 FROM "Ledger" l
                  WHERE l.customer_id = dbi.customer_id
                    AND (l.reference_date AT TIME ZONE 'Africa/Mogadishu')::date
                          = (db.date AT TIME ZONE 'Africa/Mogadishu')::date
                    AND l.type = 'PRODUCT'
                    AND l.deleted_at IS NULL
              )
            ORDER BY db.date ASC
        `;

        const { rows: items } = await pool.query(query, [customerId, day1Str, day2Str]);

        // Deduplicate by date (first row per date wins)
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

        // ── STEP 4: Build result — always return both dates ──
        const result = [];

        if (uniqueDatesMap.has(day1Str)) {
            result.push(uniqueDatesMap.get(day1Str)!);
        } else {
            result.push({ date: day1Str, kg: 0, note: 'Notebook', processed: false });
        }

        if (uniqueDatesMap.has(day2Str)) {
            result.push(uniqueDatesMap.get(day2Str)!);
        } else {
            result.push({ date: day2Str, kg: 0, note: 'Notebook', processed: false });
        }

        // allUnprocessedDates = the two global active dates (used by the ⏳ label)
        const allUnprocessedDates = [day1Str, day2Str];

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
