import { NextResponse } from 'next/server';

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// In-memory store — resets on cold start, good enough for anti-double-click / anti-spam per instance
const limits = new Map<string, RateLimitRecord>();

/**
 * Check if a given identifier is within the allowed rate.
 * @param identifier  e.g. IP address or session username
 * @param limit       max requests allowed per window
 * @param windowMs    window duration in milliseconds
 */
export function rateLimit(
    identifier: string,
    limit: number = 5,
    windowMs: number = 10_000
): { success: boolean } {
    const now = Date.now();
    const record = limits.get(identifier);

    if (!record || record.resetTime < now) {
        limits.set(identifier, { count: 1, resetTime: now + windowMs });
        return { success: true };
    }

    if (record.count >= limit) {
        return { success: false };
    }

    record.count += 1;
    limits.set(identifier, record);
    return { success: true };
}

/**
 * Returns a 429 NextResponse if over-limit, null if OK.
 * Usage:  const limited = rateLimitResponse(req); if (limited) return limited;
 */
export function rateLimitResponse(
    request: Request,
    limit: number = 10,
    windowMs: number = 10_000
): NextResponse | null {
    const ip =
        (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        (request.headers.get('x-session-token') ?? 'anon');

    const { success } = rateLimit(ip, limit, windowMs);
    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests. Please slow down and try again.' },
            { status: 429 }
        );
    }
    return null;
}
