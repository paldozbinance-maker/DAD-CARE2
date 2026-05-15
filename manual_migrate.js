```javascript
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    console.log('Connected to DB');

    try {
        // Enable UUID extension
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // Create ENUMs
        await client.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM('ADMIN', 'CUSTOMER');
EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
`);

        await client.query(`
      DO $$ BEGIN
        CREATE TYPE "LedgerType" AS ENUM('PRODUCT', 'PAYMENT');
EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
`);

        // Create Tables
        await client.query(`
      CREATE TABLE IF NOT EXISTS "User"(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role "Role" DEFAULT 'CUSTOMER',
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
`);

        await client.query(`
      CREATE TABLE IF NOT EXISTS "Customer"(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
`);

        await client.query(`
      CREATE TABLE IF NOT EXISTS "DailyBook"(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
`);

        await client.query(`
      CREATE TABLE IF NOT EXISTS "DailyBookItem"(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_book_id UUID NOT NULL REFERENCES "DailyBook"(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES "Customer"(id) ON DELETE RESTRICT,
    kg DOUBLE PRECISION NOT NULL
);
`);

        await client.query(`
      CREATE TABLE IF NOT EXISTS "Ledger"(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES "Customer"(id) ON DELETE RESTRICT,
    type "LedgerType" NOT NULL,
    reference_date DATE,
    kg DOUBLE PRECISION,
    price_per_kg DOUBLE PRECISION,
    amount DOUBLE PRECISION NOT NULL,
    previous_debt DOUBLE PRECISION NOT NULL,
    new_debt DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
`);

        console.log('Tables created successfully');
    } catch (e) {
        console.error('Error executing migration:', e);
    } finally {
        await client.end();
    }
}

main();
