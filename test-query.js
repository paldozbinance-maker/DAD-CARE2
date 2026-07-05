const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres.sydbsvaoppoyrajphlhk:kSRGT0AYXHHpoP8d@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true",
    ssl: { rejectUnauthorized: false }
});

async function test() {
    const query = `
        WITH target_pair AS (
            SELECT
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2
                )::int * '1 day'::interval)::date AS date1,
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2 + 1
                )::int * '1 day'::interval)::date AS date2
        ),
        prev_pair AS (
            SELECT
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2 - 2
                )::int * '1 day'::interval)::date AS date1,
                ('2026-06-28'::date + (
                    ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) / 2 * 2 - 1
                )::int * '1 day'::interval)::date AS date2
        )
        SELECT 
            (SELECT date1 FROM target_pair) as target_d1,
            (SELECT date2 FROM target_pair) as target_d2,
            (SELECT date1 FROM prev_pair) as prev_d1,
            (SELECT date2 FROM prev_pair) as prev_d2,
            (NOW() AT TIME ZONE 'Africa/Mogadishu')::date as local_now,
            ((NOW() AT TIME ZONE 'Africa/Mogadishu')::date - '2026-06-28'::date) as days_diff
    `;

    try {
        const res = await pool.query(query);
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

test();
