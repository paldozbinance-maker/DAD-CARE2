import pool from './lib/db.js';

async function main() {
    const res = await pool.query(`SELECT customer_id, new_debt FROM "Ledger" JOIN "Customer" ON "Ledger".customer_id = "Customer".id WHERE "Customer".name ILIKE '%Shii Cali%' ORDER BY "Ledger".created_at DESC LIMIT 5`);
    console.log(res.rows);
    process.exit(0);
}

main();
