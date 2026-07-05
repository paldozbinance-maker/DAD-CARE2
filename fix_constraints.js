const { Client } = require('pg');
require('dotenv').config();

async function fixConstraints() {
    const newDbUrl = 'postgresql://postgres.sydbsvaoppoyrajphlhk:kSRGT0AYXHHpoP8d@aws-0-eu-west-3.pooler.supabase.com:6543/postgres';
    console.log('Connecting to NEW database to fix constraints...');
    const client = new Client({
        connectionString: newDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const queries = [
            // AdminSession uses token as primary key
            'ALTER TABLE "AdminSession" ADD PRIMARY KEY (token);',
            
            // Settings uses key as primary key
            'ALTER TABLE "Settings" ADD PRIMARY KEY (key);',
            
            // User email uniqueness
            'ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE (email);',
            
            // User username uniqueness
            'ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE (username);',
            
            // Customer code uniqueness
            'ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customer_code_key" UNIQUE (customer_code);',
            
            // DailyBook date uniqueness
            'ALTER TABLE "DailyBook" ADD CONSTRAINT "DailyBook_date_key" UNIQUE (date);'
        ];

        for (const query of queries) {
            try {
                await client.query(query);
                console.log(`✅ Applied: ${query}`);
            } catch (err) {
                if (err.message.includes('already a primary key') || err.message.includes('already exists') || err.message.includes('multiple primary keys')) {
                    console.log(`⏩ Skipped (already exists): ${query}`);
                } else {
                    console.error(`❌ Failed: ${query}`, err.message);
                }
            }
        }
        console.log('🎉 All constraints fixed! Logging in will work now.');
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await client.end();
    }
}

fixConstraints();
