import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { session, errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const [usersRes, customersRes] = await Promise.all([
            pool.query('SELECT count(*) FROM "User"'),
            pool.query('SELECT count(*) FROM "Customer"')
        ]);

        return NextResponse.json({
            status: 'Database Connection is Working',
            users: parseInt(usersRes.rows[0].count),
            customers: parseInt(customersRes.rows[0].count),
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                urlMatches: process.env.DATABASE_URL?.includes('vjujiyyhlvsdzzntnymt')
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
