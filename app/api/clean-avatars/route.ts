import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const GET = async () => {
    try {
        const { rows: customerRows } = await pool.query(`
            UPDATE "Customer" 
            SET avatar_url = NULL 
            WHERE avatar_url LIKE 'data:image%'
            RETURNING id
        `);

        const { rows: userRows } = await pool.query(`
            UPDATE "User" 
            SET avatar_url = NULL 
            WHERE avatar_url LIKE 'data:image%'
            RETURNING id
        `);

        return NextResponse.json({
            message: 'Successfully cleared base64 avatars',
            cleared_customers: customerRows.length,
            cleared_users: userRows.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
