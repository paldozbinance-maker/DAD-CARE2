import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import newPool from '@/lib/db'; // Connects to the new database (process.env.DATABASE_URL)

export const dynamic = 'force-dynamic';

export async function GET() {
    let oldPool: Pool | null = null;
    try {
        console.log('Connecting to old database for rescue...');

        // Connect specifically to the OLD database to extract the missing table
        const oldConnectionString = "postgresql://postgres.fxauyrexbwhdnhaagbhw:paldoz%40%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
        oldPool = new Pool({
            connectionString: oldConnectionString,
            ssl: { rejectUnauthorized: false }
        });

        // Extract DailyBookItem
        const { rows: items } = await oldPool.query('SELECT * FROM "DailyBookItem"');
        console.log(`Extracted ${items.length} DailyBookItem records from old DB.`);

        // Create table in NEW database
        await newPool.query(`
            CREATE TABLE IF NOT EXISTS "DailyBookItem" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                daily_book_id UUID NOT NULL REFERENCES "DailyBook"(id),
                customer_id UUID NOT NULL REFERENCES "Customer"(id),
                kg DOUBLE PRECISION NOT NULL,
                present BOOLEAN DEFAULT true,
                note TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                deleted_at TIMESTAMP WITH TIME ZONE
            );
        `);

        // Bulk Insert into NEW database
        if (items.length > 0) {
            const CHUNK_SIZE = 100;
            const columns = ["id", "daily_book_id", "customer_id", "kg", "present", "note", "created_at", "updated_at", "deleted_at"];
            
            for (let i = 0; i < items.length; i += CHUNK_SIZE) {
                const chunk = items.slice(i, i + CHUNK_SIZE);
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
                    INSERT INTO "DailyBookItem" (${columns.join(', ')})
                    VALUES ${placeholders.join(', ')}
                    ON CONFLICT (id) DO NOTHING
                `;
                await newPool.query(query, values);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'RESCUE SUCCESSFUL! Missing table created and populated.',
            records_recovered: items.length
        });

    } catch (error: any) {
        console.error('Rescue Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (oldPool) {
            await oldPool.end();
        }
    }
}
