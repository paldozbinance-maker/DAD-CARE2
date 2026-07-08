const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function fix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('Connected to database...');

    try {
        // Drop the broken table (it has no business data, only login tokens)
        await client.query(`DROP TABLE IF EXISTS "AdminSession" CASCADE;`);
        console.log('✅ Dropped old AdminSession table');

        // Recreate it with the correct PRIMARY KEY
        await client.query(`
            CREATE TABLE "AdminSession" (
                token        TEXT PRIMARY KEY,
                user_id      TEXT,
                username     TEXT NOT NULL,
                name         TEXT,
                role         TEXT NOT NULL,
                avatar_url   TEXT,
                ip_address   TEXT,
                user_agent   TEXT,
                login_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                expires_at   TIMESTAMPTZ NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_adminsession_username ON "AdminSession"(username);
            CREATE INDEX IF NOT EXISTS idx_adminsession_last_seen ON "AdminSession"(last_seen_at);
        `);
        console.log('✅ Recreated AdminSession table with correct PRIMARY KEY');
        console.log('');
        console.log('✅ DONE! You can now log in normally.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

fix();
