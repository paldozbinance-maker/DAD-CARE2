import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const query = `
            SELECT 
                dbi.id as dbi_id,
                dbi.kg as dbi_kg,
                db.date as db_date,
                l.id as ledger_id,
                l.type as ledger_type,
                l.reference_date as ledger_ref_date,
                l.kg as ledger_kg
            FROM "DailyBookItem" dbi
            JOIN "DailyBook" db ON dbi.daily_book_id = db.id
            JOIN "Customer" c ON c.id = dbi.customer_id
            LEFT JOIN "Ledger" l ON l.customer_id = dbi.customer_id AND l.type = 'PRODUCT' AND l.reference_date::date = db.date::date
            WHERE c.customer_code = '16' AND dbi.kg > 0
        `;
        const { rows } = await pool.query(query);

        const ledgerQuery = `
            SELECT id, type, reference_date, kg, note
            FROM "Ledger"
            WHERE customer_id = (SELECT id FROM "Customer" WHERE customer_code = '16')
            AND type = 'PRODUCT'
        `;
        const { rows: ledgerRows } = await pool.query(ledgerQuery);

        return NextResponse.json({
            daily_vs_ledger: rows,
            all_product_ledgers: ledgerRows
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
