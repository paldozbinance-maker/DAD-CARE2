import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

// Returns per-user maqal progress based on assigned_customer_ids
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

        // 2. Compute the Global Active Pair from today
        const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Mogadishu', year: 'numeric', month: '2-digit', day: '2-digit' });
        const todayStr = formatter.format(new Date());
        const epochMs = new Date('2026-06-28T00:00:00Z').getTime();
        const todayMs = new Date(`${todayStr}T00:00:00Z`).getTime();
        const diffDaysToday = Math.floor((todayMs - epochMs) / 86400000);

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

        const date1 = toDateStr(day1Ms);
        const date2 = toDateStr(day2Ms);

        // 3. Get all assigned customer IDs across all users
        const allAssignedIds = [...new Set(users.flatMap((u: any) => u.assigned_customer_ids || []))];

        // 4. Get customer details + payment status for all assigned customers in the latest pair
        const { rows: customerData } = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.customer_code,
                c.avatar_url,
                EXISTS (
                    SELECT 1
                    FROM "Ledger" prod
                    WHERE prod.customer_id = c.id
                      AND prod.type = 'PRODUCT'
                      AND prod.deleted_at IS NULL
                      AND COALESCE(prod.reference_date::date, prod.created_at::date) IN ($1::date, $2::date)
                ) as is_processed
            FROM "Customer" c
            WHERE c.id = ANY($3::uuid[])
              AND c.deleted_at IS NULL
        `, [date1, date2, allAssignedIds]);

        // 5. Build per-user response
        const customerMap = new Map(customerData.map(c => [c.id, c]));

        const perUserData = users.map((user: any) => {
            const assignedIds: string[] = user.assigned_customer_ids || [];
            const customers = assignedIds
                .map(id => customerMap.get(id))
                .filter(Boolean)
                .map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    customer_code: c.customer_code,
                    avatar_url: c.avatar_url,
                    has_payment: c.is_processed // Rename in mapping to avoid changing frontend logic for now
                }));

            return {
                user_id: user.id,
                username: user.username,
                total: customers.length,
                solved: customers.filter((c: any) => c.has_payment).length,
                customers
            };
        });

        const res = NextResponse.json({
            users: perUserData,
            date1: date1?.toString() || null,
            date2: date2?.toString() || null,
        });
        res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
        return res;

    } catch (error: any) {
        console.error('Error fetching per-user maqal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
