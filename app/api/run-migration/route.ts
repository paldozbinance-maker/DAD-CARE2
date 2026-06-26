import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const migrations = [
        {
            name: 'Add deleted_at to DailyBook',
            sql: `ALTER TABLE "DailyBook" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Add deleted_at to DailyBookItem',
            sql: `ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Add deleted_at to Ledger',
            sql: `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`
        },
        {
            name: 'Add deleted_by to DailyBook',
            sql: `ALTER TABLE "DailyBook" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT DEFAULT NULL`
        },
        {
            name: 'Add deleted_by to Ledger',
            sql: `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT DEFAULT NULL`
        },
        {
            name: 'Index on DailyBook.deleted_at',
            sql: `CREATE INDEX IF NOT EXISTS "idx_dailybook_deleted_at" ON "DailyBook" ("deleted_at") WHERE "deleted_at" IS NULL`
        },
        {
            name: 'Index on DailyBookItem.deleted_at',
            sql: `CREATE INDEX IF NOT EXISTS "idx_dailybookitem_deleted_at" ON "DailyBookItem" ("deleted_at") WHERE "deleted_at" IS NULL`
        },
        {
            name: 'Index on Ledger.deleted_at',
            sql: `CREATE INDEX IF NOT EXISTS "idx_ledger_deleted_at" ON "Ledger" ("deleted_at") WHERE "deleted_at" IS NULL`
        },
        {
            name: 'Index on DailyBookItem.daily_book_id',
            sql: `CREATE INDEX IF NOT EXISTS "idx_dailybookitem_daily_book_id" ON "DailyBookItem" ("daily_book_id")`
        },
        {
            name: 'Index on Ledger.customer_id + created_at',
            sql: `CREATE INDEX IF NOT EXISTS "idx_ledger_customer_created" ON "Ledger" ("customer_id", "created_at" DESC)`
        },
        {
            name: 'Index on Ledger.reference_date',
            sql: `CREATE INDEX IF NOT EXISTS "idx_ledger_reference_date" ON "Ledger" ("reference_date")`
        }
    ];

    const results: Array<{ name: string; status: string }> = [];

    for (const m of migrations) {
        try {
            await pool.query(m.sql);
            results.push({ name: m.name, status: '✅ Applied' });
        } catch (error: any) {
            if (error.message?.includes('already exists')) {
                results.push({ name: m.name, status: '⏭️ Already exists' });
            } else {
                results.push({ name: m.name, status: `❌ ${error.message}` });
            }
        }
    }

    return NextResponse.json({
        message: 'Soft-delete migration complete',
        results
    });
}
