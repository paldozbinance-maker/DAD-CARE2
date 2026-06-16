import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/require-session';

export async function GET(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { username, name, password, role, gender, phone, avatar_url, assigned_customer_ids } = body;
    const supabase = await createClient();

    try {
        // Basic validation
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Check if username exists
        const { data: existingUser } = await supabase
            .from('User')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('User')
            .insert({
                username,
                email: `${username}@example.com`, // Placeholder email generator
                name,
                password: password,
                role: role || 'CUSTOMER',
                is_active: true,
                gender: gender || null,
                phone: phone || null,
                avatar_url: avatar_url || null,
                assigned_customer_ids: Array.isArray(assigned_customer_ids) ? assigned_customer_ids : []
            })
            .select()
            .single();

        if (error) throw error;
        await logAudit(request, 'CREATE_USER', `Created user ${username} with role ${role || 'CUSTOMER'}`);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: error.message || 'Creation failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supabase = await createClient();

    if (!id) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('User')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await logAudit(request, 'DELETE_USER', `Deleted user ID: ${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
