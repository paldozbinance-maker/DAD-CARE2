'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { MobileNav } from './mobile-nav';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {}
        }
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
                {/* Mobile Header Profile */}
                {currentUser && (
                    <div className="md:hidden flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-primary/20 shadow-sm shrink-0 overflow-hidden bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                                {currentUser?.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary-foreground font-black text-xs">
                                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-sm font-black tracking-tight text-foreground uppercase leading-tight">
                                    {currentUser?.name || 'DADWORK'}
                                </h1>
                                <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Admin'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav />
        </div>
    );
}
