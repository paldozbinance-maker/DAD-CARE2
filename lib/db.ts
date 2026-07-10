import { Pool } from 'pg';

// MUST use DATABASE_URL (Transaction Pooler on port 6543) for Vercel Serverless.
// DIRECT_URL (Session mode on port 5432) is limited to exactly 15 connections 
// on the Supabase free tier and will instantly crash with (EMAXCONNSESSION) on Vercel.

// Append ?connection_limit=1 to strictly enforce serverless connection limits at the string level
// (even though we also set max: 1 in the Pool config below as a double-safeguard).
const rawConnectionString = process.env.DATABASE_URL || '';
const connectionString = rawConnectionString.includes('?') 
    ? `${rawConnectionString}&connection_limit=1` 
    : `${rawConnectionString}?connection_limit=1`;

declare global {
    // Prevent multiple instances of the pool during hot-reloads in development
    // or across concurrent serverless function executions on the same worker
    var pool: Pool | undefined;
}

let pool: Pool;

if (!globalThis.pool) {
    globalThis.pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, 
        
        // STRICT CONNECTION LIMIT: We only need 1 connection per serverless instance.
        // Vercel handles concurrency by spinning up multiple instances.
        // The Supabase Pooler (DATABASE_URL) will multiplex these connections perfectly.
        max: 1, 
        
        // VERCEL SERVERLESS OPTIMIZATIONS:
        // Kill idle connections immediately after 1 second so Vercel functions don't hold connections open when frozen.
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 5000,
        
        // Allow the Node.js event loop to exit even if a DB connection is technically idle.
        allowExitOnIdle: true,
    });
}

// Assign to the exported variable from the global singleton
pool = globalThis.pool;

export default pool;
