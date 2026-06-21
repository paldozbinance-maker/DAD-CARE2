import pool from './lib/db';

async function main() {
    try {
        const res = await pool.query(`
            SELECT l.* 
            FROM "Ledger" l
            JOIN "Customer" c ON l.customer_id = c.id
            WHERE c.name ILIKE '%Shii%'
            ORDER BY l.created_at DESC 
            LIMIT 5
        `);
        console.log("SHII CALI LEDGER:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
main();
