const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    console.log('Connected to DB');

    try {
        await client.query(`
            ALTER TABLE "DailyBookItem" 
            ADD COLUMN IF NOT EXISTS present boolean DEFAULT true,
            ADD COLUMN IF NOT EXISTS note text;
        `);
        console.log('Successfully added present and note columns to DailyBookItem');
    } catch (e) {
        console.error('Error executing migration:', e);
    } finally {
        await client.end();
    }
}

main();
