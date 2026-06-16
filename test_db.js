const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DIRECT_URL || 'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres' });

async function check() {
    const res = await pool.query(`
        SELECT 
            dbi.customer_id,
            dbi.kg,
            db.date as db_date,
            l3.id as ledger_id,
            l3.reference_date as ledger_date
        FROM "DailyBookItem" dbi
        JOIN "DailyBook" db ON dbi.daily_book_id = db.id
        LEFT JOIN "Ledger" l3 ON l3.customer_id = dbi.customer_id AND l3.type = 'PRODUCT' AND l3.reference_date = db.date
        JOIN "Customer" c ON c.id = dbi.customer_id
        WHERE c.customer_code = '16' AND dbi.kg > 0
    `);
    console.table(res.rows);
    process.exit(0);
}
check().catch(console.error);
