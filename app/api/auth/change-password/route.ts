import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const { errorResponse } = await requireSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { username, currentPassword, newPassword } = body;

    try {
        // 1. Verify current password
        const { rows } = await pool.query('SELECT id, password FROM "User" WHERE username = $1 LIMIT 1', [username]);
        const user = rows[0] || null;

        if (!user) {
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

        await pool.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedNewPassword, user.id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
