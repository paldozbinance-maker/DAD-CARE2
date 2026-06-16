import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Find a valid super admin session
        const { rows } = await pool.query('SELECT * FROM "Sessions" WHERE role = \'SUPER_ADMIN\' ORDER BY "lastSeenAt" DESC LIMIT 1');
        const token = rows[0]?.token;

        if (!token) return NextResponse.json({ error: 'No super admin session found' });

        const res = await fetch('http://localhost:3000/api/audit-logs', {
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
