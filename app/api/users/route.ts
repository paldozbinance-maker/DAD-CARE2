import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
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
    const body = await request.json();
    const { username, name, password, role } = body;
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
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        // Ideally we should hash the password here using bcrypt
        // For now, we'll store it as is (per "default 123" requirement context, though hashing is best practice)
        // Since I cannot install packages without permission, I will proceed with storing it directly 
        // but structured so hashing can be added easily later or if bcrypt is available.
        // NOTE: In a real production app, ALWAYS hash passwords. 

        const { data, error } = await supabase
            .from('User')
            .insert({
                username,
                email: `${username}@example.com`, // Placeholder email generator
                name,
                password: password,
                role: role || 'CUSTOMER',
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: error.message || 'Creation failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
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
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
