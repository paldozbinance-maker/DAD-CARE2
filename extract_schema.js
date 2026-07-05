const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function extract() {
    console.log('Connecting to old database to extract exact schema...');
    // Connect to the old database (we use the backup script's fallback or existing env if not overwritten yet)
    const client = new Client({
        connectionString: "postgresql://postgres.vjujiyyhlvsdzzntnymt:THZneYeFVn6AtsOt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
              AND table_name != '_prisma_migrations';
        `);
        
        const tables = tablesRes.rows.map(r => r.table_name);
        const schema = {};

        for (const table of tables) {
            const colsRes = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            schema[table] = colsRes.rows;
        }

        fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
        console.log('✅ Schema extraction complete! Saved to schema_dump.json');

    } catch (err) {
        console.error('Extraction failed:', err);
    } finally {
        await client.end();
    }
}

extract();
