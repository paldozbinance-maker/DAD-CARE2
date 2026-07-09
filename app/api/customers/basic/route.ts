import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import { trackApiRoute } from '@/lib/egress-tracker';

export const GET = trackApiRoute('/api/customers/basic', async (request: Request) => {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const query = `
            SELECT 
                id, name, customer_code, gender, phone
            FROM "Customer"
            ORDER BY name ASC;
        `;

        const { rows } = await pool.query(query);
        const res = NextResponse.json(rows);
        res.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
        return res;
    } catch (error: any) {
        console.error('Fetch Basic Customers Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
