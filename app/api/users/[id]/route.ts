import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    const body = await request.json();
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('User')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
