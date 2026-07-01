/**
 * Netlify Scheduled Function — keep-alive.mts
 *
 * Runs every 10 minutes via Netlify's built-in cron scheduler.
 * Sends a GET request to /api/ping to keep the serverless function warm
 * so users never hit a cold start.
 *
 * ✅ Free on Netlify (scheduled functions included in free tier)
 * ✅ No external services needed
 * ✅ Zero cold starts for active-hour usage
 */

import type { Config } from '@netlify/functions';

export default async function handler() {
    // Netlify automatically provides the primary site URL as the URL env var
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'https://dad-care.netlify.app';
    const pingUrl = `${siteUrl}/api/ping`;

    try {
        const res = await fetch(pingUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'Netlify-KeepAlive/1.0' },
            signal: AbortSignal.timeout(10000), // 10s timeout
        });

        const data = await res.json();
        console.log(`[keep-alive] ✅ Ping OK — ${pingUrl} → ${JSON.stringify(data)}`);
    } catch (err: any) {
        console.error(`[keep-alive] ❌ Ping failed — ${pingUrl}:`, err.message);
    }
}

// Run every 10 minutes — keeps the function warm 24/7
export const config: Config = {
    schedule: '*/10 * * * *',
};
