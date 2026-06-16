import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "Settings" (
                key VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);

        const { rows } = await pool.query('SELECT key, value FROM "Settings"');
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return NextResponse.json(settings);
    } catch (error: any) {
        console.error('Settings GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Settings POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
