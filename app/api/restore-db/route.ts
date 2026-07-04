import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        console.log('Starting restoration process...');

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
        console.log('Tables created or verified.');

        // 2. Restore Users
        for (const user of data.users) {
            await pool.query(`
                INSERT INTO "User" (id, username, password, name, role, is_active, created_at, updated_at, last_login, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO NOTHING
            `, [user.id, user.username, user.password, user.name, user.role, user.is_active, user.created_at, user.updated_at, user.last_login, user.deleted_at]);
        }
        console.log('Users restored.');

        // 3. Restore Customers
        for (const customer of data.customers) {
            await pool.query(`
                INSERT INTO "Customer" (id, name, customer_code, phone, gender, address, created_at, updated_at, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO NOTHING
            `, [customer.id, customer.name, customer.customer_code, customer.phone, customer.gender, customer.address, customer.created_at, customer.updated_at, customer.deleted_at]);
        }
        console.log('Customers restored.');

        // 4. Restore DailyBook
        for (const db of data.dailyBook) {
            await pool.query(`
                INSERT INTO "DailyBook" (id, date, is_closed, closed_at, created_at, updated_at, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
            `, [db.id, db.date, db.is_closed, db.closed_at, db.created_at, db.updated_at, db.deleted_at]);
        }
        console.log('DailyBook restored.');

        // 5. Restore Ledger
        for (const l of data.ledger) {
            await pool.query(`
                INSERT INTO "Ledger" (id, customer_id, type, amount, previous_debt, new_debt, note, reference_date, created_at, updated_at, deleted_at, kg, price_per_kg, edit_count)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ON CONFLICT (id) DO NOTHING
            `, [l.id, l.customer_id, l.type, l.amount, l.previous_debt, l.new_debt, l.note, l.reference_date, l.created_at, l.updated_at, l.deleted_at, l.kg, l.price_per_kg, l.edit_count]);
        }
        console.log('Ledger restored.');

        return NextResponse.json({
            success: true,
            message: 'All tables created and data successfully restored into the new database!',
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
