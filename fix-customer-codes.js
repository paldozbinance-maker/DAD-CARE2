/**
 * Fix Customer Codes Script
 * 
 * This script reassigns proper sequential numeric customer codes
 * to all customers whose codes are corrupted (UUID-like values).
 * 
 * Customers with already-valid numeric codes keep their number.
 * Customers with UUID-like codes get reassigned starting after the max existing numeric code.
 * 
 * Run with: node fix-customer-codes.js
 */
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.cfepckoviapjbxpauldr:0frWmNafDE1JzS6E@aws-1-eu-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixCodes() {
    const client = await pool.connect();
    try {
        console.log('🔍 Reading all customers from database...\n');

        const { rows } = await client.query(`
            SELECT id, customer_code, name, deleted_at, created_at
            FROM "Customer"
            ORDER BY created_at ASC
        `);

        console.log(`Found ${rows.length} total customers.\n`);

        // Separate valid numeric codes from broken UUID-like codes
        const validNumeric = rows.filter(r => /^\d+$/.test(r.customer_code));
        const brokenCodes = rows.filter(r => !/^\d+$/.test(r.customer_code));

        console.log(`✅ Already have valid numeric codes: ${validNumeric.length}`);
        console.log(`❌ Broken/UUID codes that need fixing: ${brokenCodes.length}\n`);

        if (brokenCodes.length === 0) {
            console.log('🎉 All codes are already valid! Nothing to fix.');
            return;
        }

        // Find the highest existing numeric code
        const maxCode = validNumeric.reduce((max, r) => Math.max(max, parseInt(r.customer_code)), 0);
        console.log(`📊 Current highest numeric code: ${maxCode}`);
        console.log(`📝 Will assign new codes starting from: ${maxCode + 1}\n`);

        // Show what will be changed
        console.log('Changes to be made:');
        let nextCode = maxCode + 1;
        const updates = [];
        for (const customer of brokenCodes) {
            updates.push({ id: customer.id, name: customer.name, newCode: String(nextCode), oldCode: customer.customer_code });
            nextCode++;
        }
        updates.forEach(u => {
            console.log(`  ${u.name}: [${u.oldCode.substring(0, 30)}...] → #${u.newCode}`);
        });

        console.log('\n⚡ Applying fixes...');
        await client.query('BEGIN');
        for (const u of updates) {
            await client.query(
                `UPDATE "Customer" SET customer_code = $1 WHERE id = $2`,
                [u.newCode, u.id]
            );
        }
        await client.query('COMMIT');
        console.log(`\n✅ SUCCESS! Fixed ${updates.length} customer codes.`);

        // Verify final state
        console.log('\n📋 Final state - all active customers:');
        const { rows: final } = await client.query(`
            SELECT customer_code, name
            FROM "Customer"
            WHERE deleted_at IS NULL
            ORDER BY 
                CASE WHEN customer_code ~ '^[0-9]+$' THEN customer_code::int ELSE 9999 END ASC,
                name ASC
        `);
        final.forEach(r => console.log(`  #${r.customer_code} → ${r.name}`));

    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('\n❌ ERROR - rolled back all changes:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixCodes();
