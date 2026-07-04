import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const [usersRes, customersRes, ledgerRes, dailyBookRes] = await Promise.all([
            pool.query('SELECT count(*) FROM "User"'),
            pool.query('SELECT count(*) FROM "Customer"'),
            pool.query('SELECT count(*) FROM "Ledger"'),
            pool.query('SELECT count(*) FROM "DailyBook"')
        ]);

        return NextResponse.json({
            users: parseInt(usersRes.rows[0].count),
            customers: parseInt(customersRes.rows[0].count),
            ledger: parseInt(ledgerRes.rows[0].count),
            dailyBook: parseInt(dailyBookRes.rows[0].count)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
