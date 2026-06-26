/**
 * Migration: Add soft-delete columns to DailyBook, DailyBookItem, and Ledger tables.
 * 
 * This adds a `deleted_at` TIMESTAMP column (nullable) to each table.
 * Records with deleted_at IS NOT NULL are treated as "in the trash".
 * 
 * Run with: node create-soft-delete-columns.js
 */

const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 
    "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    console.log('🔄 Starting soft-delete migration...\n');

    const migrations = [
        {
            name: 'Add deleted_at to DailyBook',
            sql: `ALTER TABLE "DailyBook" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Add deleted_at to DailyBookItem',
            sql: `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Add deleted_at to Ledger',
            sql: `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Add deleted_by to DailyBook',
            sql: `ALTER TABLE "DailyBook" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT DEFAULT NULL`
        },
        {
            name: 'Add deleted_by to Ledger',
            sql: `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT DEFAULT NULL`
        },
        {
            name: 'Index on DailyBook.deleted_at for fast filtering',
            sql: `CREATE INDEX IF NOT EXISTS "idx_dailybook_deleted_at" ON "DailyBook" ("deleted_at") WHERE "deleted_at" IS NULL`
        },
        {
            name: 'Index on DailyBookItem.deleted_at for fast filtering',
            sql: `CREATE INDEX IF NOT EXISTS "idx_dailybookitem_deleted_at" ON "DailyBookItem" ("deleted_at") WHERE "deleted_at" IS NULL`
        },
        {
            name: 'Index on Ledger.deleted_at for fast filtering',
            sql: `CREATE INDEX IF NOT EXISTS "idx_ledger_deleted_at" ON "Ledger" ("deleted_at") WHERE "deleted_at" IS NULL`
        },
        {
            // Performance index: speeds up daily-book-init query
            name: 'Index on DailyBookItem.daily_book_id',
            sql: `CREATE INDEX IF NOT EXISTS "idx_dailybookitem_daily_book_id" ON "DailyBookItem" ("daily_book_id")`
        },
        {
            // Performance index: speeds up ledger queries
            name: 'Index on Ledger.customer_id + created_at',
            sql: `CREATE INDEX IF NOT EXISTS "idx_ledger_customer_created" ON "Ledger" ("customer_id", "created_at" DESC)`
        },
        {
            // Performance index: speeds up ledger date queries
            name: 'Index on Ledger.reference_date',
            sql: `CREATE INDEX IF NOT EXISTS "idx_ledger_reference_date" ON "Ledger" ("reference_date")`
        }
    ];

    let successCount = 0;
    let skipCount = 0;

    for (const m of migrations) {
        try {
            await pool.query(m.sql);
            console.log(`  ✅ ${m.name}`);
            successCount++;
        } catch (error) {
            if (error.message?.includes('already exists')) {
                console.log(`  ⏭️  ${m.name} (already exists)`);
                skipCount++;
            } else {
                console.error(`  ❌ ${m.name}: ${error.message}`);
            }
        }
    }

    console.log(`\n✅ Migration complete! ${successCount} applied, ${skipCount} skipped.`);
    await pool.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
