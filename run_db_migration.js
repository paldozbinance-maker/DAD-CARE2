const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function migrate() {
    console.log('Starting DB migration for new User fields...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to DB');

        const queries = [
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "assigned_customer_ids" TEXT[] DEFAULT '{}';`
        ];

        for (const query of queries) {
            try {
                await client.query(query);
                console.log(`Executed: ${query}`);
            } catch (e) {
                console.error(`Error executing: ${query}\nError: ${e.message}`);
            }
        }

        console.log('✅ DB Migration Completed!');
        client.release();
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
