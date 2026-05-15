const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function verifyFixes() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to DB');

        // Check ADJUSTMENT in LedgerType
        const enumRes = await client.query(`
            SELECT e.enumlabel 
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid 
            WHERE t.typname = 'LedgerType' AND e.enumlabel = 'ADJUSTMENT'
        `);
        if (enumRes.rows.length > 0) {
            console.log('✅ LedgerType ADJUSTMENT: Found');
        } else {
            console.error('❌ LedgerType ADJUSTMENT: NOT FOUND');
        }

        // Check note in Ledger table
        const colRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Ledger' AND column_name = 'note'
        `);
        if (colRes.rows.length > 0) {
            console.log('✅ Ledger note column: Found');
        } else {
            console.error('❌ Ledger note column: NOT FOUND');
        }

        client.release();
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

verifyFixes();
