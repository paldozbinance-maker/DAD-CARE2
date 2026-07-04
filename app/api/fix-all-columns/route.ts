import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { session, errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        const results: string[] = [];

        // STEP 1: Add ALL missing columns (instant)
        await pool.query(`
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS email TEXT;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS gender TEXT;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS assigned_customer_ids TEXT[];
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
            ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS gender TEXT;
            ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS receipt_id UUID;
            ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS deleted_by TEXT;
            ALTER TABLE "DailyBook" ADD COLUMN IF NOT EXISTS deleted_by TEXT;
            ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS present BOOLEAN DEFAULT true;
            ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS note TEXT;
            ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            ALTER TABLE "DailyBookItem" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        `);
        results.push('✅ All missing columns added');

        // STEP 2: Re-import lost data from backup using BULK approach
        const backupPath = path.join(process.cwd(), 'database_backup_safe.json');
        if (fs.existsSync(backupPath)) {
            const rawData = fs.readFileSync(backupPath, 'utf8');
            const data = JSON.parse(rawData);

            // Bulk update Users (single query with unnest)
            const usersWithData = data.users.filter((u: any) => u.avatar_url || u.gender || u.phone || u.email || u.priority);
            if (usersWithData.length > 0) {
                await pool.query(`
                    UPDATE "User" SET
                        avatar_url = COALESCE(v.avatar_url, "User".avatar_url),
                        gender = COALESCE(v.gender, "User".gender),
                        phone = COALESCE(v.phone, "User".phone),
                        email = COALESCE(v.email, "User".email),
                        priority = COALESCE(v.priority, "User".priority)
                    FROM (SELECT unnest($1::uuid[]) as id, unnest($2::text[]) as avatar_url, unnest($3::text[]) as gender, unnest($4::text[]) as phone, unnest($5::text[]) as email, unnest($6::int[]) as priority) v
                    WHERE "User".id = v.id
                `, [
                    usersWithData.map((u: any) => u.id),
                    usersWithData.map((u: any) => u.avatar_url || null),
                    usersWithData.map((u: any) => u.gender || null),
                    usersWithData.map((u: any) => u.phone || null),
                    usersWithData.map((u: any) => u.email || null),
                    usersWithData.map((u: any) => u.priority || 0),
                ]);
            }
            results.push(`✅ ${usersWithData.length} users updated with avatars/priority`);

            // Bulk update Customers
            const custsWithData = data.customers.filter((c: any) => c.avatar_url || c.gender);
            if (custsWithData.length > 0) {
                await pool.query(`
                    UPDATE "Customer" SET
                        avatar_url = COALESCE(v.avatar_url, "Customer".avatar_url),
                        gender = COALESCE(v.gender, "Customer".gender)
                    FROM (SELECT unnest($1::uuid[]) as id, unnest($2::text[]) as avatar_url, unnest($3::text[]) as gender) v
                    WHERE "Customer".id = v.id
                `, [
                    custsWithData.map((c: any) => c.id),
                    custsWithData.map((c: any) => c.avatar_url || null),
                    custsWithData.map((c: any) => c.gender || null),
                ]);
            }
            results.push(`✅ ${custsWithData.length} customers updated with avatars`);

            // Bulk update Ledger receipt_ids (the big one - 884 records in 1 query!)
            const ledgersWithReceipt = data.ledger.filter((l: any) => l.receipt_id);
            if (ledgersWithReceipt.length > 0) {
                // Do in chunks of 500 to avoid parameter limits
                for (let i = 0; i < ledgersWithReceipt.length; i += 500) {
                    const chunk = ledgersWithReceipt.slice(i, i + 500);
                    await pool.query(`
                        UPDATE "Ledger" SET receipt_id = v.receipt_id
                        FROM (SELECT unnest($1::uuid[]) as id, unnest($2::uuid[]) as receipt_id) v
                        WHERE "Ledger".id = v.id
                    `, [
                        chunk.map((l: any) => l.id),
                        chunk.map((l: any) => l.receipt_id),
                    ]);
                }
            }
            results.push(`✅ ${ledgersWithReceipt.length} ledger receipt_ids restored`);
        } else {
            results.push('⚠️ No backup file — skipped data import');
        }

        // STEP 3: Indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_dailybook_date ON "DailyBook" (date);
            CREATE INDEX IF NOT EXISTS idx_dailybookitem_bookid ON "DailyBookItem" (daily_book_id);
            CREATE INDEX IF NOT EXISTS idx_dailybookitem_customerid ON "DailyBookItem" (customer_id);
            CREATE INDEX IF NOT EXISTS idx_customer_code ON "Customer" (customer_code);
            CREATE INDEX IF NOT EXISTS idx_ledger_customerid ON "Ledger" (customer_id);
            CREATE INDEX IF NOT EXISTS idx_ledger_receiptid ON "Ledger" (receipt_id);
            CREATE INDEX IF NOT EXISTS idx_ledger_deleted ON "Ledger" (deleted_at);
        `);
        results.push('✅ Indexes created');

        // STEP 4: Verify
        const [users, customers, ledger, db, dbi] = await Promise.all([
            pool.query('SELECT count(*) as c, count(avatar_url) as a FROM "User"'),
            pool.query('SELECT count(*) as c, count(avatar_url) as a FROM "Customer"'),
            pool.query('SELECT count(*) as c, count(receipt_id) as r FROM "Ledger"'),
            pool.query('SELECT count(*) as c FROM "DailyBook"'),
            pool.query('SELECT count(*) as c FROM "DailyBookItem"'),
        ]);

        return NextResponse.json({
            success: true,
            message: 'COMPLETE DATABASE REPAIR DONE!',
            fixes: results,
            counts: {
                users: parseInt(users.rows[0].c),
                users_with_avatars: parseInt(users.rows[0].a),
                customers: parseInt(customers.rows[0].c),
                customers_with_avatars: parseInt(customers.rows[0].a),
                ledger: parseInt(ledger.rows[0].c),
                ledger_with_receipts: parseInt(ledger.rows[0].r),
                dailyBook: parseInt(db.rows[0].c),
                dailyBookItems: parseInt(dbi.rows[0].c),
            }
        });

    } catch (error: any) {
        console.error('Fix Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
