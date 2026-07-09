import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;

    const client = await pool.connect();
    try {
        // Find all customers with non-numeric or UUID-like customer_code
        const { rows: broken } = await client.query(`
            SELECT id, customer_code, name, created_at
            FROM "Customer"
            WHERE customer_code !~ '^[0-9]+$' OR customer_code IS NULL
            ORDER BY created_at ASC
        `);

        if (broken.length === 0) {
            return NextResponse.json({ success: true, message: 'All codes are already correct!', fixed: 0 });
        }

        // Find highest existing valid numeric code
        const { rows: maxRow } = await client.query(`
            SELECT COALESCE(MAX(customer_code::int), 0) as max_code
            FROM "Customer"
            WHERE customer_code ~ '^[0-9]+$' AND LENGTH(customer_code) < 8
        `);
        let nextCode = parseInt(maxRow[0].max_code) + 1;

        await client.query('BEGIN');
        const changes: { name: string; old: string; new: string }[] = [];
        for (const customer of broken) {
            const newCode = String(nextCode++);
            await client.query(
                `UPDATE "Customer" SET customer_code = $1 WHERE id = $2`,
                [newCode, customer.id]
            );
            changes.push({ name: customer.name, old: customer.customer_code, new: newCode });
        }
        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            fixed: changes.length,
            changes,
            message: `Fixed ${changes.length} customer codes successfully!`
        });
    } catch (err: any) {
        await client.query('ROLLBACK').catch(() => {});
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
