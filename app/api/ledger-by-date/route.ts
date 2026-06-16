import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

// Returns list of customer_ids that already have a PRODUCT ledger entry for a given date
export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    try {
        const { rows } = await pool.query(
            `SELECT DISTINCT customer_id FROM "Ledger" WHERE reference_date = $1 AND type = 'PRODUCT'`,
            [date]
        );
        return NextResponse.json(rows.map((r: any) => r.customer_id));
    } catch (error: any) {
        console.error('Ledger by date error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
