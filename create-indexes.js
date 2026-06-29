require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function run() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("No database URL found");
        process.exit(1);
    }
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Creating database indexes...");
        
        await pool.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_customer_id ON "Ledger"(customer_id);');
        console.log("Created idx_ledger_customer_id");
        
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ledger_customer_created_id ON "Ledger"(customer_id, created_at DESC, id DESC) WHERE deleted_at IS NULL;');
        console.log("Created idx_ledger_customer_created_id");
        
        await pool.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_type ON "Ledger"(type);');
        console.log("Created idx_ledger_type");
        
        await pool.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_reference_date ON "Ledger"(reference_date);');
        console.log("Created idx_ledger_reference_date");

        // DailyBook indexes
        await pool.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dailybook_date ON "DailyBook"(date);');
        console.log("Created idx_dailybook_date");

        // DailyBookItem indexes
        await pool.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dailybookitem_daily_book_id ON "DailyBookItem"(daily_book_id);');
        console.log("Created idx_dailybookitem_daily_book_id");

        await pool.query('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dailybookitem_customer_id ON "DailyBookItem"(customer_id);');
        console.log("Created idx_dailybookitem_customer_id");

        console.log("All indexes created successfully!");
    } catch (e) {
        console.error("Error creating indexes:", e);
    } finally {
        await pool.end();
    }
}

run();
