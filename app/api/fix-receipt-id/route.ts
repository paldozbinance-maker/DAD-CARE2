import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { session, errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        console.log('Fixing Ledger receipt_id...');

        // 1. Add the missing column to the new database
        await pool.query(`ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS receipt_id UUID`);

        // 2. Read the local backup which contains the receipt_id data
        const backupPath = path.join(process.cwd(), 'database_backup_safe.json');
        if (!fs.existsSync(backupPath)) {
            return NextResponse.json({ error: 'Backup file not found!' }, { status: 404 });
        }

        const rawData = fs.readFileSync(backupPath, 'utf8');
        const data = JSON.parse(rawData);

        // 3. Update the Ledger table with the missing receipt_ids
        let updatedCount = 0;
        const ledgersWithReceipts = data.ledger.filter((l: any) => l.receipt_id);
        
        for (const l of ledgersWithReceipts) {
            await pool.query(`UPDATE "Ledger" SET receipt_id = $1 WHERE id = $2`, [l.receipt_id, l.id]);
            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            message: 'LEDGER FIXED! receipt_id column added and data restored.',
            receipts_recovered: updatedCount
        });

    } catch (error: any) {
        console.error('Fix Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
