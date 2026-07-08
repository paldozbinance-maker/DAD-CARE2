import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSession } from '@/lib/require-session';
import { trackApiRoute } from '@/lib/egress-tracker';

export const GET = trackApiRoute('/api/settings', async (request: Request) => {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const { rows } = await pool.query('SELECT key, value FROM "Settings"');
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        const res = NextResponse.json(settings);
        // Settings rarely change — cache for 60 seconds to avoid repeated DB hits
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return res;
    } catch (error: any) {
        console.error('Settings GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});

export const POST = trackApiRoute('/api/settings', async (request: Request) => {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }

        // Create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "Settings" (
                key VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);

        await pool.query(
            `INSERT INTO "Settings" (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
            [key, value.toString()]
        );

        await logAudit(request, 'UPDATE_SETTING', `Updated setting ${key} to ${value}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Settings POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
