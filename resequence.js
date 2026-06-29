const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^"(.*)"$/, '$1');
});

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resequence() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`
      SELECT id, name, customer_code
      FROM "Customer"
      WHERE deleted_at IS NULL
      ORDER BY REGEXP_REPLACE(TRIM(customer_code), '[^0-9]', '', 'g')::int ASC NULLS LAST, customer_code ASC
    `);

    console.log('Found', rows.length, 'customers');
    console.log('Before:', rows.map(r => r.customer_code + '=' + r.name).join(', '));

    // Step 1: temp negative codes to avoid unique conflicts
    await client.query(`UPDATE "Customer" SET customer_code = '-' || EXTRACT(EPOCH FROM NOW())::int || '-' || id WHERE deleted_at IS NULL`);

    // Step 2: assign sequential 1..N
    const changed = [];
    for (let i = 0; i < rows.length; i++) {
      const newCode = String(i + 1);
      if (rows[i].customer_code.trim() !== newCode) {
        changed.push(`  ${rows[i].customer_code} -> ${newCode}  (${rows[i].name})`);
      }
      await client.query('UPDATE "Customer" SET customer_code = $1 WHERE id = $2', [newCode, rows[i].id]);
    }

    await client.query('COMMIT');
    console.log('\nSUCCESS! Renumbered 1 to', rows.length);
    if (changed.length > 0) {
      console.log('Changes:');
      changed.forEach(c => console.log(c));
    } else {
      console.log('(No changes needed)');
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('ERROR:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resequence();
