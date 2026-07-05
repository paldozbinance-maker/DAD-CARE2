import pool from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSession } from '@/lib/require-session';
import bcrypt from 'bcryptjs';


async function getCustomers(maqalD1?: string | null, maqalD2?: string | null, maxAllTimeDate?: string | null) {
    const query = `
        -- ── PAIR EPOCH = 2026-06-28. offset = CURRENT_DATE - epoch ─────────────────
        -- current pair = the pair that includes TODAY
        -- prev pair    = the pair immediately BEFORE today's pair (always fully in past)
        --
        -- ✅ RULE: customer is "done" when BOTH:
        --   1. They have Ledger PRODUCT entries for both dates of the PREVIOUS pair
        --   2. A DailyBook record exists for TODAY (today's kg book has been entered)
        --
        -- Today Jul 05 (offset 7): current=Jul04+05, prev=Jul02+03
        --   ✅ for customers who processed Jul02+03 maqal, IF Jul05 DailyBook exists
        -- Today Jul 06 (offset 8): current=Jul06+07, prev=Jul04+05
        --   ✅ for customers who processed Jul04+05 maqal, IF Jul06 DailyBook exists
        -- Today Jul 08 (offset 10): current=Jul08+09, prev=Jul06+07
        --   ✅ for customers who processed Jul06+07 maqal, IF Jul08 DailyBook exists
        WITH target_pair AS (
            SELECT
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2
                )::int * '1 day'::interval)::date AS date1,
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2 + 1
                )::int * '1 day'::interval)::date AS date2
        ),
        prev_pair AS (
            SELECT
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2 - 2
                )::int * '1 day'::interval)::date AS date1,
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2 - 1
                )::int * '1 day'::interval)::date AS date2
        ),
        latest_product_receipt_raw AS (
            SELECT 
                customer_id,
                MIN(created_at) as first_receipt_created_at,
                MAX(created_at) as last_receipt_created_at
            FROM "Ledger"
            WHERE type = 'PRODUCT' AND deleted_at IS NULL 
            AND COALESCE(reference_date::date, created_at::date) IN (SELECT date1 FROM target_pair UNION SELECT date2 FROM target_pair)
            GROUP BY customer_id
        ),
        latest_product_receipt AS (
            SELECT 
                lpr.customer_id,
                lpr.first_receipt_created_at,
                lpr.last_receipt_created_at,
                COALESCE(
                    (SELECT MIN(created_at) FROM "Ledger" l_next 
                     WHERE l_next.customer_id = lpr.customer_id 
                       AND l_next.type = 'PRODUCT' 
                       AND l_next.deleted_at IS NULL
                       AND l_next.created_at > lpr.last_receipt_created_at
                    ), 
                    'infinity'::timestamp
                ) as next_receipt_created_at
            FROM latest_product_receipt_raw lpr
        ),
        latest_maqal_stats AS (
            SELECT 
                lpr.customer_id,
                SUM(l.amount)::float as maqal_total
            FROM latest_product_receipt lpr
            JOIN "Ledger" l ON l.customer_id = lpr.customer_id 
                AND l.type = 'PRODUCT' 
                AND l.deleted_at IS NULL
                AND COALESCE(l.reference_date::date, l.created_at::date) IN (SELECT date1 FROM target_pair UNION SELECT date2 FROM target_pair)
            GROUP BY lpr.customer_id
        ),
        latest_payment_stats AS (
            SELECT 
                lpr.customer_id,
                SUM(l.amount)::float as payments_total
            FROM latest_product_receipt lpr
            JOIN "Ledger" l ON l.customer_id = lpr.customer_id 
                AND l.type = 'PAYMENT' 
                AND l.deleted_at IS NULL
                AND l.created_at >= lpr.first_receipt_created_at
                AND l.created_at < lpr.next_receipt_created_at
            GROUP BY lpr.customer_id
        ),
        selected_product_receipt_raw AS (
            SELECT 
                customer_id,
                MIN(created_at) as first_receipt_created_at,
                MAX(created_at) as last_receipt_created_at
            FROM "Ledger"
            WHERE type = 'PRODUCT' AND deleted_at IS NULL
            ${maqalD1 && maqalD2 ? `AND COALESCE(reference_date::date, created_at::date) IN ('${maqalD1}', '${maqalD2}')` : `AND 1=0`}
            GROUP BY customer_id
        ),
        selected_product_receipt AS (
            SELECT 
                spr.customer_id,
                spr.first_receipt_created_at,
                spr.last_receipt_created_at,
                COALESCE(
                    (SELECT MIN(created_at) FROM "Ledger" l_next 
                     WHERE l_next.customer_id = spr.customer_id 
                       AND l_next.type = 'PRODUCT' 
                       AND l_next.deleted_at IS NULL
                       AND l_next.created_at > spr.last_receipt_created_at
                    ), 
                    'infinity'::timestamp
                ) as next_receipt_created_at
            FROM selected_product_receipt_raw spr
        ),
        selected_maqal_stats AS (
            SELECT 
                spr.customer_id,
                SUM(l.amount)::float as maqal_total
            FROM selected_product_receipt spr
            JOIN "Ledger" l ON l.customer_id = spr.customer_id 
                AND l.type = 'PRODUCT' 
                AND l.deleted_at IS NULL
                ${maqalD1 && maqalD2 ? `AND COALESCE(l.reference_date::date, l.created_at::date) IN ('${maqalD1}', '${maqalD2}')` : `AND 1=0`}
            GROUP BY spr.customer_id
        ),
        selected_payment_stats AS (
            SELECT 
                spr.customer_id,
                SUM(l.amount)::float as payments_total
            FROM selected_product_receipt spr
            JOIN "Ledger" l ON l.customer_id = spr.customer_id 
                AND l.type = 'PAYMENT' 
                AND l.deleted_at IS NULL
                AND l.created_at >= spr.first_receipt_created_at
                AND l.created_at < spr.next_receipt_created_at
            GROUP BY spr.customer_id
        )
        SELECT 
            c.*,
            COALESCE(l.new_debt, 0)::float as current_balance,
            COALESCE(l.type, null) as last_transaction_type,
            COALESCE(p.total_paid, 0)::float as total_paid,
            COALESCE(dbk.total_daily_kg, 0)::float as total_kg,
            COALESCE(l.last_receipt_has_payment, false) as last_receipt_has_payment,
            COALESCE(dbk.total_books_count, 0) as total_books_count,
            CASE WHEN COALESCE(dbk.total_daily_kg, 0) > COALESCE(lk.total_ledger_kg, 0) THEN 1 ELSE 0 END as unprocessed_books_count,
            -- ✅ RULE: customer is "done" when EITHER:
            --   1. They have Ledger PRODUCT entries for both dates of the PREVIOUS pair (e.g. Jul 02 + Jul 03).
            --   2. They were created AFTER the prev_pair.date2 (new customers have no obligation for past pairs).
            CASE
                WHEN COALESCE(td.prev_pair_ledger_count, 0) >= 2 THEN true
                WHEN (c.created_at AT TIME ZONE 'Africa/Mogadishu')::date > (SELECT date2 FROM prev_pair) THEN true
                ELSE false
            END as is_target_days_done,
            tp.date1::text as pair_date1,
            tp.date2::text as pair_date2,
            CASE WHEN c.deleted_at IS NOT NULL THEN true ELSE false END as is_inactive,
            
            -- Latest Maqal
            COALESCE(lms.maqal_total, 0)::float as latest_maqal_total,
            CASE 
                WHEN COALESCE(lms.maqal_total, 0) = 0 THEN 0
                ELSE LEAST(100, ROUND((COALESCE(lps.payments_total, 0) / lms.maqal_total) * 100))::int
            END as latest_maqal_pct,
            
            -- All Time Maqal
            COALESCE(lk.total_ledger_maqal, 0)::float as all_time_maqal_total,
            CASE 
                WHEN COALESCE(lk.total_ledger_maqal, 0) = 0 THEN 0
                ELSE LEAST(100, ROUND((COALESCE(p.total_paid, 0) / lk.total_ledger_maqal) * 100))::int
            END as all_time_maqal_pct,
            
            -- Selected Maqal (if pair provided)
            COALESCE(sms.maqal_total, 0)::float as selected_maqal_total,
            CASE 
                WHEN COALESCE(sms.maqal_total, 0) = 0 THEN 0
                ELSE LEAST(100, ROUND((COALESCE(sps.payments_total, 0) / sms.maqal_total) * 100))::int
            END as selected_maqal_pct
        FROM "Customer" c
        LEFT JOIN (
            SELECT DISTINCT ON (customer_id) 
                customer_id, 
                new_debt, 
                type,
                EXISTS (
                    SELECT 1 FROM "Ledger" l2 
                    WHERE l2.customer_id = l1.customer_id 
                      AND (
                          (l1.receipt_id IS NOT NULL AND l2.receipt_id = l1.receipt_id)
                          OR
                          (l1.receipt_id IS NULL AND l2.id = l1.id)
                      )
                      AND l2.type = 'PAYMENT'
                ) as last_receipt_has_payment
            FROM "Ledger" l1
            WHERE l1.deleted_at IS NULL
            ORDER BY customer_id, created_at DESC, id DESC
        ) l ON c.id = l.customer_id
        LEFT JOIN (
            SELECT customer_id, SUM(amount) as total_paid
            FROM "Ledger"
            WHERE type = 'PAYMENT' AND deleted_at IS NULL
            GROUP BY customer_id
        ) p ON c.id = p.customer_id
        LEFT JOIN (
            SELECT 
                dbi.customer_id,
                COUNT(DISTINCT dbi.id) as total_books_count,
                SUM(dbi.kg) as total_daily_kg
            FROM "DailyBookItem" dbi
            WHERE dbi.kg > 0 AND dbi.deleted_at IS NULL
            GROUP BY dbi.customer_id
        ) dbk ON c.id = dbk.customer_id
        LEFT JOIN (
            SELECT 
                customer_id,
                SUM(kg) as total_ledger_kg,
                SUM(amount) as total_ledger_maqal
            FROM "Ledger"
            WHERE type = 'PRODUCT' AND deleted_at IS NULL
            ${maxAllTimeDate ? `AND COALESCE(reference_date::date, created_at::date) <= '${maxAllTimeDate}'` : ''}
            GROUP BY customer_id
        ) lk ON c.id = lk.customer_id
        LEFT JOIN (
            -- CONDITION 1: Count how many of the PREVIOUS pair's dates this customer
            -- has a processed Ledger PRODUCT entry for.
            -- Both dates must be present (count = 2) to mark as done.
            SELECT
                customer_id,
                COUNT(DISTINCT COALESCE((reference_date AT TIME ZONE 'Africa/Mogadishu')::date, (created_at AT TIME ZONE 'Africa/Mogadishu')::date)) as prev_pair_ledger_count
            FROM "Ledger"
            WHERE type = 'PRODUCT' AND deleted_at IS NULL
              AND COALESCE((reference_date AT TIME ZONE 'Africa/Mogadishu')::date, (created_at AT TIME ZONE 'Africa/Mogadishu')::date)
                    IN (SELECT date1 FROM prev_pair UNION SELECT date2 FROM prev_pair)
            GROUP BY customer_id
        ) td ON c.id = td.customer_id
        LEFT JOIN prev_pair tp ON true
        LEFT JOIN latest_maqal_stats lms ON c.id = lms.customer_id
        LEFT JOIN latest_payment_stats lps ON c.id = lps.customer_id
        LEFT JOIN selected_maqal_stats sms ON c.id = sms.customer_id
        LEFT JOIN selected_payment_stats sps ON c.id = sps.customer_id
        ORDER BY c.name ASC;
    `;

    const { rows } = await pool.query(query);
    return rows;
}

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const isLite = searchParams.get('lite') === 'true';
    const maqalD1 = searchParams.get('maqal_d1');
    const maqalD2 = searchParams.get('maqal_d2');
    const maxAllTimeDate = searchParams.get('max_all_time_date');

    try {
        if (isLite) {
            const query = `
                SELECT 
                    c.id, c.name, c.customer_code, c.phone,
                    COALESCE(
                        (SELECT new_debt FROM "Ledger" WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY created_at DESC, id DESC LIMIT 1), 
                    0)::float as current_balance,
                    CASE WHEN c.deleted_at IS NOT NULL THEN true ELSE false END as is_inactive
                FROM "Customer" c
                WHERE c.deleted_at IS NULL
                ORDER BY c.customer_code ASC;
            `;
            const { rows } = await pool.query(query);
            const res = NextResponse.json(rows);
            res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
            return res;
        }

        const customers = await getCustomers(maqalD1, maqalD2, maxAllTimeDate);
        
        const res = NextResponse.json(customers);
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return res;
    } catch (error: any) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { name, gender, phone, customer_code } = body;
    const supabase = await createClient();

    try {
        // Hash default password '123' securely
        const salt = await bcrypt.genSalt(10);
        const hashedDefaultPassword = await bcrypt.hash('123', salt);

        // 1. Create the User account first
        const { data: userData, error: userError } = await supabase
            .from('User')
            .insert({
                username: customer_code.toLowerCase().replace(/\s+/g, ''),
                email: `${customer_code.toLowerCase().replace(/\s+/g, '')}@dadwork.com`,
                name: name,
                password: hashedDefaultPassword,
                role: 'CUSTOMER',
                is_active: true
            })
            .select()
            .single();

        if (userError) {
            console.error('Error creating linked user:', userError);
            // Proceed anyway to create customer, or throw? 
            // Let's log but proceed for now to avoid blocking business logic if auth fails
        }

        // 2. Create the Customer record
        const { data, error } = await supabase
            .from('Customer')
            .insert({
                name,
                customer_code: customer_code,
                gender: gender || null,
                phone: phone || null
            })
            .select()
            .single();

        if (error) throw error;
        await logAudit(request, 'CREATE_CUSTOMER', `Created customer ${name} (${customer_code})`);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Create Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Creation failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supabase = await createClient();

    try {
        const timestamp = new Date().toISOString();

        // NO CASCADING DELETES: The user explicitly wants to keep historical Ledger and DailyBook records intact.
        // We only soft-delete the customer profile itself, which marks them as inactive in dropdowns.

        // Finally, soft delete the customer
        const { error } = await supabase
            .from('Customer')
            .update({ deleted_at: timestamp })
            .eq('id', id);

        if (error) throw error;

        // Remove from assigned_customer_ids for all users to update priority lists
        await pool.query('UPDATE "User" SET assigned_customer_ids = array_remove(assigned_customer_ids, $1) WHERE $1 = ANY(assigned_customer_ids)', [id]);

        await logAudit(request, 'DELETE_CUSTOMER', `Soft deleted customer ID: ${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 });
    }
}
export async function PATCH(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { name, gender, phone, customer_code } = body;

    try {
        const query = `
            UPDATE "Customer"
            SET name = $1, customer_code = $2, gender = $3, phone = $4
            WHERE id = $5
            RETURNING *;
        `;
        const values = [name, customer_code, gender || null, phone || null, id];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            throw new Error('Customer not found');
        }

        const data = rows[0];

        await logAudit(request, 'UPDATE_CUSTOMER', `Updated customer ${name} (${customer_code})`);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Update Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
