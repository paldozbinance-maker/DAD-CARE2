import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

// Returns per-user maqal progress based on assigned_customer_ids.
// SMART PAIR LOGIC:
//   - The ACTIVE pair is the most recent fully-past pair that customers should have been processed for.
//   - The WAITING pair is the next pair after the active one (unlocked when its next-day DailyBook exists).
//   - When the waiting pair becomes unlocked (i.e. a DailyBook entry exists for the day AFTER the waiting pair),
//     the tracker automatically resets to that new pair.
export async function GET(request: NextRequest) {
    try {
        const sessionRes = await requireSession(request);
        if (sessionRes instanceof NextResponse) return sessionRes;

        // 1. Get all users with assigned_customer_ids
        const { rows: users } = await pool.query(`
            SELECT id, username, name, assigned_customer_ids, avatar_url
            FROM "User"
            WHERE assigned_customer_ids IS NOT NULL 
              AND array_length(assigned_customer_ids, 1) > 0
        `);

        if (users.length === 0) {
            return NextResponse.json({ users: [] });
        }

        // 2. Compute the ACTIVE pair using the same epoch + timezone logic as the rest of the system.
        //
        //    EPOCH = 2026-06-28. Each pair is 2 days.
        //    offset = days since epoch in Africa/Mogadishu time.
        //    current pair offset = floor(offset / 2) * 2  → the pair that INCLUDES today
        //    prev pair offset    = current pair offset - 2  → the pair BEFORE today (fully in the past)
        //
        //    WAITING PAIR = the pair AFTER prev pair (= current pair for today)
        //    ACTIVE (display) pair = prev pair — this is what users should have processed.
        //
        //    AUTO-RESET: When a DailyBook entry exists for (waiting_pair_date2 + 1 day),
        //    the waiting pair becomes the new active pair and starts its own tracker.
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Africa/Mogadishu',
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const todayStr = formatter.format(new Date());
        const EPOCH = '2026-06-28';
        const epochMs = new Date(`${EPOCH}T00:00:00Z`).getTime();
        const todayMs = new Date(`${todayStr}T00:00:00Z`).getTime();
        const diffDaysToday = Math.floor((todayMs - epochMs) / 86400000);

        // current pair: the pair that includes today
        const currentPairStartOffset = Math.floor(diffDaysToday / 2) * 2;
        // previous pair: the pair that was fully before today
        const prevPairStartOffset = currentPairStartOffset - 2;

        const toDateStr = (offsetDays: number): string => {
            const d = new Date(epochMs + offsetDays * 86400000);
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        // PREVIOUS (active) pair dates — this is what users should have completed
        const prevDate1 = prevPairStartOffset >= 0 ? toDateStr(prevPairStartOffset) : null;
        const prevDate2 = prevPairStartOffset >= 0 ? toDateStr(prevPairStartOffset + 1) : null;

        // CURRENT (waiting) pair dates
        const waitingDate1 = toDateStr(currentPairStartOffset);
        const waitingDate2 = toDateStr(currentPairStartOffset + 1);

        // AUTO-RESET CHECK: Does a DailyBook entry exist for the day AFTER the waiting pair?
        // If yes → the waiting pair has "unlocked" and becomes the new active pair.
        const unlockDate = toDateStr(currentPairStartOffset + 2);
        const { rows: unlockCheck } = await pool.query(`
            SELECT 1 FROM "DailyBook"
            WHERE date = $1::date AND deleted_at IS NULL
            LIMIT 1
        `, [unlockDate]);
        const waitingPairIsActive = unlockCheck.length > 0;

        // Decide which pair to show in the tracker
        const date1 = waitingPairIsActive ? waitingDate1 : prevDate1;
        const date2 = waitingPairIsActive ? waitingDate2 : prevDate2;

        if (!date1 || !date2) {
            return NextResponse.json({ users: [], date1: null, date2: null });
        }

        // 3. Get all assigned customer IDs across all users
        const allAssignedIds = [...new Set(users.flatMap((u: any) => u.assigned_customer_ids || []))];

        // 4. For each assigned customer, check if they have a PRODUCT ledger entry for BOTH dates in the active pair
        const { rows: customerData } = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.customer_code,
                c.avatar_url,
                (
                    SELECT COUNT(DISTINCT COALESCE(prod.reference_date::date, prod.created_at::date))
                    FROM "Ledger" prod
                    WHERE prod.customer_id = c.id
                      AND prod.type = 'PRODUCT'
                      AND prod.deleted_at IS NULL
                      AND COALESCE(prod.reference_date::date, prod.created_at::date) IN ($1::date, $2::date)
                ) >= 2 as is_processed
            FROM "Customer" c
            WHERE c.id = ANY($3::uuid[])
              AND c.deleted_at IS NULL
        `, [date1, date2, allAssignedIds]);

        // 5. Build per-user response
        const customerMap = new Map(customerData.map((c: any) => [c.id, c]));

        const perUserData = users.map((user: any) => {
            const assignedIds: string[] = user.assigned_customer_ids || [];
            const customers = assignedIds
                .map((id: string) => customerMap.get(id))
                .filter(Boolean)
                .map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    customer_code: c.customer_code,
                    avatar_url: c.avatar_url,
                    has_payment: c.is_processed
                }));

            return {
                user_id: user.id,
                username: user.username,
                total: customers.length,
                solved: customers.filter((c: any) => c.has_payment).length,
                customers,
            };
        });

        const res = NextResponse.json({
            users: perUserData,
            date1,
            date2,
            isWaitingPairActive: waitingPairIsActive,
        });
        res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
        return res;

    } catch (error: any) {
        console.error('Error fetching per-user maqal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
