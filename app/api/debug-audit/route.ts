import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const logsQuery = `
            SELECT 
                "AuditLog".id, 
                "AuditLog".username, 
                "AuditLog".action, 
                "AuditLog".details
            FROM "AuditLog"
            ORDER BY "AuditLog".created_at DESC
            LIMIT 5
        `;
        const { rows: logs } = await pool.query(logsQuery);
        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
