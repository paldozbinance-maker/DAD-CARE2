import { Client } from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Try .env.local first, then .env
const envLocal = fs.existsSync('.env.local');
dotenv.config({ path: envLocal ? '.env.local' : '.env' });

async function run() {
    console.log("Using Database URL:", process.env.DATABASE_URL);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    try {
        await client.query('ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS maqal_id INTEGER;');
        console.log("Migration SUCCESS");
    } catch (e) {
        console.error("Migration ERROR:", e);
    } finally {
        await client.end();
    }
}

run();
