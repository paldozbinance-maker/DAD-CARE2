const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback to .env if .env.local doesn't exist

async function backup() {
    console.log('Connecting to database...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Get all tables
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
              AND table_name != '_prisma_migrations';
        `);
        
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log('Found tables:', tables);

        const dbBackup = {
            timestamp: new Date().toISOString(),
            tables: {}
        };

        for (const table of tables) {
            console.log(`Backing up ${table}...`);
            const res = await client.query(`SELECT * FROM "${table}"`);
            dbBackup.tables[table] = res.rows;
            console.log(`  -> ${res.rows.length} rows exported.`);
        }

        fs.writeFileSync('full_database_backup.json', JSON.stringify(dbBackup, null, 2));
        console.log('✅ Backup complete! Saved to full_database_backup.json');

    } catch (err) {
        console.error('Backup failed:', err);
    } finally {
        await client.end();
    }
}

backup();
