const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config({ path: '.env' });
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

async function run() {
  console.log('Starting avatar cleanup...');
  try {
    // AdminSession
    const res1 = await pool.query(`UPDATE "AdminSession" SET avatar_url = NULL WHERE length(avatar_url) > 2000;`);
    console.log(`Cleaned ${res1.rowCount} from AdminSession`);

    // User
    const res2 = await pool.query(`UPDATE "User" SET avatar_url = NULL WHERE length(avatar_url) > 2000;`);
    console.log(`Cleaned ${res2.rowCount} from User`);

    // Customer
    const res3 = await pool.query(`UPDATE "Customer" SET avatar_url = NULL WHERE length(avatar_url) > 2000;`);
    console.log(`Cleaned ${res3.rowCount} from Customer`);

    console.log('Cleanup complete!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}

run();
