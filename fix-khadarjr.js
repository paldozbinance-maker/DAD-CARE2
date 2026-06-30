const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    });
    await client.connect();
    const res = await client.query("UPDATE \"User\" SET role = 'ADMIN' WHERE username = 'khadarjr' RETURNING *;");
    console.log("Updated user:", res.rows);
    await client.end();
}
run().catch(console.error);
