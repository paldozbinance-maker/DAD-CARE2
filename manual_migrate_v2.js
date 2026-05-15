const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function migrate() {
    console.log('Starting Manual Migration using DATABASE_URL...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to DB');

        // Add columns if they don't exist
        const queries = [
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,

            // Add unique constraint for username
            `DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_username_key') THEN
                    ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
                END IF;
            END$$;`
        ];

        for (const query of queries) {
            try {
                await client.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            } catch (e) {
                console.error(`Error executing ${query.substring(0, 20)}...: ${e.message}`);
            }
        }

        console.log('✅ Manual Migration Completed!');
        client.release();
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
