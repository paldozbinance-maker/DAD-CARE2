import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '200');
    const customerId = searchParams.get('customerId');

    try {
        const params: any[] = [];
        const filters: string[] = [`type = 'PAYMENT'`, `deleted_at IS NULL`];

        if (customerId) {
            params.push(customerId);
            filters.push(`customer_id = $${params.length}`);
        }

        const whereClause = filters.join(' AND ');

        // Single query: payments + today total + all-time total in one shot
        const today = new Date().toISOString().split('T')[0];
        params.push(today);
        const todayParam = `$${params.length}`;

        const { rows } = await pool.query(
            `SELECT
                l.id, l.customer_id, l.type, l.reference_date, l.amount, l.previous_debt, l.new_debt, l.note, l.created_at, l.receipt_id,
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'customer_code', c.customer_code
                ) as customer,
                -- Window aggregates computed in DB (zero extra round-trips)
                SUM(l.amount) OVER () AS _total_all_time,
                SUM(CASE WHEN l.reference_date::date = ${todayParam}::date THEN l.amount ELSE 0 END) OVER () AS _today_total
             FROM "Ledger" l
             LEFT JOIN "Customer" c ON c.id = l.customer_id
             WHERE ${whereClause}
             ORDER BY l.created_at DESC, l.id DESC
             LIMIT ${limit}`,
            params
        );

        const totalAllTime = rows[0]?._total_all_time ? parseFloat(rows[0]._total_all_time) : 0;
        const todayTotal   = rows[0]?._today_total   ? parseFloat(rows[0]._today_total)   : 0;

        // Strip internal aggregate columns from the payment objects
        const payments = rows.map(({ _total_all_time, _today_total, ...rest }) => rest);

        const response = NextResponse.json({
            payments,
            todayTotal,
            totalAllTime,
            count: payments.length,
        });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    } catch (error: any) {
        console.error('Payments Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { customerId, amount, note, date } = body;

    try {
        if (!customerId || !amount) {
            return NextResponse.json({ error: 'Customer and amount required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Lock the customer row and get latest debt atomically
            const { rows: lastEntries } = await client.query(
                `SELECT new_debt FROM "Ledger"
                 WHERE customer_id = $1 AND deleted_at IS NULL
                 ORDER BY created_at DESC, id DESC LIMIT 1
                 FOR UPDATE SKIP LOCKED`,
                [customerId]
            );

            const previousDebt = lastEntries[0]?.new_debt || 0;
            const paymentAmount = Math.round(parseFloat(amount));
            const newDebt = Math.round(previousDebt - paymentAmount);
            const refDate = date || new Date().toISOString().split('T')[0];

            await client.query(
                `INSERT INTO "Ledger" (id, customer_id, type, reference_date, amount, previous_debt, new_debt, note, receipt_id)
                 VALUES (gen_random_uuid(), $1, 'PAYMENT', $2, $3, $4, $5, $6, $7)`,
                [customerId, refDate, paymentAmount, previousDebt, newDebt, note || null, body.receipt_id || null]
            );

            await client.query('COMMIT');

            await logAudit(request, 'ADD_PAYMENT', `Payment of ${paymentAmount} recorded for customer ID: ${customerId}`);
            return NextResponse.json({ success: true, newDebt });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
