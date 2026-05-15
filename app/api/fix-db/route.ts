import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export async function GET() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();

        // 1. Add 'ADJUSTMENT' to LedgerType enum
        const addEnumValueQuery = `
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'LedgerType' AND e.enumlabel = 'ADJUSTMENT') THEN
                    ALTER TYPE "LedgerType" ADD VALUE 'ADJUSTMENT';
                END IF;
            END$$;
        `;
        await client.query(addEnumValueQuery);

        // 2. Add 'note' column to Ledger table
        const addColumnQuery = `ALTER TABLE "Ledger" ADD COLUMN IF NOT EXISTS "note" TEXT;`;
        await client.query(addColumnQuery);

        client.release();
        await pool.end();

        return NextResponse.json({ 
            success: true, 
            message: "Database schema fixed! You can now save the Manual Reesto Setup." 
        });
    } catch (e: any) {
        await pool.end();
        return NextResponse.json({ 
            success: false, 
            error: e.message 
        }, { status: 500 });
    }
}
