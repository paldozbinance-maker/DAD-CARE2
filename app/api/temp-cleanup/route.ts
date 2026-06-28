import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check total rows including deleted ones
        const { rows: total } = await pool.query('SELECT COUNT(*) FROM "DailyBook"');
        const { rows: active } = await pool.query('SELECT COUNT(*) FROM "DailyBook" WHERE deleted_at IS NULL');
        const { rows: deleted } = await pool.query('SELECT COUNT(*) FROM "DailyBook" WHERE deleted_at IS NOT NULL');

        console.log(`[Temp Recovery] Total: ${total[0].count}, Active: ${active[0].count}, Deleted: ${deleted[0].count}`);

        let restoredBooks = 0;
        let restoredItems = 0;

        // 2. If there are deleted records, restore them
        if (parseInt(deleted[0].count, 10) > 0) {
            const resBook = await pool.query('UPDATE "DailyBook" SET deleted_at = NULL, deleted_by = NULL WHERE deleted_at IS NOT NULL');
            restoredBooks = resBook.rowCount || 0;

            const resItems = await pool.query('UPDATE "DailyBookItem" SET deleted_at = NULL WHERE deleted_at IS NOT NULL');
            restoredItems = resItems.rowCount || 0;
        }

        return NextResponse.json({
            message: "Recovery check complete",
            stats: {
                total_in_db: parseInt(total[0].count, 10),
                active_before: parseInt(active[0].count, 10),
                deleted_before: parseInt(deleted[0].count, 10)
            },
            restored: {
                books: restoredBooks,
                items: restoredItems
            }
        });
    } catch (error: any) {
        console.error('Recovery route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
