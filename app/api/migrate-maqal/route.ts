import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        await pool.query('ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS maqal_id INTEGER;');
        return NextResponse.json({ success: true, message: 'Added maqal_id column successfully' });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
