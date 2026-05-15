'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Library,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/daily-book', label: 'Daily Book', icon: BookOpen },
    { href: '/ledger', label: 'Buuga Maqalka', icon: Library },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/payments', label: 'Lacagaha', icon: CreditCard },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const supabase = createClient();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border z-20 transition-colors duration-300">
            {/* Header */}
            <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-primary-foreground font-bold text-sm">D</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-sidebar-foreground">
                            DADWORK
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-medium">Business Ledger</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn(
                                "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-3 space-y-1">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl text-sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    {mounted && theme === 'dark' ? (
                        <Sun className="mr-3 h-4 w-4" />
                    ) : (
                        <Moon className="mr-3 h-4 w-4" />
                    )}
                    {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Toggle Theme'}
                </Button>

                {/* Logout */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl text-sm transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
