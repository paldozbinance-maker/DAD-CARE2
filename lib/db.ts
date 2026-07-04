import { Pool } from 'pg';

// MUST use DATABASE_URL (Transaction Pooler on port 6543) for Vercel Serverless.
// DIRECT_URL (Session mode on port 5432) is limited to exactly 15 connections 
// on the Supabase free tier and will instantly crash with (EMAXCONNSESSION) on Vercel.

const connectionString = process.env.DATABASE_URL;

declare global {
    var pool: Pool | undefined;
}

let pool: Pool;

if (!globalThis.pool) {
    globalThis.pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, 
        // We only need 1 connection per serverless instance because Vercel 
        // handles concurrency by spinning up multiple instances.
        // The Supabase Pooler (DATABASE_URL) will multiplex these connections perfectly.
        max: 1, 
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
}
pool = globalThis.pool;

export default pool;
