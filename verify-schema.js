const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function verify() {
    console.log('Using DATABASE_URL to check schema...');

    // Use DATABASE_URL since DIRECT_URL is problematic
    const connectionString = process.env.DATABASE_URL;

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected!');

        // Check content of User table columns
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User';
        `);

        console.log('User Table Columns:', res.rows.map(r => r.column_name).join(', '));

        client.release();
    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await pool.end();
    }
}

verify();
