require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function run() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ No database URL found in .env");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("🚀 Starting soft-delete migration...\n");

        // --- DailyBook ---
        const { rows: dbCols } = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'DailyBook' AND column_name IN ('deleted_at', 'deleted_by')
        `);
        const dbColNames = dbCols.map(r => r.column_name);

        if (!dbColNames.includes('deleted_at')) {
            await pool.query(`ALTER TABLE "DailyBook" ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL`);
            console.log('✅ Added deleted_at to DailyBook');
        } else {
            console.log('ℹ️  deleted_at already exists on DailyBook');
        }

        if (!dbColNames.includes('deleted_by')) {
            await pool.query(`ALTER TABLE "DailyBook" ADD COLUMN deleted_by TEXT DEFAULT NULL`);
            console.log('✅ Added deleted_by to DailyBook');
        } else {
            console.log('ℹ️  deleted_by already exists on DailyBook');
        }

        // --- DailyBookItem ---
        const { rows: dbiCols } = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'DailyBookItem' AND column_name IN ('deleted_at')
        `);
        const dbiColNames = dbiCols.map(r => r.column_name);

        if (!dbiColNames.includes('deleted_at')) {
            await pool.query(`ALTER TABLE "DailyBookItem" ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL`);
            console.log('✅ Added deleted_at to DailyBookItem');
        } else {
            console.log('ℹ️  deleted_at already exists on DailyBookItem');
        }

        // --- Ledger ---
        const { rows: lCols } = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'Ledger' AND column_name IN ('deleted_at', 'deleted_by')
        `);
        const lColNames = lCols.map(r => r.column_name);

        if (!lColNames.includes('deleted_at')) {
            await pool.query(`ALTER TABLE "Ledger" ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL`);
            console.log('✅ Added deleted_at to Ledger');
        } else {
            console.log('ℹ️  deleted_at already exists on Ledger');
        }

        if (!lColNames.includes('deleted_by')) {
            await pool.query(`ALTER TABLE "Ledger" ADD COLUMN deleted_by TEXT DEFAULT NULL`);
            console.log('✅ Added deleted_by to Ledger');
        } else {
            console.log('ℹ️  deleted_by already exists on Ledger');
        }

        // --- Indexes for performance ---
        console.log("\n📊 Creating indexes for soft-delete columns...");

        await pool.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dailybook_deleted_at 
            ON "DailyBook"(deleted_at) WHERE deleted_at IS NOT NULL
        `);
        console.log('✅ Index on DailyBook.deleted_at');

        await pool.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dailybookitem_deleted_at 
            ON "DailyBookItem"(deleted_at) WHERE deleted_at IS NOT NULL
        `);
        console.log('✅ Index on DailyBookItem.deleted_at');

        await pool.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_deleted_at 
            ON "Ledger"(deleted_at) WHERE deleted_at IS NOT NULL
        `);
        console.log('✅ Index on Ledger.deleted_at');

        console.log("\n🎉 Migration complete! Recycle Bin is now active.");
    } catch (e) {
        console.error("❌ Migration error:", e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
