const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function reload() {
    console.log('Reloading Supabase Schema Cache...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        await client.query("NOTIFY pgrst, 'reload schema'");
        console.log('✅ Schema Cache Reloaded!');
        client.release();
    } catch (e) {
        console.error('❌ Reload Failed:', e.message);
    } finally {
        await pool.end();
    }
}

reload();
