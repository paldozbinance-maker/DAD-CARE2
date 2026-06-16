import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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
        await logAudit(request, 'UPDATE_USER', `Updated user ID: ${id}`);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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
