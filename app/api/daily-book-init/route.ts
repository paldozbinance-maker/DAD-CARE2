import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// Merged init endpoint: returns customers + history + latest date in ONE request
// This replaces 3 separate API calls on Daily Book page load
export async function GET() {
    try {
        const supabase = await createClient();

        // Run all 3 queries in parallel
        const [customersResult, historyResult] = await Promise.all([
            // 1. Customers (basic info only - fast)
            pool.query(`
                SELECT id, name, customer_code, gender, avatar_url, phone
                FROM "Customer"
                ORDER BY name ASC
            `),

            // 2. Full daily book history with items
            supabase
                .from('DailyBook')
                .select(`
                    id,
                    date,
                    items:DailyBookItem (
                        id,
                        kg,
                        present,
                        note,
                        customer:Customer (
                            id,
                            name,
                            customer_code,
                            gender,
                            avatar_url
                        )
                    )
                `)
                .order('date', { ascending: false })
        ]);

        // Process history
        const history = (historyResult.data || []).map((book: any) => {
            const totalKg = book.items.reduce((sum: number, item: any) => sum + (item.kg || 0), 0);
            return {
                id: book.id,
                date: book.date,
                totalKg,
                items: book.items.map((item: any) => ({
                    customer_id: item.customer?.id,
                    kg: item.kg,
                    present: item.present,
                    note: item.note,
                    customer: item.customer
                }))
            };
        });

        // Latest date (first in descending-ordered list)
        const latestDate = history.length > 0 ? history[0].date : null;

        return NextResponse.json({
            customers: customersResult.rows,
            history,
            latestDate,
        });
    } catch (error: any) {
        console.error('Daily Book Init Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
