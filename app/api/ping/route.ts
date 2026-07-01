import { NextResponse } from 'next/server';

/**
 * GET /api/ping
 * Lightweight health-check endpoint.
 * - No auth required (public)
 * - No DB queries (pure instant response)
 * - Used by the Netlify keep-alive scheduled function to prevent cold starts
 */
export async function GET() {
    return NextResponse.json(
        { status: 'ok', ts: Date.now() },
        {
            status: 200,
            headers: {
                'Cache-Control': 'no-store',
            },
        }
    );
}
