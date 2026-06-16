'use client';

import { useEffect } from 'react';

/**
 * Globally intercepts all fetch calls to automatically append the x-session-token header
 * if it exists in localStorage. This ensures all API calls carry authentication state
 * for Audit Logs and security.
 */
export function FetchInterceptor() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const originalFetch = window.fetch;

        window.fetch = async function () {
            let [resource, config] = arguments;

            // Initialize config if missing
            if (!config) {
                config = {};
            }

            // Initialize headers if missing
            if (!config.headers) {
                config.headers = {};
            }

            // Only append token for our own API requests
            const urlString = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : resource.url;
            
            if (urlString.startsWith('/api/') || urlString.startsWith(window.location.origin + '/api/')) {
                const token = localStorage.getItem('dadwork_session_token');
                if (token) {
                    // Using Headers object or plain object
                    if (config.headers instanceof Headers) {
                        if (!config.headers.has('x-session-token')) {
                            config.headers.append('x-session-token', token);
                        }
                    } else {
                        if (!config.headers['x-session-token']) {
                            config.headers['x-session-token'] = token;
                        }
                    }
                }
            }

            return originalFetch(resource, config);
        };

        return () => {
            // Restore original fetch if component unmounts
            window.fetch = originalFetch;
        };
    }, []);

    return null;
}
