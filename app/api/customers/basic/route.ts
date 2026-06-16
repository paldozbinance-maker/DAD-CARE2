import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
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
