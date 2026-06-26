import useSWR from 'swr';
import { useMemo } from 'react';
import { Customer, SavedEntry, DailyBookItem } from '@/types';

// Generic fetcher for SWR — returns null on error instead of throwing
// so the page doesn't crash with "Application error"
export const fetcher = async (url: string) => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            // Log the error but return null so UI degrades gracefully
            console.error(`[SWR] Fetch error for ${url}:`, errorData.error || res.status);
            return null;
        }
        return res.json();
    } catch (err) {
        console.error(`[SWR] Network error for ${url}:`, err);
        return null;
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
            dedupingInterval: 60000, // Deduplicate requests within 60 seconds
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
            dedupingInterval: 10000,
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
