const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function check(url, label) {
    if (!url) {
        console.log(`❌ ${label} is missing`);
        return;
    }
    console.log(`Checking ${label}...`);
    const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
    });
    try {
        const client = await pool.connect();
        console.log(`✅ ${label} WORKED!`);
        client.release();
    } catch (e) {
        console.log(`❌ ${label} FAILED: ${e.message}`);
    } finally {
        await pool.end();
    }
}

async function run() {
    await check(process.env.DIRECT_URL, 'DIRECT_URL');
    await check(process.env.DATABASE_URL, 'DATABASE_URL');
}

run();
