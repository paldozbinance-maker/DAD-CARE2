const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres' });

async function run() {
    try {
        const res = await pool.query('SELECT count(*), min(date), max(date) FROM "DailyBook" WHERE deleted_at IS NULL');
        console.log('DailyBook Count:', res.rows[0]);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
run();
