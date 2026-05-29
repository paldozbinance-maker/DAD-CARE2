import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;
        const supabase = await createClient();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Check user credentials against database
        const { data: user, error } = await supabase
            .from('User')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error) throw error;

        // Fallback for hardcoded admin login
        if (username === 'admin' && password === '123' && !user) {
            return NextResponse.json({
                id: 'admin-hardcoded',
                username: 'admin',
                name: 'Administrator',
                role: 'ADMIN',
                is_active: true,
                assigned_customer_ids: []
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        // Compare password directly (plain text as approved and aligned with existing DB setup)
        if (user.password !== password) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        if (!user.is_active) {
            return NextResponse.json({ error: 'This user account is inactive' }, { status: 403 });
        }

        // Return user profile
        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
    }
}
