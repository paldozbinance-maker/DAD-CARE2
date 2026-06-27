/**
 * Signed token utilities for zero-DB middleware verification.
 *
 * Uses the Web Crypto API (works in both Edge middleware AND Node.js).
 *
 * Format: <payload_base64url>.<sig_base64url>
 * Payload: { u: username, r: role, exp: expiresAt (ms) }
 *
 * Middleware verifies the HMAC locally (no DB / network calls) → eliminates
 * the 15-20 second cold-start chain on Netlify.
 */

export interface TokenPayload {
    u: string;   // username
    r: string;   // role
    exp: number; // expiry timestamp in ms
}

const SECRET_STR =
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'dadwork-fallback-secret-change-me-in-netlify';

// Cache the CryptoKey so we don't re-import on every call
let _key: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
    if (_key) return _key;
    const enc = new TextEncoder();
    _key = await crypto.subtle.importKey(
        'raw',
        enc.encode(SECRET_STR),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
    return _key;
}

function b64url(buf: ArrayBuffer): string {
    return Buffer.from(buf).toString('base64url');
}

function b64urlDecode(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str, 'base64url'));
}

/**
 * Create a signed claim string that encodes username, role, and expiry.
 * Called at login — result is stored in the `dadwork_claim` cookie.
 */
export async function signClaim(username: string, role: string, ttlMs: number): Promise<string> {
    const payload: TokenPayload = {
        u: username,
        r: role,
        exp: Date.now() + ttlMs,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const key = await getKey();
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded));
    return `${encoded}.${b64url(sig)}`;
}

/**
 * Verify a signed claim string — ZERO network/DB calls.
 * Safe to call from Edge middleware.
 */
export async function verifyClaim(claim: string): Promise<TokenPayload | null> {
    try {
        const dot = claim.lastIndexOf('.');
        if (dot === -1) return null;
        const encoded = claim.slice(0, dot);
        const sigStr = claim.slice(dot + 1);
        const key = await getKey();
        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            b64urlDecode(sigStr),
            new TextEncoder().encode(encoded)
        );
        if (!valid) return null;
        const payload: TokenPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
        if (!payload.exp || Date.now() > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}
