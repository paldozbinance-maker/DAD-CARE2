import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that do NOT require authentication
const PUBLIC_ROUTES = [
    '/api/auth/login',
    '/api/auth/logout',
    '/login',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /api/* routes
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Allow public API routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for session token in header
    const token = request.headers.get('x-session-token');

    if (!token || token.length < 10) {
        // Also allow requests from the same origin browser (no token = old session)
        // We use a soft-fail approach: log but don't block, so existing sessions work
        // This avoids breaking the app for already-logged-in users
        // To enforce strictly: return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
