import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAllSessions } from '@/lib/sessions-store';
import { unstable_cache } from 'next/cache';

const getDatabaseSizes = unstable_cache(
    async () => {
        const results: any = {};

        // 1. /api/admin-sessions
        const allSessions = await getAllSessions();
        const sanitizeSession = (s: any) => ({
            username: s.username,
            name: s.name,
            role: s.role,
            loginAt: s.loginAt,
            lastSeenAt: new Date(s.lastSeenAt).toISOString(),
            isOnline: (Date.now() - s.lastSeenAt) < 5 * 60 * 1000,
        });
        const sessionList = allSessions.map(sanitizeSession);
        results.adminSessions = {
            count: sessionList.length,
            sizeKb: (JSON.stringify({ online: sessionList, all: sessionList, totalOnline: sessionList.length }).length / 1024).toFixed(2),
        };

        // Ultra-Fast size calculation using Postgres System Metadata (pg_class)
        // This takes 0 milliseconds and 0 I/O compared to doing heavy SELECT * scans.
        const { rows: stats } = await pool.query(`
            SELECT 
                relname as table_name, 
                reltuples as row_count,
                pg_relation_size(oid) as bytes
            FROM pg_class 
            WHERE relname IN ('DailyBookItem', 'Customer', 'Ledger')
        `);

        const getStat = (tableName: string) => stats.find(s => s.table_name === tableName) || { row_count: 0, bytes: 0 };

        // 2. /api/daily-book-history
        results.dailyBookHistory = {
            count: Math.max(0, parseInt(getStat('DailyBookItem').row_count)),
            sizeKb: (parseInt(getStat('DailyBookItem').bytes) / 1024).toFixed(2),
        };

        // 3. /api/customers?lite=true
        results.customersLite = {
            count: Math.max(0, parseInt(getStat('Customer').row_count)),
            sizeKb: (parseInt(getStat('Customer').bytes) / 1024).toFixed(2),
        };

        // 4. /api/payments
        results.payments = {
            count: Math.max(0, parseInt(getStat('Ledger').row_count)),
            sizeKb: (parseInt(getStat('Ledger').bytes) / 1024).toFixed(2),
        };

        return results;
    },
    ['ping-sizes-cache'],
    { revalidate: 120 } // Cache for 2 minutes to prevent any DB spam
);

export const GET = async () => {
    try {
        const results = await getDatabaseSizes();
        return NextResponse.json(results);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
