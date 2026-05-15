'use client';

import {
    LayoutDashboard,
    BookOpen,
    Library,
    CreditCard,
    Menu,
    Users,
    BarChart3,
    Settings,
    LogOut,
    X,
    Sun,
    Moon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const mainTabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/daily-book', label: 'Daily', icon: BookOpen },
    { href: '/ledger', label: 'Buuga Maqalka', icon: Library },
    { href: '/payments', label: 'Lacagaha', icon: CreditCard },
];

const moreItems = [
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [showMore, setShowMore] = useState(false);
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const isMoreActive = moreItems.some(
        item => pathname === item.href || pathname?.startsWith(`${item.href}/`)
    );

    return (
        <>
            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-1">
                    {mainTabs.map((tab) => {
                        const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-xl transition-all duration-200 active:scale-95',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <tab.icon className={cn(
                                    'h-5 w-5 transition-all',
                                    isActive && 'scale-110'
                                )} />
                                <span className={cn(
                                    'text-[10px] font-semibold',
                                    isActive && 'font-bold'
                                )}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-1 w-6 h-0.5 bg-primary rounded-full" />
                                )}
                            </Link>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setShowMore(true)}
                        className={cn(
                            'flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-xl transition-all duration-200 active:scale-95',
                            isMoreActive
                                ? 'text-primary'
                                : 'text-muted-foreground'
                        )}
                    >
                        <Menu className={cn(
                            'h-5 w-5',
                            isMoreActive && 'scale-110'
                        )} />
                        <span className={cn(
                            'text-[10px] font-semibold',
                            isMoreActive && 'font-bold'
                        )}>
                            More
                        </span>
                    </button>
                </div>
            </nav>

            {/* More Menu Overlay */}
            {showMore && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowMore(false)}
                    />

                    {/* Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border p-6 pb-8 animate-in slide-in-from-bottom duration-300">
                        {/* Handle */}
                        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />

                        {/* Close */}
                        <button
                            onClick={() => setShowMore(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Menu Items */}
                        <div className="space-y-1">
                            {moreItems.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowMore(false)}
                                        className={cn(
                                            'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all',
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-foreground hover:bg-muted'
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-semibold">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border my-4" />

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted w-full transition-all"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                            <span className="font-semibold">
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 w-full transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-semibold">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
