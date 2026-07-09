import useSWR from 'swr';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Not authenticated');
    }
    return res.json();
};

export function useSession() {
    const { data, error, isLoading } = useSWR('/api/auth/verify', fetcher, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        dedupingInterval: 300000 // 5 minutes
    });

    return {
        session: data?.valid ? data : null,
        isLoading,
        isError: error
    };
}
