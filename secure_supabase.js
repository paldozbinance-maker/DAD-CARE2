const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function secureDatabase() {
    console.log('Securing Supabase Database (Enabling RLS)...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to DB');

        const { rows: tables } = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public';
        `);

        for (const { tablename } of tables) {
            console.log(`Securing table: ${tablename}...`);
            try {
                await client.query(`ALTER TABLE "${tablename}" ENABLE ROW LEVEL SECURITY;`);
                await client.query(`DROP POLICY IF EXISTS "Deny all public access" ON "${tablename}";`);
                await client.query(`
                    CREATE POLICY "Deny all public access" 
                    ON "${tablename}" 
                    AS RESTRICTIVE 
                    FOR ALL 
                    TO anon 
                    USING (false);
                `);
                console.log(`✅ Secured ${tablename}`);
            } catch (e) {
                console.error(`❌ Error securing ${tablename}: ${e.message}`);
            }
        }

        console.log('✅ Supabase Security Applied Successfully!');
        client.release();
    } catch (e) {
        console.error('❌ Failed to connect or execute:', e.message);
    } finally {
        await pool.end();
    }
}

secureDatabase();
