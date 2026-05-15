import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Get all dates that have daily book entries
export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('DailyBook')
            .select('id, date')
            .order('date', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('Fetch Daily Book Dates Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
