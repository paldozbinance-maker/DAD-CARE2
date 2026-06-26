import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get the June 24 entry details
        const { rows: items } = await pool.query(
            `SELECT dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
             FROM "DailyBook" db
             JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.date = '2026-06-24'::date
             ORDER BY CAST(NULLIF(regexp_replace(c.customer_code, '[^0-9]', '', 'g'), '') AS INTEGER) NULLS LAST`
        );

        const totalKg = items.reduce((sum: number, item: any) => sum + (item.kg || 0), 0);

        return NextResponse.json({
            message: `June 24, 2026 entry exists with ${items.length} customers and ${Math.round(totalKg)} KG`,
            totalCustomers: items.length,
            totalKg: Math.round(totalKg),
            items: items
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
