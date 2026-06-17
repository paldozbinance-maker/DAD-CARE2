import { Pool } from 'pg';

// Use the connection string (Transaction Mode is fine for general queries, 
// using Session mode (DIRECT_URL) for prepared statements compatibility if needed, 
// but usually Pooler works if prepared statements are disabled or named properly.
// Safest for Supabase Transaction pooler is to NOT use prepared statements or use Session mode.)
// Given we have DIRECT_URL configured, let's use that for stability with 'pg'.

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

declare global {
    var pool: Pool | undefined;
}

let pool: Pool;

if (!globalThis.pool) {
    globalThis.pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, // Required for Supabase in some envs
        max: 2, // Limit max connections per serverless instance to prevent exhaustion
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });
}
pool = globalThis.pool;

export default pool;
