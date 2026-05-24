'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from './app-sidebar';
import { MobileNav } from './mobile-nav';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

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
