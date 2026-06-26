import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Restore June 24 daily book entry.
 * 
 * The audit log shows the June 24 entry was last saved at 2026-06-26T17:12:16.922Z
 * with 59 items and then deleted at 2026-06-26T17:58:01.053Z.
 * 
 * Strategy:
 * - Use Ledger PRODUCT entries for June 24 as primary data source (exact KG values)
 * - Use June 25 daily book entry as reference for the full customer list
 * - Reconstruct the full entry
 */
export async function POST() {
    const targetDate = '2026-06-24';

    try {
        // Step 1: Check if June 24 already exists using raw SQL
        const { rows: existingBooks } = await pool.query(
            `SELECT id FROM "DailyBook" WHERE date = $1::date`,
            [targetDate]
        );
        
        if (existingBooks.length > 0) {
            return NextResponse.json({ 
                error: 'June 24 entry already exists! No restore needed.',
                bookId: existingBooks[0].id
            }, { status: 400 });
        }

        // Step 2: Get Ledger product entries for June 24
        const { rows: ledgerEntries } = await pool.query(
            `SELECT l.customer_id, SUM(l.kg) as total_kg,
                    STRING_AGG(l.note, ', ') FILTER (WHERE l.note IS NOT NULL) as notes,
                    c.name, c.customer_code
             FROM "Ledger" l
             JOIN "Customer" c ON l.customer_id = c.id
             WHERE l.reference_date = $1::date AND l.type = 'PRODUCT'
             GROUP BY l.customer_id, c.name, c.customer_code
             ORDER BY c.customer_code`,
            [targetDate]
        );
        console.log(`Found ${ledgerEntries.length} customers in Ledger for June 24`);

        // Step 3: Get the MOST RECENT existing daily book entry to use as customer reference
        const { rows: refBooks } = await pool.query(
            `SELECT db.id, db.date FROM "DailyBook" db 
             WHERE db.date > $1::date
             ORDER BY db.date ASC LIMIT 1`,
            [targetDate]
        );

        let referenceItems: any[] = [];
        if (refBooks.length > 0) {
            const { rows } = await pool.query(
                `SELECT dbi.customer_id, dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
                 FROM "DailyBookItem" dbi
                 JOIN "Customer" c ON dbi.customer_id = c.id
                 WHERE dbi.daily_book_id = $1
                 ORDER BY c.customer_code`,
                [refBooks[0].id]
            );
            referenceItems = rows;
            console.log(`Using ${refBooks[0].date} as reference with ${rows.length} customers`);
        }

        // Step 4: Build the restored items
        const ledgerByCustomer = new Map<string, { kg: number; note: string | null }>();
        for (const entry of ledgerEntries) {
            ledgerByCustomer.set(entry.customer_id, {
                kg: parseFloat(entry.total_kg),
                note: entry.notes
            });
        }

        const restoredItems: Array<{
            customer_id: string;
            kg: number;
            present: boolean;
            note: string | null;
            source: string;
            name: string;
            code: string;
        }> = [];

        const processedCustomers = new Set<string>();

        // First: Use reference items as the base list
        for (const item of referenceItems) {
            processedCustomers.add(item.customer_id);
            const ledgerData = ledgerByCustomer.get(item.customer_id);
            
            if (ledgerData) {
                restoredItems.push({
                    customer_id: item.customer_id,
                    kg: ledgerData.kg,
                    present: true,
                    note: ledgerData.note,
                    source: 'ledger',
                    name: item.name,
                    code: item.customer_code
                });
            } else {
                restoredItems.push({
                    customer_id: item.customer_id,
                    kg: item.kg,
                    present: item.present,
                    note: item.note,
                    source: 'reference_estimate',
                    name: item.name,
                    code: item.customer_code
                });
            }
        }

        // Second: Add any ledger-only customers not in reference
        for (const entry of ledgerEntries) {
            if (!processedCustomers.has(entry.customer_id)) {
                restoredItems.push({
                    customer_id: entry.customer_id,
                    kg: parseFloat(entry.total_kg),
                    present: true,
                    note: entry.notes,
                    source: 'ledger_only',
                    name: entry.name,
                    code: entry.customer_code
                });
            }
        }

        // Step 5: Create the DailyBook entry
        const { rows: [newBook] } = await pool.query(
            `INSERT INTO "DailyBook" (id, date, created_at) 
             VALUES (gen_random_uuid(), $1::date, NOW()) 
             RETURNING id`,
            [targetDate]
        );

        // Step 6: Insert all items
        const itemsToInsert = restoredItems
            .filter(item => item.kg > 0 || item.present === false || (item.note && item.note.trim() !== ''));

        for (const item of itemsToInsert) {
            await pool.query(
                `INSERT INTO "DailyBookItem" (id, daily_book_id, customer_id, kg, present, note)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
                [newBook.id, item.customer_id, item.kg, item.present, item.note]
            );
        }

        // Step 7: Verify
        const { rows: verifyItems } = await pool.query(
            `SELECT dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
             FROM "DailyBookItem" dbi
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE dbi.daily_book_id = $1
             ORDER BY CAST(NULLIF(regexp_replace(c.customer_code, '[^0-9]', '', 'g'), '') AS INTEGER) NULLS LAST`,
            [newBook.id]
        );

        const totalKg = verifyItems.reduce((sum: number, item: any) => sum + (item.kg || 0), 0);

        return NextResponse.json({
            success: true,
            message: `✅ Restored June 24 daily book with ${verifyItems.length} customers and ${Math.round(totalKg)} KG total`,
            bookId: newBook.id,
            stats: {
                totalCustomers: verifyItems.length,
                totalKg: Math.round(totalKg),
                fromLedger: restoredItems.filter(i => i.source === 'ledger').length,
                fromReferenceEstimate: restoredItems.filter(i => i.source === 'reference_estimate').length,
                fromLedgerOnly: restoredItems.filter(i => i.source === 'ledger_only').length,
            },
            items: verifyItems
        });
    } catch (error: any) {
        console.error('Restore Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('do') === 'restore') {
        return POST();
    }
    
    // Preview mode - show what would be restored
    try {
        const { rows: existingBooks } = await pool.query(
            `SELECT id, date FROM "DailyBook" WHERE date = '2026-06-24'::date`
        );
        
        const { rows: allDates } = await pool.query(
            `SELECT db.date, COUNT(dbi.id) as items, COALESCE(SUM(dbi.kg),0) as kg
             FROM "DailyBook" db
             LEFT JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             GROUP BY db.date ORDER BY db.date DESC LIMIT 5`
        );

        return NextResponse.json({
            june24_exists: existingBooks.length > 0,
            existing_entry: existingBooks[0] || null,
            all_dates: allDates,
            instruction: 'Use GET with ?do=restore to restore, or POST to this endpoint'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
