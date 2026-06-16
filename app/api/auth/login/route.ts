import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions-store';
import { randomBytes } from 'crypto';

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

        let resolvedUser: any = null;

        // Fallback for hardcoded admin login
        if (username === 'admin' && password === '123' && !user) {
            resolvedUser = {
                id: 'admin-hardcoded',
                username: 'admin',
                name: 'Administrator',
                role: 'SUPER_ADMIN',
                is_active: true,
                assigned_customer_ids: []
            };
        } else {
            if (!user) {
                return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
            }
            // Intercept existing database 'admin' user and enforce SUPER_ADMIN role
            if (user.username === 'admin') user.role = 'SUPER_ADMIN';
            // Compare password
            if (user.password !== password) {
                return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
            }
            if (!user.is_active) {
                return NextResponse.json({ error: 'This user account is inactive' }, { status: 403 });
            }
            resolvedUser = user;
        }

        // 🔒 Generate secure session token
        const token = randomBytes(32).toString('hex');
        createSession(token, resolvedUser.id, resolvedUser.username, resolvedUser.role);

        // Return user profile + token
        return NextResponse.json({ ...resolvedUser, sessionToken: token });
    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
    }
}
