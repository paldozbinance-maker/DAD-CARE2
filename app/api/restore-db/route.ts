import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { requireSession } from '@/lib/require-session';

export const dynamic = 'force-dynamic';

// Helper for bulk inserts
async function bulkInsert(tableName: string, columns: string[], dataArray: any[]) {
    if (dataArray.length === 0) return;
    
    // Process in chunks of 100 to be extremely safe with parameter limits
    const CHUNK_SIZE = 100;
    
    for (let i = 0; i < dataArray.length; i += CHUNK_SIZE) {
        const chunk = dataArray.slice(i, i + CHUNK_SIZE);
        
        const values: any[] = [];
        const placeholders: string[] = [];
        
        let paramIndex = 1;
        for (const row of chunk) {
            const rowPlaceholders = [];
            for (const col of columns) {
                values.push(row[col]);
                rowPlaceholders.push(`$${paramIndex}`);
                paramIndex++;
            }
            placeholders.push(`(${rowPlaceholders.join(', ')})`);
        }
        
        const query = `
            INSERT INTO "${tableName}" (${columns.join(', ')})
            VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO NOTHING
        `;
        
        await pool.query(query, values);
    }
}

export async function GET(request: Request) {
    const { session, errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        console.log('Starting BULK restoration process...');

        const backupPath = path.join(process.cwd(), 'database_backup_safe.json');
        if (!fs.existsSync(backupPath)) {
            return NextResponse.json({ error: 'Backup file not found!' }, { status: 404 });
        }

        const rawData = fs.readFileSync(backupPath, 'utf8');
        const data = JSON.parse(rawData);

        // 1. Create Tables in the NEW database
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "User" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                role TEXT DEFAULT 'CUSTOMER',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_login TIMESTAMP WITH TIME ZONE,
                deleted_at TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS "Customer" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                customer_code TEXT UNIQUE NOT NULL,
                phone TEXT,
                gender TEXT,
                address TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                deleted_at TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS "DailyBook" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                date TIMESTAMP WITH TIME ZONE NOT NULL,
                is_closed BOOLEAN DEFAULT false,
                closed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                deleted_at TIMESTAMP WITH TIME ZONE,
                UNIQUE(date)
            );

            CREATE TABLE IF NOT EXISTS "Ledger" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id UUID REFERENCES "Customer"(id),
                type TEXT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                previous_debt DECIMAL(12,2) NOT NULL,
                new_debt DECIMAL(12,2) NOT NULL,
                note TEXT,
                reference_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                deleted_at TIMESTAMP WITH TIME ZONE,
                kg DECIMAL(10,2),
                price_per_kg DECIMAL(10,2),
                edit_count INTEGER DEFAULT 0
            );
        `);

        // This approach uses EXACTLY 1 connection because there is no Promise.all!
        await bulkInsert("User", 
            ["id", "username", "password", "name", "role", "is_active", "created_at", "updated_at", "last_login", "deleted_at"], 
            data.users
        );

        await bulkInsert("Customer", 
            ["id", "name", "customer_code", "phone", "gender", "address", "created_at", "updated_at", "deleted_at"], 
            data.customers
        );

        await bulkInsert("DailyBook", 
            ["id", "date", "is_closed", "closed_at", "created_at", "updated_at", "deleted_at"], 
            data.dailyBook
        );

        await bulkInsert("Ledger", 
            ["id", "customer_id", "type", "amount", "previous_debt", "new_debt", "note", "reference_date", "created_at", "updated_at", "deleted_at", "kg", "price_per_kg", "edit_count"], 
            data.ledger
        );

        return NextResponse.json({
            success: true,
            message: 'BULK RESTORE SUCCESSFUL! Zero connection limits hit.',
            counts: {
                users: data.users.length,
                customers: data.customers.length,
                ledger: data.ledger.length,
                dailyBook: data.dailyBook.length
            }
        });

    } catch (error: any) {
        console.error('Restore Failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
