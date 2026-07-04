import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
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
