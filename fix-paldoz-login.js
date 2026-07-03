require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 
    "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    const username = 'paldoz';
    const password = 'srk9043';

    try {
        console.log(`Checking if user ${username} exists...`);
        const { rows } = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (rows.length > 0) {
            console.log(`User ${username} exists. Updating password and role to SUPER_ADMIN...`);
            await pool.query(
                `UPDATE "User" 
                 SET password = $1, role = 'SUPER_ADMIN', is_active = true 
                 WHERE username = $2`,
                [hashedPassword, username]
            );
            console.log(`✅ Password successfully updated for ${username}!`);
        } else {
            console.log(`User ${username} NOT found. Creating superadmin user...`);
            await pool.query(
                `INSERT INTO "User" (id, username, email, name, password, role, is_active, created_at, updated_at)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, 'SUPER_ADMIN', true, NOW(), NOW())`,
                [username, `${username}@admin.com`, 'Paldoz Admin', hashedPassword]
            );
            console.log(`✅ Superadmin user ${username} created successfully!`);
        }
    } catch (error) {
        console.error('Error fixing user:', error);
    } finally {
        await pool.end();
    }
}

run();
