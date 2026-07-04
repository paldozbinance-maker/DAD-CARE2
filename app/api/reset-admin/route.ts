import { NextResponse } from 'next/server';

// This endpoint has been permanently disabled for security.
// The hardcoded secret was a security risk. Use reset-superadmin-password.js locally instead.
export async function GET() {
    return NextResponse.json({ error: 'This endpoint is disabled.' }, { status: 410 });
}
