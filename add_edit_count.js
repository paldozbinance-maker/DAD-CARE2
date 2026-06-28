const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 
    "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    console.log('🔄 Starting migration to add edit_count...\n');

    const sql = `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "edit_count" INTEGER DEFAULT 0`;
    
    try {
        await pool.query(sql);
        console.log(`  ✅ Successfully added edit_count to Ledger table.`);
    } catch (error) {
        if (error.message?.includes('already exists')) {
            console.log(`  ⏭️  edit_count already exists.`);
        } else {
            console.error(`  ❌ Failed to add edit_count: ${error.message}`);
        }
    }

    console.log(`\n✅ Migration complete!`);
    await pool.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
