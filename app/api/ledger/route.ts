import { createClient } from '@/lib/supabase/server';
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

        // 1. Verify customer exists
        const { data: customer, error: custError } = await supabase
            .from('Customer')
            .select('name')
            .eq('id', customerId)
            .single();

        if (custError || !customer) throw new Error('Customer not found');

        // 2. GET CURRENT LATEST DEBT (Atomic start point)
        const { data: lastEntry } = await supabase
            .from('Ledger')
            .select('new_debt')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(1);

        let runningDebt = lastEntry?.[0]?.new_debt || 0;

        // 3. PROCESS ENTRIES
        const entriesToInsert = [];
        const entriesToProcess = isBatch ? items : [body];

        // PRE-SCAN: If any item in the batch is an "Initial Debt Setup", 
        // we must CLEAR the runningDebt so this batch acts as a FRESH START.
        const hasReset = entriesToProcess.some(item => {
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

            // Basic dupe check for PRODUCT entries on same date (if provided)
            if (type === 'PRODUCT' && date) {
                const { data: existing } = await supabase
                    .from('Ledger')
                    .select('id')
                    .eq('customer_id', customerId)
                    .eq('reference_date', date)
                    .eq('type', 'PRODUCT')
                    .maybeSingle();
                if (existing) throw new Error(`Product entry already exists for ${date}`);
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
                // If it's a "Setup" or "Initial" adjustment, we RESET the running debt to this amount
                // This prevents old historical debt from polluting a new "Fresh Start" setup
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

        // 4. BULK INSERT
        const { error: insertError } = await supabase
            .from('Ledger')
            .insert(entriesToInsert);

        if (insertError) throw insertError;

        await logAudit(request, 'ADD_LEDGER_ENTRIES', `Added ${entriesToInsert.length} ledger entries for customer ${customer.name}`);

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!customerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        let query = supabase
            .from('Ledger')
            .select('*')
            .eq('customer_id', customerId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .range(offset, offset + limit - 1);

        if (startDate) {
            query = query.gte('reference_date', startDate);
        }
        if (endDate) {
            query = query.lte('reference_date', endDate);
        }

        const { data: transactions, error: txnError } = await query;

        if (txnError) throw txnError;

        // Get current balance from the LATEST entry's new_debt (source of truth)
        const { data: latestEntry } = await supabase
            .from('Ledger')
            .select('new_debt')
            .eq('customer_id', customerId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(1);

        const currentBalance = latestEntry?.[0]?.new_debt || 0;

        // Still aggregate totals for information - OPTIMIZED: Database side math
        const result = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'PRODUCT' THEN kg ELSE 0 END) as total_kg,
                SUM(CASE WHEN type = 'PAYMENT' THEN amount ELSE 0 END) as total_paid
            FROM "Ledger"
            WHERE customer_id = $1 AND deleted_at IS NULL
        `, [customerId]);

        const totalKg = result.rows[0]?.total_kg || 0;
        const totalPaid = result.rows[0]?.total_paid || 0;

        return NextResponse.json({
            transactions: transactions || [],
            summary: {
                totalKg,
                totalPaid,
                currentBalance,
                lastTransactionType: transactions && transactions.length > 0 ? transactions[0].type : null
            }
        });
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
