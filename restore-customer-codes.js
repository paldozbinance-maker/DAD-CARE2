// Restores ALL original customer_codes from the full_database_backup.json
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://postgres.cfepckoviapjbxpauldr:0frWmNafDE1JzS6E@aws-1-eu-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function restoreCustomerCodes() {
    const client = await pool.connect();
    try {
        console.log('Reading backup file...');
        const backupPath = path.join(__dirname, 'full_database_backup.json');
        const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

        const customers = backup.tables.Customer;
        console.log('Found ' + customers.length + ' customers in backup');

        await client.query('BEGIN');

        // Step 1: Temporarily scramble all codes to avoid UNIQUE constraint conflicts
        await client.query('UPDATE "Customer" SET customer_code = \'tmp_\' || id');
        console.log('Set temporary codes to avoid conflicts...');

        let restored = 0;
        let skipped = 0;

        for (const c of customers) {
            if (!c.customer_code) {
                console.log('  SKIP (no code): ' + c.name);
                skipped++;
                continue;
            }
            // For deleted customers, restore the 'del_' prefix
            const code = c.customer_code;
            const result = await client.query(
                'UPDATE "Customer" SET customer_code = $1 WHERE id = $2',
                [code, c.id]
            );
            if (result.rowCount > 0) {
                console.log('  Restored #' + code + ' -> ' + c.name);
                restored++;
            } else {
                console.log('  NOT FOUND in DB: ' + c.name + ' (' + c.id + ')');
                skipped++;
            }
        }

        await client.query('COMMIT');
        console.log('\nSUCCESS!');
        console.log('Restored: ' + restored + ' customers');
        console.log('Skipped/Not Found: ' + skipped);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('ERROR - rolled back:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

restoreCustomerCodes();
