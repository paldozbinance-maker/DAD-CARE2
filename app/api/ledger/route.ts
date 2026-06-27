import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSession } from '@/lib/require-session';
import { revalidateTag } from 'next/cache';
import pool from '@/lib/db';

export async function POST(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { items, customerId: customerIdBatch } = body;

        // Support both single entry and batch (items array)
        const isBatch = Array.isArray(items);
        const customerId = isBatch ? customerIdBatch : body.customerId;
        const receipt_id = body.receipt_id || (isBatch ? crypto.randomUUID() : null);

        if (!customerId) throw new Error('Customer ID is required');

        const client = await pool.connect();
        let runningDebt = 0;
        let customerName = '';
        let entriesToInsert: any[] = [];

        try {
            await client.query('BEGIN');

            // 1. Verify customer and acquire row lock
            const { rows: customers } = await client.query(
                `SELECT name FROM "Customer" WHERE id = $1 FOR UPDATE`,
                [customerId]
            );
            if (customers.length === 0) throw new Error('Customer not found');
            customerName = customers[0].name;

            // 2. GET CURRENT LATEST DEBT (Atomic start point)
            const { rows: lastEntries } = await client.query(
                `SELECT new_debt FROM "Ledger" 
                 WHERE customer_id = $1 AND deleted_at IS NULL 
                 ORDER BY created_at DESC, id DESC LIMIT 1`,
                [customerId]
            );
            
            runningDebt = lastEntries[0]?.new_debt || 0;

            // 3. PROCESS ENTRIES
            entriesToInsert = [];
            const entriesToProcess = isBatch ? items : [body];

            const hasReset = entriesToProcess.some((item: any) => {
                const lowerNote = (item.note || '').toLowerCase();
                return item.type === 'ADJUSTMENT' && (lowerNote.includes('setup') || lowerNote.includes('initial') || lowerNote.includes('reesto'));
            });

            if (hasReset) {
                runningDebt = 0;
            }

            const now = new Date();
            for (let i = 0; i < entriesToProcess.length; i++) {
                const item = entriesToProcess[i];
                const { type, date, kg, price, amount, note } = item;

                if (type === 'PRODUCT' && date) {
                    const { rows: existing } = await client.query(
                        `SELECT id FROM "Ledger" WHERE customer_id = $1 AND reference_date = $2 AND type = 'PRODUCT' AND deleted_at IS NULL LIMIT 1`,
                        [customerId, date]
                    );
                    if (existing.length > 0) throw new Error(`Product entry already exists for ${date}`);
                }

                let entryAmount = 0;
                const prevDebt = runningDebt;

                if (type === 'PRODUCT') {
                    entryAmount = Math.round(parseFloat(kg) * parseFloat(price));
                    runningDebt = Math.round(runningDebt + entryAmount);
                } else if (type === 'PAYMENT') {
                    entryAmount = Math.round(parseFloat(amount));
                    runningDebt = Math.round(runningDebt - entryAmount);
                } else if (type === 'ADJUSTMENT') {
                    entryAmount = Math.round(parseFloat(amount));
                    const lowerNote = (note || '').toLowerCase();
                    if (lowerNote.includes('setup') || lowerNote.includes('initial') || lowerNote.includes('reesto')) {
                        runningDebt = entryAmount;
                    } else {
                        runningDebt = Math.round(runningDebt + entryAmount);
                    }
                }

                entriesToInsert.push({
                    customer_id: customerId,
                    type: type,
                    reference_date: date || new Date().toISOString().split('T')[0],
                    kg: type === 'PRODUCT' ? parseFloat(kg) : null,
                    price_per_kg: type === 'PRODUCT' ? parseFloat(price) : null,
                    amount: entryAmount,
                    previous_debt: prevDebt,
                    new_debt: runningDebt,
                    note: note || body.note || null,
                    receipt_id: receipt_id,
                    created_at: new Date(now.getTime() + i).toISOString()
                });
            }

            // 4. SEQUENTIAL INSERT
            for (const entry of entriesToInsert) {
                await client.query(
                    `INSERT INTO "Ledger" (id, customer_id, type, reference_date, kg, price_per_kg, amount, previous_debt, new_debt, note, receipt_id, created_at)
                     VALUES (gen_random_uuid(), $1, $2::"LedgerType", $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        entry.customer_id, 
                        entry.type, 
                        entry.reference_date, 
                        entry.kg, 
                        entry.price_per_kg, 
                        entry.amount, 
                        entry.previous_debt, 
                        entry.new_debt, 
                        entry.note, 
                        entry.receipt_id, 
                        entry.created_at
                    ]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        await logAudit(request, 'ADD_LEDGER_ENTRIES', `Added receipt with new debt ${runningDebt} for customer ${customerName}`);

        try {
            revalidateTag('customers', 'max');
        } catch (cacheErr) {
            console.error('Failed to revalidate customers tag:', cacheErr);
        }

        return NextResponse.json({ success: true, finalDebt: runningDebt, count: entriesToInsert.length });
    } catch (error: any) {
        console.error('Ledger Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to add entry' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!customerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    try {
        // Build date filter clauses
        const dateFilters: string[] = [];
        const params: any[] = [customerId];
        if (startDate) { params.push(startDate); dateFilters.push(`AND reference_date >= $${params.length}`); }
        if (endDate)   { params.push(endDate);   dateFilters.push(`AND reference_date <= $${params.length}`); }
        const dateClause = dateFilters.join(' ');

        // Single parallel query: transactions + summary in one round-trip
        const [txnResult, summaryResult] = await Promise.all([
            pool.query(
                `SELECT * FROM "Ledger"
                 WHERE customer_id = $1 AND deleted_at IS NULL ${dateClause}
                 ORDER BY created_at DESC, id DESC
                 LIMIT ${limit} OFFSET ${offset}`,
                params
            ),
            pool.query(
                `SELECT
                    COALESCE(SUM(CASE WHEN type = 'PRODUCT' THEN kg    ELSE 0 END), 0)::float as total_kg,
                    COALESCE(SUM(CASE WHEN type = 'PAYMENT' THEN amount ELSE 0 END), 0)::float as total_paid,
                    (SELECT new_debt FROM "Ledger"
                     WHERE customer_id = $1 AND deleted_at IS NULL
                     ORDER BY created_at DESC, id DESC LIMIT 1)::float as current_balance,
                    (SELECT type FROM "Ledger"
                     WHERE customer_id = $1 AND deleted_at IS NULL
                     ORDER BY created_at DESC, id DESC LIMIT 1) as last_transaction_type
                 FROM "Ledger"
                 WHERE customer_id = $1 AND deleted_at IS NULL`,
                [customerId]
            )
        ]);

        const s = summaryResult.rows[0] || {};
        const response = NextResponse.json({
            transactions: txnResult.rows,
            summary: {
                totalKg:             s.total_kg || 0,
                totalPaid:           s.total_paid || 0,
                currentBalance:      s.current_balance || 0,
                lastTransactionType: s.last_transaction_type || null,
            }
        });
        // Cache per-customer ledger for 20s — short enough to stay fresh
        response.headers.set('Cache-Control', 'private, max-age=20, stale-while-revalidate=60');
        return response;
    } catch (error: any) {
        console.error('Fetch Ledger Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { errorResponse, session } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const customerId = searchParams.get('customerId');

    if (!id && !customerId) return NextResponse.json({ error: 'ID or Customer ID required' }, { status: 400 });

    try {
        let query = `UPDATE "Ledger" SET deleted_at = NOW(), deleted_by = $1`;
        const params: any[] = [session?.username || 'unknown'];

        if (id) {
            query += ` WHERE id = $2`;
            params.push(id);
        } else if (customerId) {
            query += ` WHERE customer_id = $2`;
            params.push(customerId);
        }

        const result = await pool.query(query, params);

        await logAudit(request, 'DELETE_LEDGER_ENTRIES', `Soft deleted ledger entry (ID: ${id || 'ALL'}, Customer: ${customerId || 'UNKNOWN'})`);

        try {
            revalidateTag('customers', 'max');
        } catch (cacheErr) {
            console.error('Failed to revalidate customers tag:', cacheErr);
        }

        return NextResponse.json({ success: true, count: result.rowCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
