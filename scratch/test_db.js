const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/dadcare' });
pool.query(`
    SELECT c.name, l.reference_date, l.created_at, l.amount
    FROM "Ledger" l
    JOIN "Customer" c ON c.id = l.customer_id
    WHERE l.type = 'PRODUCT' AND l.deleted_at IS NULL
      AND (c.name ILIKE '%Xaliimo%' OR c.name ILIKE '%Shiino%')
    ORDER BY c.name, l.reference_date
`).then(res => { console.log(res.rows); pool.end(); }).catch(console.error);
