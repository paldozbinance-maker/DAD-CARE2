import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// TEMPORARY password reset endpoint - DELETE THIS FILE AFTER USE
// Usage: GET /api/reset-admin?secret=dadwork2026&newpass=YourNewPassword
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const newpass = searchParams.get('newpass');
    const listUsers = searchParams.get('list');

    // Guard with a secret key
    if (secret !== 'dadwork2026') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        if (listUsers === '1') {
            // Just list all users so we can see usernames
            const { rows } = await pool.query(`SELECT id, username, name, role, is_active FROM "User"`);
            return NextResponse.json({ users: rows });
        }

        if (!newpass) {
            return NextResponse.json({ error: 'Provide ?newpass=YourNewPassword' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newpass, salt);

        // Reset paldoz (SUPER_ADMIN) password
        await pool.query(`UPDATE "User" SET password = $1 WHERE username = 'paldoz'`, [hashed]);
        await pool.query(`UPDATE "User" SET is_active = true WHERE username = 'paldoz'`);

        return NextResponse.json({ 
            success: true, 
            message: `Password for paldoz reset to: ${newpass}`,
            note: 'Delete /app/api/reset-admin/route.ts after you log in!'
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
