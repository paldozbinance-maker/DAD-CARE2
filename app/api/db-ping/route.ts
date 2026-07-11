import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
    const url = process.env.DATABASE_URL || '';
    const masked = url ? url.replace(/:([^:@]+)@/, ':***@') : 'NOT SET';

    if (!url) {
        return NextResponse.json({ ok: false, error: 'DATABASE_URL is not set', url: masked });
    }

    const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 8000,
    });

    try {
        const result = await pool.query('SELECT NOW() as time');
        await pool.end();
        return NextResponse.json({
            ok: true,
            time: result.rows[0].time,
            url: masked,
        });
    } catch (error: any) {
        await pool.end().catch(() => {});
        return NextResponse.json({
            ok: false,
            error: error.message,
            code: error.code,
            url: masked,
        });
    }
}
