import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results: any = {};

        // Step 1: Check if DailyBook entry still exists for June 24
        const { rows: existingBook } = await pool.query(
            `SELECT * FROM "DailyBook" WHERE date = '2026-06-24'`
        );
        results.existingBook = existingBook;

        // Step 2: Check for orphaned DailyBookItem records
        const { rows: orphanedItems } = await pool.query(
            `SELECT dbi.*, c.name as customer_name, c.customer_code 
             FROM "DailyBookItem" dbi 
             LEFT JOIN "DailyBook" db ON dbi.daily_book_id = db.id
             LEFT JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.id IS NULL`
        );
        results.orphanedItems = orphanedItems;

        // Step 3: Check Ledger for June 24 product entries
        const { rows: ledgerEntries } = await pool.query(
            `SELECT l.customer_id, l.kg, l.type, l.reference_date, l.note, c.name as customer_name, c.customer_code 
             FROM "Ledger" l
             JOIN "Customer" c ON l.customer_id = c.id
             WHERE l.reference_date = '2026-06-24'
             ORDER BY c.customer_code`
        );
        results.ledgerEntries = ledgerEntries;

        // Step 4: Check adjacent dates (June 25 and June 23)
        const { rows: june25 } = await pool.query(
            `SELECT dbi.customer_id, dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
             FROM "DailyBook" db
             JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.date = '2026-06-25'
             ORDER BY c.customer_code`
        );
        results.june25 = june25;

        const { rows: june23 } = await pool.query(
            `SELECT dbi.customer_id, dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
             FROM "DailyBook" db
             JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.date = '2026-06-23'
             ORDER BY c.customer_code`
        );
        results.june23 = june23;

        // Step 5: All recent daily book dates
        const { rows: allDates } = await pool.query(
            `SELECT db.date, COUNT(dbi.id) as item_count, COALESCE(SUM(dbi.kg), 0) as total_kg
             FROM "DailyBook" db
             LEFT JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             GROUP BY db.date
             ORDER BY db.date DESC
             LIMIT 10`
        );
        results.allDates = allDates;

        // Step 6: Check audit logs
        const { rows: auditLogs } = await pool.query(
            `SELECT action, details, username, created_at FROM "AuditLog" 
             WHERE action LIKE '%DAILY_BOOK%'
             ORDER BY created_at DESC
             LIMIT 10`
        );
        results.auditLogs = auditLogs;

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Recovery check error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
