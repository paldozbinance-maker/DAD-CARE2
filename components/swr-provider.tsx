'use client';

import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false, // Prevents refetching when you switch tabs
                revalidateIfStale: false, // Prevents automatic refetching if data is technically 'stale' but already loaded
                revalidateOnReconnect: false, // Prevents refetching when network reconnects (often triggers on mobile)
                dedupingInterval: 5000, // dedupe requests within 5 seconds
            }}
        >
            {children}
        </SWRConfig>
    );
}
