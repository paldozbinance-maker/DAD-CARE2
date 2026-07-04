import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const fetchCache = 'force-no-store';

export async function GET() {
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
