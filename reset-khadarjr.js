const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const NEW_PASSWORD = 'password123'; // Default password for reset

const DATABASE_URL = 'postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `SELECT id, username, role FROM "User" WHERE username = 'khadarjr'`
        );

        if (rows.length === 0) {
            console.log('User khadarjr not found. Creating user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
            
            await client.query(
                `INSERT INTO "User" (username, password, role, updated_at) VALUES ($1, $2, 'ADMIN', NOW())`,
                ['khadarjr', hashedPassword]
            );
            console.log('User khadarjr created with password: password123 and role ADMIN');
            return;
        }

        console.log('Found user khadarjr:', rows[0]);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

        await client.query(
            `UPDATE "User" SET password = $1, role = 'ADMIN', updated_at = NOW() WHERE username = 'khadarjr'`,
            [hashedPassword]
        );

        console.log('Password reset for khadarjr. New password: password123, role: ADMIN');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
