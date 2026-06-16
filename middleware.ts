import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'dadwork_session';

// Routes that do NOT require authentication
const PUBLIC_PAGE_ROUTES = ['/login'];
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/temp-cleanup'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow all public page routes
    if (PUBLIC_PAGE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
        return NextResponse.next();
    }

    // Allow public API routes (login only – logout is intentionally excluded so it can clear the cookie)
    if (PUBLIC_API_ROUTES.some(r => pathname.startsWith(r))) {
        return NextResponse.next();
    }

    // Read session token from httpOnly cookie (set on login) OR legacy header
    const cookieToken = request.cookies.get(SESSION_COOKIE)?.value;
    const headerToken = request.headers.get('x-session-token');
    const token = cookieToken || headerToken;

    const isAuthenticated = !!token && token.length >= 10;

    // ── API routes ────────────────────────────────────────────────────────────
    if (pathname.startsWith('/api/')) {
        // Allow logout even without a valid token (idempotent operation)
        if (pathname.startsWith('/api/auth/logout')) {
            return NextResponse.next();
        }

        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Unauthorized – please log in' },
                { status: 401 }
            );
        }
        return NextResponse.next();
    }

    // ── Page routes ───────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Run on every route EXCEPT Next.js internals, static files, and public assets
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
    ],
};
