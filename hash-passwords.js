require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("No database URL found");
        process.exit(1);
    }
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Fetching users...");
        const { rows: users } = await pool.query('SELECT id, username, password FROM "User"');
        console.log(`Found ${users.length} users.`);

        let updatedCount = 0;

        for (const user of users) {
            // Check if password is not already a bcrypt hash (bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 chars long)
            if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                console.log(`Hashing password for user: ${user.username}`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                
                await pool.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
                updatedCount++;
            }
        }

        console.log(`Successfully hashed ${updatedCount} plaintext passwords.`);
    } catch (e) {
        console.error("Error hashing passwords:", e);
    } finally {
        await pool.end();
    }
}

run();
