import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

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

        // 2. Get the latest maqal pair dates
        const { rows: pairRows } = await pool.query(`
            WITH past_dates AS (
                SELECT DISTINCT date::date as db_date
                FROM "DailyBook"
                WHERE deleted_at IS NULL
            ),
            numbered_dates AS (
                SELECT db_date,
                       ROW_NUMBER() OVER (ORDER BY db_date DESC) as rn
                FROM past_dates
            )
            SELECT n2.db_date::date as date1, n1.db_date::date as date2
            FROM numbered_dates n1
            JOIN numbered_dates n2 ON n1.rn = n2.rn - 1
            WHERE n1.rn % 2 = 1
            ORDER BY n2.db_date DESC
            LIMIT 1
        `);

        if (pairRows.length === 0) {
            return NextResponse.json({ 
                users: users.map(u => ({
                    user_id: u.id,
                    username: u.username,
                    total: u.assigned_customer_ids?.length || 0,
                    solved: 0,
                    customers: []
                })),
                date1: null,
                date2: null 
            });
        }

        const { date1, date2 } = pairRows[0];

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
                      AND EXISTS (
                          SELECT 1
                          FROM "Ledger" pay
                          WHERE pay.customer_id = prod.customer_id
                            AND pay.type = 'PAYMENT'
                            AND pay.deleted_at IS NULL
                            AND pay.created_at >= prod.created_at
                            AND pay.created_at < COALESCE(
                                (SELECT MIN(created_at) FROM "Ledger" next_prod
                                 WHERE next_prod.customer_id = prod.customer_id
                                   AND next_prod.type = 'PRODUCT'
                                   AND next_prod.deleted_at IS NULL
                                   AND next_prod.created_at > prod.created_at
                                ),
                                'infinity'::timestamp
                            )
                      )
                ) as has_payment
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
                    has_payment: c.has_payment
                }));

            return {
                user_id: user.id,
                username: user.username,
                total: customers.length,
                solved: customers.filter((c: any) => c.has_payment).length,
                customers
            };
        });

        return NextResponse.json({
            users: perUserData,
            date1: date1?.toString() || null,
            date2: date2?.toString() || null,
        });

    } catch (error: any) {
        console.error('Error fetching per-user maqal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
