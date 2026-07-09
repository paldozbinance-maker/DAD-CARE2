// Verify current customer codes in the database
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.cfepckoviapjbxpauldr:0frWmNafDE1JzS6E@aws-1-eu-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(`
            SELECT customer_code, name, deleted_at
            FROM "Customer"
            ORDER BY 
                CASE WHEN customer_code ~ '^[0-9]+$' THEN customer_code::int ELSE 9999 END ASC,
                name ASC
        `);
        console.log('Current customer codes in database:');
        rows.forEach(r => {
            const status = r.deleted_at ? ' [INACTIVE]' : '';
            console.log('  #' + r.customer_code + ' -> ' + r.name + status);
        });
        console.log('\nTotal: ' + rows.length);
    } finally {
        client.release();
        await pool.end();
    }
}

verify();
