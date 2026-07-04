const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Connecting to old database...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT count(*) FROM "Customer"');
    console.log('Success! We can still read your data. Customers count:', res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error('Failed to connect or query:', err.message);
  }
}

testConnection();
