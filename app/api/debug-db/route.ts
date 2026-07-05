import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const { rows } = await pool.query(`
            SELECT c.name, l.reference_date, l.created_at, l.amount, l.kg
            FROM "Ledger" l
            JOIN "Customer" c ON c.id = l.customer_id
            WHERE l.type = 'PRODUCT' AND l.deleted_at IS NULL
              AND (c.name ILIKE '%Xaliimo Wala xolo%' OR c.name ILIKE '%Shiino%')
            ORDER BY c.name, l.reference_date DESC
            LIMIT 20
        `);
        return NextResponse.json(rows);
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
