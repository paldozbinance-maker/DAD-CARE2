'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    TrendingUp,
    DollarSign,
    Package,
    ArrowUpRight,
    Sun,
    Moon,
    Loader2,
    ChevronRight,
    ArrowDownWideNarrow,
    ArrowUpNarrowWide,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
    totalCustomers: number;
    totalDebt: number;
    totalPaid: number;
    totalKg: number;
    todayKg: number;
    todayCustomerCount: number;
    topDebtors: { id: string; name: string; code: string; debt: number }[];
    recentTransactions: any[];
}

export default function DashboardPage() {
    const { theme, setTheme } = useTheme();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'largest' | 'smallest'>('largest');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/dashboard');
                const json = await res.json();
                if (res.ok) setData(json);
            } catch (e) {
                console.error('Dashboard fetch failed:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Customers',
            value: data?.totalCustomers || 0,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            format: (v: number) => v.toString()
        },
        {
            label: 'Total Debt Owed',
            value: data?.totalDebt || 0,
            icon: TrendingUp,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        },
    ];

    // Sorting logic
    const sortedDebtors = [...(data?.topDebtors || [])].sort((a, b) => {
        return sortOrder === 'largest' ? b.debt - a.debt : a.debt - b.debt;
    });

    const displayedDebtors = isExpanded ? sortedDebtors : sortedDebtors.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* ... Header stays same ... */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Business overview at a glance
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="hidden md:flex rounded-full w-10 h-10 hover:bg-muted"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="glass-card overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                {stat.label}
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-foreground">
                                {stat.format(stat.value)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Today's Summary */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Today&apos;s Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground font-medium mb-1">KG Distributed</p>
                        <p className="text-2xl font-bold text-primary">
                            {Math.round(data?.todayKg || 0)} <span className="text-sm font-normal">KG</span>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Top Debtors - With Sorting and Expand/Collapse */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-red-500" />
                                Top Debtors
                            </CardTitle>
                            {/* Sorting Toggle */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'largest' ? 'smallest' : 'largest')}
                                className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-primary/20 hover:border-primary/50"
                            >
                                {sortOrder === 'largest' ? (
                                    <>
                                        <ArrowDownWideNarrow className="h-3 w-3 text-red-500" />
                                        Largest Owed
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpNarrowWide className="h-3 w-3 text-emerald-500" />
                                        Smallest Owed
                                    </>
                                )}
                            </Button>
                        </div>
                        <Link href="/reports" className="text-xs text-primary font-semibold hover:underline">
                            View All
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {displayedDebtors.length > 0 ? (
                        <div className="divide-y divide-border">
                            {displayedDebtors.map((debtor, i) => (
                                <Link
                                    href={`/customers/${debtor.id}`}
                                    key={debtor.id}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {sortOrder === 'largest' ? i + 1 : sortedDebtors.length - i}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{debtor.name}</p>
                                            <p className="text-[11px] text-muted-foreground">#{debtor.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-extrabold ${debtor.debt > 1000 ? 'text-red-500' : 'text-foreground'}`}>
                                            ${Math.round(debtor.debt).toLocaleString()}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                            {/* Expand/Collapse Button */}
                            {sortedDebtors.length > 5 && (
                                <Button
                                    variant="ghost"
                                    className="w-full h-10 text-xs font-bold text-primary hover:bg-primary/5 flex items-center justify-center gap-2"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp className="h-4 w-4" />
                                            Collapse List
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4" />
                                            Show More ({sortedDebtors.length - 5} more)
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No outstanding debts
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
