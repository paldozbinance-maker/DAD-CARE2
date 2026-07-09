import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/fix-raaxo
 * Swaps customer_code for Raaxo Shaahle back to 6.
 * Whoever currently has code 6 gets code 18 (her old code).
 * Only SUPER_ADMIN can run this.
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

        // Find Raaxo Shaahle (search by name, case-insensitive)
        const { rows: raaxoRows } = await client.query(`
            SELECT id, name, customer_code FROM "Customer"
            WHERE LOWER(name) LIKE '%raaxo%'
               OR LOWER(name) LIKE '%raaxo shaahle%'
            LIMIT 5
        `);

        if (raaxoRows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Raaxo Shaahle not found. Check spelling.' }, { status: 404 });
        }

        // Find who currently has code 6
        const { rows: code6Rows } = await client.query(`
            SELECT id, name, customer_code FROM "Customer"
            WHERE customer_code = '6' AND deleted_at IS NULL
            LIMIT 1
        `);

        const raaxo = raaxoRows[0];
        const raaxoOldCode = raaxo.customer_code; // currently 18 (or whatever)
        const targetCode = '6';

        if (raaxo.customer_code === targetCode) {
            await client.query('ROLLBACK');
            return NextResponse.json({ 
                message: 'Raaxo Shaahle already has code 6. Nothing to do.',
                raaxo 
            });
        }

        // Temporarily park Raaxo to avoid unique constraint conflict
        await client.query(`
            UPDATE "Customer" SET customer_code = 'temp_raaxo_fix' WHERE id = $1
        `, [raaxo.id]);

        // If someone else has code 6, give them Raaxo's old code
        if (code6Rows.length > 0) {
            const currentCode6Person = code6Rows[0];
            await client.query(`
                UPDATE "Customer" SET customer_code = $1 WHERE id = $2
            `, [raaxoOldCode, currentCode6Person.id]);
        }

        // Now assign code 6 to Raaxo
        await client.query(`
            UPDATE "Customer" SET customer_code = $1 WHERE id = $2
        `, [targetCode, raaxo.id]);

        await client.query('COMMIT');

        await logAudit(request, 'FIX_CUSTOMER_CODE', 
            `Restored Raaxo Shaahle (ID: ${raaxo.id}) customer_code from ${raaxoOldCode} → ${targetCode}. ` +
            (code6Rows.length > 0 ? `${code6Rows[0].name} moved from 6 → ${raaxoOldCode}` : 'No conflict at code 6.')
        );

        return NextResponse.json({
            success: true,
            message: `✅ Done! Raaxo Shaahle is now #${targetCode}.`,
            raaxo: { ...raaxo, new_code: targetCode },
            displaced: code6Rows.length > 0 ? { ...code6Rows[0], new_code: raaxoOldCode } : null,
        });
    } catch (err: any) {
        await client.query('ROLLBACK').catch(() => {});
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
