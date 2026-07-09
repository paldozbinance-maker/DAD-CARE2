const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dadwork' });

async function check() {
    try {
        const res = await pool.query("SELECT COUNT(*) FROM \"Ledger\" WHERE type = 'PAYMENT'");
        console.log('Total Payments in DB:', res.rows[0].count);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
