import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-session';

export async function GET(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;
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

        // 3. Add User columns
        const addGenderQuery = `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;`;
        const addPhoneQuery = `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`;
        const addAvatarQuery = `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;`;
        const addAssignedQuery = `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "assigned_customer_ids" TEXT[] DEFAULT '{}';`;
        
        await client.query(addGenderQuery);
        await client.query(addPhoneQuery);
        await client.query(addAvatarQuery);
        await client.query(addAssignedQuery);

        // Add high-performance Ledger index to speed up dashboard queries
        const addLedgerIndexQuery = `CREATE INDEX IF NOT EXISTS idx_ledger_customer_created_id ON "Ledger"(customer_id, created_at DESC, id DESC) WHERE deleted_at IS NULL;`;
        await client.query(addLedgerIndexQuery);

        // 4. Update Role Enum for SUPER_ADMIN and USER
        const addRoleEnumQuery = `
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'Role' AND e.enumlabel = 'SUPER_ADMIN') THEN
                    ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'Role' AND e.enumlabel = 'USER') THEN
                    ALTER TYPE "Role" ADD VALUE 'USER';
                END IF;
            END$$;
        `;
        await client.query(addRoleEnumQuery);

        // 5. Seed PALDOZ super admin
        const seedPaldozQuery = `
            INSERT INTO "User" (id, username, email, name, password, role, is_active, updated_at)
            VALUES (gen_random_uuid(), 'paldoz', 'paldoz@superadmin.com', 'PALDOZ', 'paldoz123', 'SUPER_ADMIN', true, NOW())
            ON CONFLICT (username) DO NOTHING;
        `;
        await client.query(seedPaldozQuery);

        client.release();
        await pool.end();

        return NextResponse.json({ 
            success: true, 
            message: "Database schema fixed! You can now save the Manual Reesto Setup and User fields are added." 
        });
    } catch (e: any) {
        await pool.end();
        return NextResponse.json({ 
            success: false, 
            error: e.message 
        }, { status: 500 });
    }
}
