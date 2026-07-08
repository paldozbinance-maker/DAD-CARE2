import useSWR from 'swr';
import { useMemo } from 'react';
import { Customer, SavedEntry, DailyBookItem } from '@/types';

// Generic fetcher — silently returns null on 401/403 (session expired),
// throws on other errors so SWR can retry them once.
export const fetcher = async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dadwork_session_token') || '' : '';
    const headers: HeadersInit = {};
    if (token) headers['x-session-token'] = token;

    let res: Response;
    try {
        res = await fetch(url, { headers });
    } catch (networkErr: any) {
        // Network / timeout — log quietly, don't spam
        console.warn(`[SWR] Network error for ${url}:`, networkErr?.message || networkErr);
        throw networkErr;
    }

    if (!res.ok) {
        // 401 / 403 — session gone, return null gracefully (no throw = no SWR retry loop)
        if (res.status === 401 || res.status === 403) {
            console.warn(`[SWR] Session expired for ${url} — will retry on next user action`);
            return null;
        }
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error || `HTTP ${res.status}`;
        console.warn(`[SWR] Fetch error for ${url}:`, msg);
        throw new Error(msg);
    }

    return res.json();
};

export interface DailyBookInitData {
    customers: Customer[];
    history: SavedEntry[];
    latestDate: string | null;
}

// Hook for the initial Daily Book load (Customers + History)
export function useDailyBookInit() {
    const { data, error, mutate, isLoading } = useSWR<DailyBookInitData | null>(
        '/api/daily-book-init',
        fetcher,
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
            dedupingInterval: 300000,
            revalidateIfStale: false,
            shouldRetryOnError: false,
        }
    );

    return { data, isLoading, isError: error, mutate };
}

// Hook for fetching a specific date's entries
export function useDailyBookDate(dateStr: string | null) {
    const { data, error, mutate, isLoading } = useSWR(
        dateStr ? `/api/daily-book?date=${dateStr}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
            dedupingInterval: 60000,
            revalidateIfStale: false,
            shouldRetryOnError: false,
        }
    );

    return { data, isLoading, isError: error, mutate };
}

// Hook for fetching ledger status for a date
export function useLedgerStatusForDate(dateStr: string | null) {
    const { data, error, mutate, isLoading } = useSWR<string[] | null>(
        dateStr ? `/api/ledger-by-date?date=${dateStr}` : null,
        fetcher,
        {
            revalidateOnFocus: false,   // FIX: was 'true' — was hitting DB on every tab switch
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            dedupingInterval: 30000,    // FIX: was 5000 — 30s dedup window
            shouldRetryOnError: false,
        }
    );

    const processedCustomerIds = useMemo(() => {
        return Array.isArray(data) ? new Set(data) : new Set<string>();
    }, [data]);

    return { processedCustomerIds, isLoading, isError: error, mutate };
}

// Hook for fetching the full daily book history list
export function useDailyBookHistory() {
    const { data, error, mutate, isLoading } = useSWR<SavedEntry[] | null>(
        '/api/daily-book-history',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
            revalidateIfStale: false,
            shouldRetryOnError: false,
        }
    );

    return { data, isLoading, isError: error, mutate };
}
