import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/require-session';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;
    try {
        const { rows } = await pool.query('SELECT * FROM "User" ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();
    const { username, name, password, role, gender, phone, avatar_url, assigned_customer_ids } = body;

    try {
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const { rows: existing } = await pool.query('SELECT id FROM "User" WHERE username = $1', [username]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { rows: inserted } = await pool.query(
            `INSERT INTO "User" (id, username, email, name, password, role, is_active, gender, phone, avatar_url, assigned_customer_ids, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
            [
                username,
                `${username}@example.com`,
                name,
                hashedPassword,
                role || 'CUSTOMER',
                true,
                gender || null,
                phone || null,
                avatar_url || null,
                Array.isArray(assigned_customer_ids) ? assigned_customer_ids : []
            ]
        );

        await logAudit(request, 'CREATE_USER', `Created user ${username} with role ${role || 'CUSTOMER'}`);
        return NextResponse.json(inserted[0]);
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

    if (!id) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        await pool.query('DELETE FROM "User" WHERE id = $1', [id]);
        await logAudit(request, 'DELETE_USER', `Deleted user ID: ${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
