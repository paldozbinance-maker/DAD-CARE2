import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSession } from '@/lib/require-session';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    try {
        // Get Book (only if not soft-deleted)
        const { rows: books } = await pool.query(
            `SELECT * FROM "DailyBook" WHERE date = $1::date AND deleted_at IS NULL`,
            [dateStr]
        );

        if (books.length === 0) {
            return NextResponse.json(null);
        }

        const book = books[0];

        // Get Items with Customer data
        const { rows: items } = await pool.query(
            `SELECT dbi.*, 
                    json_build_object('id', c.id, 'name', c.name, 'customer_code', c.customer_code) as customer 
             FROM "DailyBookItem" dbi
             JOIN "Customer" c ON dbi.customer_id = c.id
             WHERE dbi.daily_book_id = $1 AND dbi.deleted_at IS NULL`,
            [book.id]
        );

        return NextResponse.json({ ...book, items });
    } catch (error: any) {
        console.error('Fetch Book Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { errorResponse, session } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { date: dateStr, items } = body;

    try {
        // 1. Get or Create DailyBook (recycle if soft-deleted)
        let bookId;
        const { rows: existing } = await pool.query(
            `SELECT id, deleted_at FROM "DailyBook" WHERE date = $1::date`,
            [dateStr]
        );

        if (existing.length > 0) {
            bookId = existing[0].id;
            if (existing[0].deleted_at !== null) {
                // Restore the soft-deleted book if they are saving over it
                await pool.query(
                    `UPDATE "DailyBook" SET deleted_at = NULL, deleted_by = NULL WHERE id = $1`,
                    [bookId]
                );
            }
        } else {
            const { rows: newBook } = await pool.query(
                `INSERT INTO "DailyBook" (id, date, created_at) VALUES (gen_random_uuid(), $1::date, NOW()) RETURNING id`,
                [dateStr]
            );
            bookId = newBook[0].id;
        }

        // 2. Delete existing items for this book (Draft mode overwrite - HARD delete is fine here to clean up old draft items)
        await pool.query(`DELETE FROM "DailyBookItem" WHERE daily_book_id = $1`, [bookId]);

        // 3. Insert new items
        if (items && items.length > 0) {
            const itemsToInsert = items
                .filter((i: any) => i.kg > 0 || i.present === false || (i.note && i.note.trim() !== ''))
                .map((i: any) => [
                    bookId,
                    i.customer_id,
                    parseFloat(i.kg) || 0,
                    i.present !== false, // true by default
                    i.note || null
                ]);

            if (itemsToInsert.length > 0) {
                // Bulk insert using unnest
                await pool.query(
                    `INSERT INTO "DailyBookItem" (id, daily_book_id, customer_id, kg, present, note)
                     SELECT gen_random_uuid(), * FROM UNNEST($1::uuid[], $2::uuid[], $3::float8[], $4::boolean[], $5::text[])`,
                    [
                        itemsToInsert.map((i: any[]) => i[0]),
                        itemsToInsert.map((i: any[]) => i[1]),
                        itemsToInsert.map((i: any[]) => i[2]),
                        itemsToInsert.map((i: any[]) => i[3]),
                        itemsToInsert.map((i: any[]) => i[4])
                    ]
                );
            }
        }

        await logAudit(request, 'SAVE_DAILY_BOOK', `Saved daily book entry for ${dateStr} with ${items?.length || 0} items`);
        return NextResponse.json({ success: true, bookId });
    } catch (error: any) {
        console.error('Save DailyBook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { errorResponse, session } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    if (!dateStr) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    try {
        // First get the book ID
        const { rows: books } = await pool.query(
            `SELECT id FROM "DailyBook" WHERE date = $1::date AND deleted_at IS NULL`,
            [dateStr]
        );

        if (books.length === 0) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }
        
        const bookId = books[0].id;
        const username = session?.username || 'unknown';

        // Soft delete items
        await pool.query(
            `UPDATE "DailyBookItem" SET deleted_at = NOW() WHERE daily_book_id = $1 AND deleted_at IS NULL`,
            [bookId]
        );

        // Soft delete the main book
        await pool.query(
            `UPDATE "DailyBook" SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
            [username, bookId]
        );

        await logAudit(request, 'DELETE_DAILY_BOOK', `Moved daily book entry for ${dateStr} to Trash`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete DailyBook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

