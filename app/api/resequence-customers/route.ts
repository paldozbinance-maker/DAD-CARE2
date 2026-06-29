import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/resequence-customers
 * Re-assigns customer_code values sequentially (1, 2, 3, ...) sorted by the
 * current numeric value of customer_code (ignoring any non-numeric prefix/space).
 * Only accessible by SUPER_ADMIN.
 */
export async function POST(request: Request) {
    const { session, errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    if (session?.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get all customers sorted by current numeric customer_code
        const { rows } = await client.query(`
            SELECT id, name, customer_code
            FROM "Customer"
            ORDER BY REGEXP_REPLACE(customer_code, '[^0-9]', '', 'g')::int ASC NULLS LAST,
                     customer_code ASC
        `);

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ message: 'No customers found', updated: 0 });
        }

        // 2. Temporarily set all customer_codes to a negative temp value to avoid unique constraint conflicts
        await client.query(`
            UPDATE "Customer"
            SET customer_code = '-' || id
        `);

        // 3. Assign sequential codes 1, 2, 3, ...
        let updated = 0;
        const changes: { id: string; oldCode: string; newCode: string }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const newCode = String(i + 1);
            if (rows[i].customer_code !== newCode) {
                changes.push({ id: rows[i].id, oldCode: rows[i].customer_code, newCode });
            }
            await client.query(
                `UPDATE "Customer" SET customer_code = $1 WHERE id = $2`,
                [newCode, rows[i].id]
            );
            updated++;
        }

        await client.query('COMMIT');

        // 4. Log the operation
        await logAudit({
            userId: session!.id,
            action: 'RESEQUENCE_CUSTOMERS',
            details: `Re-sequenced ${updated} customer codes. ${changes.length} codes changed.`,
        });

        return NextResponse.json({
            message: `Successfully re-sequenced ${updated} customers.`,
            updated,
            changes,
        });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Resequence error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
