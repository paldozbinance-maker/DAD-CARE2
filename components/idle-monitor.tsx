'use client';

import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function IdleMonitor() {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            if (isIdle) {
                setIsIdle(false);
                // When waking up, we reload the page to ensure fresh data
                // rather than triggering a massive wave of SWR reconnects
                window.location.reload();
            }
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);
        };

        // Listen for user activity
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        window.addEventListener('scroll', resetTimer);

        // Start initial timer
        timeoutId = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('mousedown', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [isIdle]);

    if (!isIdle) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-card border border-border/50 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Moon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Session Paused</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    To conserve database and network bandwidth, your session has been automatically paused due to inactivity. 
                </p>
                <p className="text-xs font-bold text-primary animate-pulse uppercase tracking-widest">
                    Move your mouse or tap to wake up
                </p>
            </div>
        </div>
    );
}
