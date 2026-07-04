import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results: string[] = [];

        // ── Fix "User" table missing columns ──
        const userCols = [
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS email TEXT`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS gender TEXT`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS assigned_customer_ids TEXT[]`,
        ];
        for (const q of userCols) {
            await pool.query(q);
        }
        results.push('✅ User table: added email, gender, phone, avatar_url, assigned_customer_ids');

        // ── Fix "Customer" table missing columns ──
        const custCols = [
            `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
            `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS gender TEXT`,
        ];
        for (const q of custCols) {
            await pool.query(q);
        }
        results.push('✅ Customer table: added avatar_url, gender');

        // ── Fix "Ledger" table missing columns ──
        const ledgerCols = [
            `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS receipt_id UUID`,
            `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        ];
        for (const q of ledgerCols) {
            await pool.query(q);
        }
        results.push('✅ Ledger table: added receipt_id, deleted_by');

        // ── Fix "DailyBook" table missing columns ──
        const dbCols = [
            `ALTER TABLE "DailyBook" ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        ];
        for (const q of dbCols) {
            await pool.query(q);
        }
        results.push('✅ DailyBook table: added deleted_by');

        // ── Fix "DailyBookItem" table missing columns ──
        const dbiCols = [
            `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS present BOOLEAN DEFAULT true`,
            `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS note TEXT`,
            `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
            `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
            `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE`,
        ];
        for (const q of dbiCols) {
            await pool.query(q);
        }
        results.push('✅ DailyBookItem table: added present, note, created_at, updated_at, deleted_at');

        // ── Create indexes for performance ──
        const indexes = [
            `CREATE INDEX IF NOT EXISTS idx_dailybook_date ON "DailyBook" (date)`,
            `CREATE INDEX IF NOT EXISTS idx_dailybookitem_bookid ON "DailyBookItem" (daily_book_id)`,
            `CREATE INDEX IF NOT EXISTS idx_dailybookitem_customerid ON "DailyBookItem" (customer_id)`,
            `CREATE INDEX IF NOT EXISTS idx_customer_code ON "Customer" (customer_code)`,
            `CREATE INDEX IF NOT EXISTS idx_ledger_customerid ON "Ledger" (customer_id)`,
            `CREATE INDEX IF NOT EXISTS idx_ledger_receiptid ON "Ledger" (receipt_id)`,
            `CREATE INDEX IF NOT EXISTS idx_ledger_deleted ON "Ledger" (deleted_at)`,
        ];
        for (const q of indexes) {
            await pool.query(q);
        }
        results.push('✅ All performance indexes created');

        // ── Verify final state ──
        const [users, customers, ledger, dailyBook, dailyBookItems] = await Promise.all([
            pool.query('SELECT count(*) FROM "User"'),
            pool.query('SELECT count(*) FROM "Customer"'),
            pool.query('SELECT count(*) FROM "Ledger"'),
            pool.query('SELECT count(*) FROM "DailyBook"'),
            pool.query('SELECT count(*) FROM "DailyBookItem"'),
        ]);

        return NextResponse.json({
            success: true,
            message: 'ALL MISSING COLUMNS FIXED!',
            fixes: results,
            counts: {
                users: parseInt(users.rows[0].count),
                customers: parseInt(customers.rows[0].count),
                ledger: parseInt(ledger.rows[0].count),
                dailyBook: parseInt(dailyBook.rows[0].count),
                dailyBookItems: parseInt(dailyBookItems.rows[0].count),
            }
        });

    } catch (error: any) {
        console.error('Fix Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
