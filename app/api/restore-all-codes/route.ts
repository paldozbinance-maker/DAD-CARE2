import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        console.log('Reading backup file...');
        const backupPath = path.join(process.cwd(), 'full_database_backup.json');
        
        if (!fs.existsSync(backupPath)) {
            return NextResponse.json({ error: 'Backup file not found!' }, { status: 404 });
        }

        const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const customers = backup.tables.Customer;
        console.log('Found ' + customers.length + ' customers in backup');

        await client.query('BEGIN');

        // Step 1: Temporarily scramble all codes to avoid UNIQUE constraint conflicts
        await client.query(`UPDATE "Customer" SET customer_code = 'tmp_' || id`);
        console.log('Set temporary codes to avoid conflicts...');

        let restored = 0;
        let skipped = 0;

        for (const c of customers) {
            if (!c.customer_code) {
                skipped++;
                continue;
            }
            const code = c.customer_code;
            const result = await client.query(
                'UPDATE "Customer" SET customer_code = $1 WHERE id = $2',
                [code, c.id]
            );
            if ((result.rowCount ?? 0) > 0) {
                restored++;
            } else {
                skipped++;
            }
        }

        await client.query('COMMIT');
        
        return NextResponse.json({
            success: true,
            message: `Restored ${restored} customer codes successfully! Skipped ${skipped}.`
        });

    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('ERROR - rolled back:', err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
