import pool from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSession } from '@/lib/require-session';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

async function getCustomers() {
    const query = `
        WITH past_dates AS (
            SELECT date::date as db_date
            FROM "DailyBook"
            WHERE date::date < CURRENT_DATE AND deleted_at IS NULL
            ORDER BY date::date ASC
        ),
        numbered_dates AS (
            SELECT db_date,
                   ROW_NUMBER() OVER (ORDER BY db_date ASC) as rn
            FROM past_dates
        ),
        target_pair AS (
            SELECT n1.db_date as date1, n2.db_date as date2
            FROM numbered_dates n1
            JOIN numbered_dates n2 ON n1.rn = n2.rn - 1
            WHERE n1.rn % 2 = 1
            ORDER BY n1.db_date DESC
            LIMIT 1
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
            CASE WHEN COALESCE(td.target_days_count, 0) >= 2 THEN true ELSE false END as is_target_days_done
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
                SUM(kg) as total_ledger_kg
            FROM "Ledger"
            WHERE type = 'PRODUCT' AND deleted_at IS NULL
            GROUP BY customer_id
        ) lk ON c.id = lk.customer_id
        LEFT JOIN (
            SELECT 
                customer_id,
                COUNT(DISTINCT reference_date::date) as target_days_count
            FROM "Ledger"
            WHERE type = 'PRODUCT' AND deleted_at IS NULL
            AND reference_date::date IN (SELECT date1 FROM target_pair UNION SELECT date2 FROM target_pair)
            GROUP BY customer_id
        ) td ON c.id = td.customer_id
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

    try {
        if (isLite) {
            const query = `
                SELECT 
                    c.id, c.name, c.customer_code, c.phone,
                    COALESCE(
                        (SELECT new_debt FROM "Ledger" WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY created_at DESC, id DESC LIMIT 1), 
                    0)::float as current_balance
                FROM "Customer" c
                ORDER BY c.customer_code ASC;
            `;
            const { rows } = await pool.query(query);
            const res = NextResponse.json(rows);
            res.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=180');
            return res;
        }

        const rows = await getCustomers();
        const res = NextResponse.json(rows);
        res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
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
        // First, delete all DailyBookItem records that reference this customer
        const { error: dailyBookItemError } = await supabase
            .from('DailyBookItem')
            .delete()
            .eq('customer_id', id);

        if (dailyBookItemError) {
            console.error('Delete DailyBookItem Error:', dailyBookItemError);
            throw dailyBookItemError;
        }

        // Then, delete all Ledger records that reference this customer
        const { error: ledgerError } = await supabase
            .from('Ledger')
            .delete()
            .eq('customer_id', id);

        if (ledgerError) {
            console.error('Delete Ledger Error:', ledgerError);
            throw ledgerError;
        }

        // Finally, delete the customer
        const { error } = await supabase
            .from('Customer')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await logAudit(request, 'DELETE_CUSTOMER', `Deleted customer ID: ${id}`);
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
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('Customer')
            .update({
                name,
                customer_code,
                gender: gender || null,
                phone: phone || null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        await logAudit(request, 'UPDATE_CUSTOMER', `Updated customer ${name} (${customer_code})`);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Update Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
