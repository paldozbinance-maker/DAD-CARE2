/**
 * Server-side in-memory session store
 * Tokens are stored in memory — they reset on server restart (safe: forces re-login)
 * This is a simple but effective guard against direct API access
 */

// Token → user data map stored in global memory
const globalStore = global as any;
if (!globalStore.__dadwork_sessions) {
    globalStore.__dadwork_sessions = new Map<string, { userId: string; username: string; role: string; createdAt: number }>();
}

const sessions: Map<string, { userId: string; username: string; role: string; createdAt: number }> = globalStore.__dadwork_sessions;

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function createSession(token: string, userId: string, username: string, role: string): void {
    sessions.set(token, { userId, username, role, createdAt: Date.now() });
}

export function validateSession(token: string): { userId: string; username: string; role: string } | null {
    const session = sessions.get(token);
    if (!session) return null;
    // Check expiry
    if (Date.now() - session.createdAt > SESSION_TTL_MS) {
        sessions.delete(token);
        return null;
    }
    return session;
}

export function deleteSession(token: string): void {
    sessions.delete(token);
}

export function getSessionCount(): number {
    return sessions.size;
}
