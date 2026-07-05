import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const query = `
            SELECT 
                ('2026-06-28'::date + (
                    (FLOOR(EXTRACT(EPOCH FROM (CURRENT_DATE AT TIME ZONE 'Africa/Mogadishu' - '2026-06-28'::date)) / 86400)::int / 2) * 2
                )::int * '1 day'::interval)::date as d1_correct,
                ('2026-06-28'::date + (
                    (FLOOR(EXTRACT(EPOCH FROM (CURRENT_DATE AT TIME ZONE 'Africa/Mogadishu' - '2026-06-28'::date)) / 86400)::int / 2) * 2 + 1
                )::int * '1 day'::interval)::date as d2_correct
        `;
        const { rows } = await pool.query(query);
        return NextResponse.json({ result: rows });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 200 });
    }
}
