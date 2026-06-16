import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { rows } = await pool.query('SELECT * FROM "AdminSession" WHERE role = \'SUPER_ADMIN\' ORDER BY "lastSeenAt" DESC LIMIT 1');
        const token = rows[0]?.id;

        if (!token) return NextResponse.json({ error: 'No super admin session found' });

        const res = await fetch('http://localhost:3000/api/audit-logs?limit=200', {
            headers: {
                cookie: `dadwork_session=${token}`
            }
        });

        const data = await res.json();
        return NextResponse.json({ status: res.status, data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
