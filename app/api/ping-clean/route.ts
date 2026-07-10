import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const GET = async () => {
    try {
        const res1 = await pool.query(`UPDATE "AdminSession" SET avatar_url = NULL WHERE length(avatar_url) > 1000;`);
        const res2 = await pool.query(`UPDATE "User" SET avatar_url = NULL WHERE length(avatar_url) > 1000;`);
        const res3 = await pool.query(`UPDATE "Customer" SET avatar_url = NULL WHERE length(avatar_url) > 1000;`);
        
        return NextResponse.json({
            success: true,
            adminSessionsCleaned: res1.rowCount,
            usersCleaned: res2.rowCount,
            customersCleaned: res3.rowCount
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
