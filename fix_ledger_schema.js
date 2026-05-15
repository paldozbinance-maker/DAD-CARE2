const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function fixSchema() {
    console.log('Starting Schema Fix using DATABASE_URL...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to DB');

        // 1. Add 'ADJUSTMENT' to LedgerType enum
        // Note: PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE in some versions,
        // so we use a DO block to check if it exists first.
        const addEnumValueQuery = `
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'LedgerType' AND e.enumlabel = 'ADJUSTMENT') THEN
                    ALTER TYPE "LedgerType" ADD VALUE 'ADJUSTMENT';
                END IF;
            END$$;
        `;

        console.log('Adding "ADJUSTMENT" to LedgerType...');
        await client.query(addEnumValueQuery);
        console.log('✅ LedgerType updated');

        // 2. Add 'note' column to Ledger table
        const addColumnQuery = `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "note" TEXT;`;
        console.log('Adding "note" column to Ledger table...');
        await client.query(addColumnQuery);
        console.log('✅ Ledger table updated');

        client.release();
    } catch (e) {
        console.error('❌ Schema Fix Failed:', e.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
