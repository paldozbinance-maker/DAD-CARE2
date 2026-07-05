import useSWR from 'swr';
import { useMemo } from 'react';
import { Customer, SavedEntry, DailyBookItem } from '@/types';

// Generic fetcher for SWR — returns null on error instead of throwing
// so the page doesn't crash with "Application error"
export const fetcher = async (url: string) => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('dadwork_session_token') || '' : '';
        const headers: HeadersInit = {};
        if (token) headers['x-session-token'] = token;

        const res = await fetch(url, { headers });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error(`[SWR] Fetch error for ${url}:`, errorData.error || res.status);
            // Optionally throw an error if you want SWR to retry or trigger onError, 
            // but for graceful degradation we return null
            throw new Error(errorData.error || 'Unauthorized – session expired or invalid');
        }
        return res.json();
    } catch (err) {
        console.error(`[SWR] Network error for ${url}:`, err);
        throw err;
    }
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
            dedupingInterval: 300000, // 5 min — init data is heavy, don't re-fetch unless user explicitly refreshes
            revalidateIfStale: false, // don't auto-revalidate stale data in background
            onError: (err) => {
                console.error('[useDailyBookInit] SWR error:', err);
            },
        }
    );

    return {
        data,
        isLoading,
        isError: error,
        mutate
    };
}

// Hook for fetching a specific date's entries
export function useDailyBookDate(dateStr: string | null) {
    const { data, error, mutate, isLoading } = useSWR(
        dateStr ? `/api/daily-book?date=${dateStr}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
            dedupingInterval: 600000, // 10 min — per-date data doesn't change often
            revalidateIfStale: false,
            onError: (err) => {
                console.error('[useDailyBookDate] SWR error:', err);
            },
        }
    );

    return {
        data,
        isLoading,
        isError: error,
        mutate
    };
}

// Hook for fetching ledger status for a date
export function useLedgerStatusForDate(dateStr: string | null) {
    const { data, error, mutate, isLoading } = useSWR<string[] | null>(
        dateStr ? `/api/ledger-by-date?date=${dateStr}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 600000, // 10 min
            revalidateIfStale: false,
            onError: (err) => {
                console.error('[useLedgerStatusForDate] SWR error:', err);
            },
        }
    );

    const processedCustomerIds = useMemo(() => {
        return Array.isArray(data) ? new Set(data) : new Set<string>();
    }, [data]);

    return {
        processedCustomerIds,
        isLoading,
        isError: error,
        mutate
    };
}

// Hook for fetching the full daily book history list
export function useDailyBookHistory() {
    const { data, error, mutate, isLoading } = useSWR<SavedEntry[] | null>(
        '/api/daily-book-history',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 600000, // 10 min
            revalidateIfStale: false,
            onError: (err) => {
                console.error('[useDailyBookHistory] SWR error:', err);
            },
        }
    );

    return {
        data,
        isLoading,
        isError: error,
        mutate
    };
}
