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
    Moon,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/daily-book', label: 'Buuga Maalinlaha', icon: BookOpen },
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
        localStorage.removeItem('currentUser');
        localStorage.removeItem('dadwork_session_token');
        await supabase.auth.signOut();
        router.push('/login');
    };


    return (
        <div className="flex h-full w-[260px] flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 z-20 transition-colors duration-300">
            {/* Header - Premium Logo */}
            <div className="flex h-16 items-center px-5 border-b border-sidebar-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                        <span className="text-primary-foreground font-black text-base">D</span>
                    </div>
                    <div>
                        <h1 className="text-base font-black tracking-tight text-sidebar-foreground">
                            DADWORK
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                            Business Ledger
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group flex items-center rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            )}
                        >
                            <div className={cn(
                                'mr-3 p-1.5 rounded-lg transition-colors',
                                isActive ? 'bg-primary/15' : 'bg-transparent group-hover:bg-muted'
                            )}>
                                <item.icon className={cn(
                                    "h-4 w-4 flex-shrink-0 transition-all",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                            </div>
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                                <ChevronRight className="h-3.5 w-3.5 text-primary/60" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border/50 p-3 space-y-1">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-xl text-[13px] h-10"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <div className="mr-3 p-1.5 rounded-lg bg-muted">
                        {mounted && theme === 'dark' ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-indigo-400" />
                        )}
                    </div>
                    {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Toggle Theme'}
                </Button>

                {/* Logout */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl text-[13px] h-10 transition-colors"
                    onClick={handleLogout}
                >
                    <div className="mr-3 p-1.5 rounded-lg">
                        <LogOut className="h-4 w-4" />
                    </div>
                    Logout
                </Button>
            </div>
        </div>
    );
}
