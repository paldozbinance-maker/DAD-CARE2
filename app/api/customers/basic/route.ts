import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    try {
        const query = `
            SELECT 
                id, name, customer_code, gender, avatar_url, phone
            FROM "Customer"
            ORDER BY name ASC;
        `;

        const { rows } = await pool.query(query);
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Fetch Basic Customers Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
