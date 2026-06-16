import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';

export async function POST(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { username, currentPassword, newPassword } = body;
    const supabase = await createClient();

    try {
        // 1. Verify current password
        // In a real app we'd verify hash. Here we check plain text as per "default 123" simplicity requested
        // but ready for upgrade.
        const { data: user, error: fetchError } = await supabase
            .from('User')
            .select('password, id')
            .eq('username', username)
            .single();

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.password !== currentPassword) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // 2. Update to new password
        const { error: updateError } = await supabase
            .from('User')
            .update({ password: newPassword })
            .eq('id', user.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
