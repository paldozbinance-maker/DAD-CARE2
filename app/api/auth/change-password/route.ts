import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { username, currentPassword, newPassword } = body;
    const supabase = await createClient();

    try {
        // 1. Verify current password
        const { data: user, error: fetchError } = await supabase
            .from('User')
            .select('password, id')
            .eq('username', username)
            .single();

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Support both plaintext (legacy accounts) and bcrypt validation
        const isPasswordValid = user.password === currentPassword || await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // 2. Hash and update to new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        const { error: updateError } = await supabase
            .from('User')
            .update({ password: hashedNewPassword })
            .eq('id', user.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
