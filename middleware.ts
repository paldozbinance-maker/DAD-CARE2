import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'dadwork_session';

// Routes that do NOT require authentication
const PUBLIC_PAGE_ROUTES = ['/login'];
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/verify', '/api/temp-cleanup', '/api/recover-check', '/api/restore-june24', '/api/verify-june24', '/api/run-migration'];

export async function middleware(request: NextRequest) {
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

    // Quick reject — no token at all
    if (!token) {
        if (pathname.startsWith('/api/')) {
            if (pathname.startsWith('/api/auth/logout')) return NextResponse.next();
            return NextResponse.json({ error: 'Unauthorized – please log in' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ── API routes ────────────────────────────────────────────────────────────
    // API routes are protected by requireSession() inside each handler (DB check).
    // The middleware just ensures a token is present so we don't hit the DB twice.
    if (pathname.startsWith('/api/')) {
        // Allow logout even without a valid token (idempotent operation)
        if (pathname.startsWith('/api/auth/logout')) {
            return NextResponse.next();
        }
        // Token present → let the route handler's requireSession() do the real DB check
        return NextResponse.next();
    }

    // ── Page routes — verify token is genuinely valid in DB ───────────────────
    // We call our own /api/auth/verify endpoint (which uses the pg pool on the
    // Node.js runtime) because middleware runs on the Edge and cannot use `pg` directly.
    try {
        const verifyUrl = new URL('/api/auth/verify', request.url);
        const verifyRes = await fetch(verifyUrl.toString(), {
            headers: {
                // Forward the original cookie so the verify route can read it
                cookie: request.headers.get('cookie') || '',
            },
        });

        if (!verifyRes.ok) {
            // Token exists but is expired/fake/not in DB → kick to login
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    } catch {
        // If the verify call itself fails (cold start, DB hiccup), fail open
        // so we don't lock users out during a transient error.
        // You can change this to fail closed (redirect to /login) if you prefer.
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    // Run on every route EXCEPT Next.js internals, static files, and public assets
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
    ],
};
