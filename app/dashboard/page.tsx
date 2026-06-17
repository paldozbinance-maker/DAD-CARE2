'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    TrendingUp,
    DollarSign,
    Package,
    Loader2,
    ChevronRight,
    ArrowDownWideNarrow,
    ArrowUpNarrowWide,
    ChevronDown,
    ChevronUp,
    Activity,
    Zap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlobalSearch } from '@/components/global-search';

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
    const [dates, setDates] = useState({ standard: '', hijri: '' });

    useEffect(() => {
        // Calculate dates safely on client to prevent hydration mismatch
        const todayDate = new Date();
        const standardDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(todayDate);
        const hijriDateFull = new Intl.DateTimeFormat('en-GB-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(todayDate);
        setDates({ 
            standard: standardDate, 
            hijri: hijriDateFull.replace(/ AH$/, '').replace(/,/, '') 
        });

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
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative p-4 rounded-full bg-primary/10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Sorting logic
    const sortedDebtors = [...(data?.topDebtors || [])].sort((a, b) => {
        return sortOrder === 'largest' ? b.debt - a.debt : a.debt - b.debt;
    });

    const displayedDebtors = isExpanded ? sortedDebtors : sortedDebtors.slice(0, 5);

    return (
        <div className="space-y-5 md:space-y-6 max-w-3xl mx-auto w-full px-1 md:px-0">
            <GlobalSearch />
            
            {/* Header / Cover */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-2">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Dashboard</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-md ml-1">
                        Business overview at a glance. Track customers, payments, debts, and daily operational volume.
                    </p>
                </div>
            </div>

            {/* Stats Grid - Premium Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Total Customers */}
                <Card className="glass-card overflow-hidden group">
                    <CardContent className="p-4 md:p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                            Customers
                        </p>
                        <p className="text-2xl md:text-3xl font-black text-foreground tabular-nums">
                            {data?.totalCustomers || 0}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Debt */}
                <Card className="glass-card overflow-hidden group">
                    <CardContent className="p-4 md:p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="p-2 rounded-xl bg-red-500/10 group-hover:bg-red-500/15 transition-colors">
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                            </div>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                            Total Debt
                        </p>
                        <p className="text-lg md:text-2xl font-black text-red-500 tabular-nums">
                            ${(data?.totalDebt || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Summary - Gradient Card */}
            <Card className="glass-card overflow-hidden border-primary/20">
                <CardContent className="p-0">
                    <div className="p-4 md:p-5 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10">
                                    <Zap className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        Today&apos;s KG
                                    </p>
                                    <p className="text-2xl md:text-3xl font-black text-primary tabular-nums mt-0.5">
                                        {Math.round(data?.todayKg || 0)} <span className="text-sm font-bold text-primary/60">KG</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active</p>
                                <p className="text-lg font-black text-foreground">{data?.todayCustomerCount || 0}</p>
                                <p className="text-[10px] text-muted-foreground">customers</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Debtors */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/50 bg-gradient-to-r from-red-500/[0.03] to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-red-500/10">
                                    <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                                </div>
                                Top Debtors
                            </CardTitle>
                            {/* Sort Toggle */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'largest' ? 'smallest' : 'largest')}
                                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg border-border/50 hover:border-primary/30 transition-all"
                            >
                                {sortOrder === 'largest' ? (
                                    <>
                                        <ArrowDownWideNarrow className="h-3 w-3 text-red-500" />
                                        <span className="hidden sm:inline">Largest</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpNarrowWide className="h-3 w-3 text-emerald-500" />
                                        <span className="hidden sm:inline">Smallest</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        <Link href="/reports" className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1">
                            View All <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {displayedDebtors.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {displayedDebtors.map((debtor, i) => (
                                <Link
                                    href={`/customers/${debtor.id}`}
                                    key={debtor.id}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-all group active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[11px] font-black text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                                            {sortOrder === 'largest' ? i + 1 : sortedDebtors.length - i}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-foreground">{debtor.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">#{debtor.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[13px] font-black tabular-nums ${debtor.debt > 1000 ? 'text-red-500' : 'text-foreground'}`}>
                                            ${Math.round(debtor.debt).toLocaleString()}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            ))}
                            {/* Expand/Collapse */}
                            {sortedDebtors.length > 5 && (
                                <Button
                                    variant="ghost"
                                    className="w-full h-10 text-xs font-bold text-primary hover:bg-primary/5 flex items-center justify-center gap-2 rounded-none"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp className="h-4 w-4" />
                                            Collapse
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4" />
                                            Show {sortedDebtors.length - 5} more
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="p-3 rounded-full bg-emerald-500/10 w-fit mx-auto mb-3">
                                <DollarSign className="h-6 w-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No outstanding debts</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
