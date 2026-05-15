const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    console.log('Connected to DB');

    try {
        // 1. Add ADJUSTMENT to LedgerType enum
        console.log('Updating LedgerType enum...');
        await client.query(`
            ALTER TYPE "LedgerType" ADD VALUE IF NOT EXISTS 'ADJUSTMENT';
        `);

        // 2. Add columns to Ledger table
        console.log('Adding columns to Ledger table...');
        await client.query(`
            ALTER TABLE "Ledger" 
            ADD COLUMN IF NOT EXISTS "receipt_id" UUID,
            ADD COLUMN IF NOT EXISTS "note" TEXT;
        `);

        console.log('Migration completed successfully');
    } catch (e) {
        console.error('Error executing migration:', e);
    } finally {
        await client.end();
    }
}

main();
