const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 
    "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    console.log('🔄 Starting Customer soft-delete migration...\n');

    const migrations = [
        {
            name: 'Add deleted_at to Customer',
            sql: `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Index on Customer.deleted_at for fast filtering',
            sql: `CREATE INDEX IF NOT EXISTS "idx_customer_deleted_at" ON "Customer" ("deleted_at") WHERE "deleted_at" IS NULL`
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

    console.log(`\n✅ Customer Migration complete! ${successCount} applied, ${skipCount} skipped.`);
    await pool.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
