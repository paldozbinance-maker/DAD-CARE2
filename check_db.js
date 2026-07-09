const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ryfshgctzcdhhtrtigys:DadCare2026!DadCare2026!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  try {
    const res = await pool.query('SELECT id, customer_code, name FROM "Customer" LIMIT 5');
    fs.writeFileSync('db_out.json', JSON.stringify(res.rows, null, 2));
    console.log('Done');
  } catch(e) {
    fs.writeFileSync('db_out.json', JSON.stringify({error: e.message}));
  } finally {
    pool.end();
  }
}
run();
