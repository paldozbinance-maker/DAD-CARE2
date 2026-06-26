import useSWR from 'swr';
import { Customer, SavedEntry, DailyBookItem } from '@/types';

// Generic fetcher for SWR
export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'An error occurred while fetching the data.');
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
    const { data, error, mutate, isLoading } = useSWR<DailyBookInitData>('/api/daily-book-init', fetcher, {
        revalidateOnFocus: false, // Don't constantly reload this massive file on tab focus
        dedupingInterval: 60000, // Deduplicate requests within 1 minute
    });

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
        { revalidateOnFocus: false }
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
    const { data, error, mutate, isLoading } = useSWR<string[]>(
        dateStr ? `/api/ledger-by-date?date=${dateStr}` : null,
        fetcher
    );

    return {
        processedCustomerIds: data ? new Set(data) : new Set<string>(),
        isLoading,
        isError: error,
        mutate
    };
}
