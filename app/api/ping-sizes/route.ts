import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAllSessions } from '@/lib/sessions-store';

export const GET = async () => {
    try {
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

        // 2. /api/daily-book-history
        const { rows: historyRows } = await pool.query(`
            SELECT date, customer_id, kg, present, note FROM "DailyBookItem" WHERE deleted_at IS NULL LIMIT 200
        `);
        results.dailyBookHistory = {
            count: historyRows.length,
            sizeKb: (JSON.stringify(historyRows).length / 1024).toFixed(2),
        };

        // 3. /api/customers?lite=true
        const { rows: customersLite } = await pool.query(`
            SELECT id, name, customer_code, phone FROM "Customer" WHERE deleted_at IS NULL LIMIT 100
        `);
        results.customersLite = {
            count: customersLite.length,
            sizeKb: (JSON.stringify(customersLite).length / 1024).toFixed(2),
        };

        // 4. /api/payments
        const { rows: payments } = await pool.query(`
            SELECT id, amount, previous_debt, new_debt, created_at FROM "Payment" WHERE deleted_at IS NULL LIMIT 200
        `);
        results.payments = {
            count: payments.length,
            sizeKb: (JSON.stringify({ payments, todayTotal: 0, totalAllTime: 0, count: payments.length }).length / 1024).toFixed(2),
        };

        return NextResponse.json(results);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
