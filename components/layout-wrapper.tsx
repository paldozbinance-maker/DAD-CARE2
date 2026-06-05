'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { MobileNav } from './mobile-nav';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const loggedIn = !!storedUser;
        setIsAuthenticated(loggedIn);

        if (!loggedIn && pathname !== '/login') {
            router.replace('/login');
        } else if (loggedIn && pathname === '/login') {
            router.replace('/dashboard');
        }
    }, [pathname, router]);

    const isLoginPage = pathname === '/login';

    // Show a premium themed security verification screen during state changes/checks
    if (isAuthenticated === null || (!isAuthenticated && !isLoginPage) || (isAuthenticated && isLoginPage)) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative p-4 rounded-full bg-primary/10">
                            <span className="text-2xl font-black text-primary italic">D</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest animate-pulse">
                        Securing session...
                    </p>
                </div>
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-full bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block">
                <AppSidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 pb-safe">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav />
        </div>
    );
}
