/**
 * reset-superadmin-password.js
 * Run: node reset-superadmin-password.js
 *
 * This script resets the SUPER_ADMIN user's password to a new value
 * by bcrypt-hashing it and writing it directly to the database.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// ─── CONFIGURE YOUR NEW PASSWORD HERE ─────────────────────────────────────────
const NEW_PASSWORD = 'paldoz123';  // ← change this to whatever you want
// ─────────────────────────────────────────────────────────────────────────────

const DATABASE_URL =
    'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    const client = await pool.connect();
    try {
        // 1. Find the superadmin user
        const { rows } = await client.query(
            `SELECT id, username, role FROM "User" WHERE role = 'SUPER_ADMIN' ORDER BY updated_at DESC LIMIT 5`
        );

        if (rows.length === 0) {
            console.log('❌  No SUPER_ADMIN user found in the database.');
            return;
        }

        console.log('\n👤  Found SUPER_ADMIN account(s):');
        rows.forEach(r => console.log(`   id=${r.id}  username="${r.username}"  role=${r.role}`));

        // 2. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
        console.log('\n🔐  New password hashed successfully.');

        // 3. Update ALL super-admin accounts (usually just one)
        const { rowCount } = await client.query(
            `UPDATE "User" SET password = $1, updated_at = NOW() WHERE role = 'SUPER_ADMIN'`,
            [hashedPassword]
        );

        console.log(`\n✅  Password reset for ${rowCount} SUPER_ADMIN account(s).`);
        console.log(`\n🔑  New password: "${NEW_PASSWORD}"`);
        console.log('    You can now log in with this password.\n');
    } catch (err) {
        console.error('❌  Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
