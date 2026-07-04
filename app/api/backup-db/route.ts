import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        console.log('Attempting to extract data from Supabase...');

        // Query all important tables
        const [usersRes, customersRes, ledgerRes, dailyBookRes] = await Promise.all([
            pool.query('SELECT * FROM "User"'),
            pool.query('SELECT * FROM "Customer"'),
            pool.query('SELECT * FROM "Ledger"'),
            pool.query('SELECT * FROM "DailyBook"')
        ]);

        const backupData = {
            users: usersRes.rows,
            customers: customersRes.rows,
            ledger: ledgerRes.rows,
            dailyBook: dailyBookRes.rows,
            timestamp: new Date().toISOString()
        };

        // Save to a local file in the project folder
        const backupPath = path.join(process.cwd(), 'database_backup_safe.json');
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        return NextResponse.json({
            success: true,
            message: 'Data successfully extracted and saved locally!',
            file: backupPath,
            counts: {
                users: backupData.users.length,
                customers: backupData.customers.length,
                ledger: backupData.ledger.length,
                dailyBook: backupData.dailyBook.length
            }
        });

    } catch (error: any) {
        console.error('Backup Failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            hint: 'If the database connection is completely paused by Supabase, it will refuse connections.'
        }, { status: 500 });
    }
}
