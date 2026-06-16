/**
 * Shared auth helper for Next.js API Route Handlers.
 *
 * Usage in any route.ts:
 *   import { requireSession } from '@/lib/require-session';
 *
 *   export async function GET(request: Request) {
 *       const { session, errorResponse } = await requireSession(request);
 *       if (errorResponse) return errorResponse;
 *       // session.userId, session.username, session.role are available
 *   }
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/sessions-store';

type SessionResult =
    | { session: { userId: string; username: string; role: string }; errorResponse: null }
    | { session: null; errorResponse: NextResponse };

/**
 * Reads the session token from the request (httpOnly cookie first, then x-session-token header)
 * and validates it against the database.
 *
 * Returns either a valid session object or a ready-to-return 401 NextResponse.
 */
export async function requireSession(request: Request): Promise<SessionResult> {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieToken = cookieHeader.match(/dadwork_session=([^;]+)/)?.[1];
    const token = cookieToken || request.headers.get('x-session-token');

    if (!token) {
        return {
            session: null,
            errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    const session = await validateSession(token);
    if (!session) {
        return {
            session: null,
            errorResponse: NextResponse.json({ error: 'Unauthorized – session expired or invalid' }, { status: 401 }),
        };
    }

    return { session, errorResponse: null };
}

/**
 * Like requireSession, but additionally checks that the user has the SUPER_ADMIN role.
 */
export async function requireSuperAdmin(request: Request): Promise<SessionResult> {
    const result = await requireSession(request);
    if (result.errorResponse) return result;

    if (result.session.role !== 'SUPER_ADMIN') {
        return {
            session: null,
            errorResponse: NextResponse.json({ error: 'Forbidden – admin access required' }, { status: 403 }),
        };
    }

    return result;
}
