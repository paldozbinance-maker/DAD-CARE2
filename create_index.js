const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

async function main() {
  console.log('Creating compound index on Ledger...');
  try {
    const res = await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ledger_customer_type_deleted_date
      ON "Ledger"(customer_id, type, deleted_at, reference_date);
    `);
    console.log('Index created successfully!');
  } catch (err) {
    console.error('Error creating index:', err);
  } finally {
    await pool.end();
  }
}

main();
