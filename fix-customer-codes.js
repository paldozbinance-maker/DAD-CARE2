// Fix all broken customer codes - assigns sequential numbers 1, 2, 3...
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.cfepckoviapjbxpauldr:0frWmNafDE1JzS6E@aws-1-eu-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixCustomerCodes() {
    const client = await pool.connect();
    try {
        console.log('Connecting to database...');
        
        // Get ALL active customers sorted by created_at (oldest first = lowest number)
        const { rows } = await client.query(`
            SELECT id, name, customer_code, created_at
            FROM "Customer"
            WHERE deleted_at IS NULL
            ORDER BY created_at ASC
        `);
        
        console.log('Found ' + rows.length + ' active customers');
        
        await client.query('BEGIN');
        
        // Step 1: Set all to temp codes to avoid UNIQUE conflicts
        await client.query('UPDATE "Customer" SET customer_code = \'tmp_\' || id WHERE deleted_at IS NULL');
        console.log('Set temp codes...');
        
        // Step 2: Assign 1, 2, 3... in order of creation
        for (let i = 0; i < rows.length; i++) {
            const newCode = String(i + 1);
            await client.query(
                'UPDATE "Customer" SET customer_code = $1 WHERE id = $2',
                [newCode, rows[i].id]
            );
            console.log('  #' + newCode + ' -> ' + rows[i].name);
        }
        
        await client.query('COMMIT');
        console.log('\nSUCCESS! All customer codes fixed.');
        console.log('Total customers re-coded: ' + rows.length);
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('ERROR:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixCustomerCodes();
