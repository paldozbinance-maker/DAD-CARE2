'use client';

import { useEffect } from 'react';

export default function DailyBookError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[DailyBook Error Page]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 max-w-md mx-auto text-center">
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
                Buuga Maalinlaha Error
            </h2>
            <p className="text-sm text-muted-foreground">
                {error.message || 'Something went wrong loading this page.'}
            </p>
            <button
                onClick={() => reset()}
                className="mt-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}
