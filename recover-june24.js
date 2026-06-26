/**
 * Recovery script for June 24, 2026 daily book entry.
 * 
 * Strategy:
 * 1. Check if the DailyBook entry for June 24 still exists
 * 2. Check Ledger table for product entries referencing June 24
 * 3. If Ledger has June 24 data, use it to reconstruct the daily book entry
 * 4. If not, check the June 25 daily book entry to get the customer list and estimate
 */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false },
});

async function recover() {
    try {
        console.log('=== RECOVERY SCRIPT FOR JUNE 24, 2026 ===\n');

        // Step 1: Check if DailyBook entry still exists for June 24
        console.log('--- Step 1: Checking DailyBook for June 24 ---');
        const { rows: existingBook } = await pool.query(
            `SELECT * FROM "DailyBook" WHERE date = '2026-06-24'`
        );
        console.log('Existing book entry:', existingBook.length > 0 ? existingBook : 'NONE - Was deleted');

        // Step 2: Check if DailyBookItems exist for June 24 (orphaned records?)
        console.log('\n--- Step 2: Checking for orphaned DailyBookItem records ---');
        const { rows: orphanedItems } = await pool.query(
            `SELECT dbi.*, c.name as customer_name, c.customer_code 
             FROM "DailyBookItem" dbi 
             LEFT JOIN "DailyBook" db ON dbi.daily_book_id = db.id
             LEFT JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.id IS NULL`
        );
        console.log('Orphaned items found:', orphanedItems.length);
        if (orphanedItems.length > 0) {
            console.log('Orphaned items:', JSON.stringify(orphanedItems, null, 2));
        }

        // Step 3: Check Ledger for June 24 product entries
        console.log('\n--- Step 3: Checking Ledger for June 24 product entries ---');
        const { rows: ledgerEntries } = await pool.query(
            `SELECT l.*, c.name as customer_name, c.customer_code 
             FROM "Ledger" l
             JOIN "Customer" c ON l.customer_id = c.id
             WHERE l.reference_date = '2026-06-24'
             ORDER BY c.customer_code`
        );
        console.log(`Ledger entries for June 24: ${ledgerEntries.length}`);
        if (ledgerEntries.length > 0) {
            console.log('\nLedger data (this can be used to reconstruct!):');
            ledgerEntries.forEach(e => {
                console.log(`  ${e.customer_code} | ${e.customer_name} | ${e.kg} KG | Type: ${e.type}`);
            });
        }

        // Step 4: Check adjacent dates for reference (June 25 and June 23)
        console.log('\n--- Step 4: Checking adjacent dates for reference ---');
        const { rows: june25 } = await pool.query(
            `SELECT db.id, db.date, dbi.customer_id, dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
             FROM "DailyBook" db
             JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.date = '2026-06-25'
             ORDER BY c.customer_code`
        );
        console.log(`June 25 entries: ${june25.length} customers`);

        const { rows: june23 } = await pool.query(
            `SELECT db.id, db.date, dbi.customer_id, dbi.kg, dbi.present, dbi.note, c.name, c.customer_code
             FROM "DailyBook" db
             JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE db.date = '2026-06-23'
             ORDER BY c.customer_code`
        );
        console.log(`June 23 entries: ${june23.length} customers`);

        // Step 5: List all DailyBook dates to see the gap
        console.log('\n--- Step 5: All DailyBook dates ---');
        const { rows: allDates } = await pool.query(
            `SELECT db.date, COUNT(dbi.id) as item_count, SUM(dbi.kg) as total_kg
             FROM "DailyBook" db
             LEFT JOIN "DailyBookItem" dbi ON dbi.daily_book_id = db.id
             GROUP BY db.date
             ORDER BY db.date DESC
             LIMIT 10`
        );
        allDates.forEach(d => {
            const marker = d.date === '2026-06-24' ? ' ← FOUND!' : '';
            console.log(`  ${d.date} | ${d.item_count} customers | ${Math.round(d.total_kg || 0)} KG${marker}`);
        });

        // Step 6: Check audit logs for what was deleted
        console.log('\n--- Step 6: Checking audit logs for deletion record ---');
        const { rows: auditLogs } = await pool.query(
            `SELECT * FROM "AuditLog" 
             WHERE action = 'DELETE_DAILY_BOOK' AND details LIKE '%2026-06-24%'
             ORDER BY created_at DESC`
        );
        console.log('Deletion audit logs:', auditLogs.length > 0 ? JSON.stringify(auditLogs, null, 2) : 'No specific deletion log found');

        // Also check general recent deletions
        const { rows: recentDeletions } = await pool.query(
            `SELECT * FROM "AuditLog" 
             WHERE action = 'DELETE_DAILY_BOOK'
             ORDER BY created_at DESC
             LIMIT 5`
        );
        console.log('\nRecent daily book deletions:');
        recentDeletions.forEach(l => {
            console.log(`  ${l.created_at} | ${l.username} | ${l.details}`);
        });

        console.log('\n=== ANALYSIS COMPLETE ===');
        
        // If ledger data exists, offer to restore
        if (ledgerEntries.length > 0) {
            console.log('\n🟢 GOOD NEWS: Ledger has June 24 product data!');
            console.log('We can reconstruct the daily book from ledger entries.');
            console.log('Run with --restore flag to restore.');
        } else {
            console.log('\n🟡 Ledger has no June 24 data.');
            console.log('Will need to check if we can reconstruct from other sources.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

recover();
