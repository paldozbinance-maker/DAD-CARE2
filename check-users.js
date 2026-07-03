const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 
    "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    const { rows } = await pool.query('SELECT username, password, is_active FROM "User" LIMIT 5');
    console.log(rows);
    await pool.end();
}

run();
