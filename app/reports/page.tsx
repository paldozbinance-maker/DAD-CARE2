'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Download,
    Loader2,
    ChevronRight,
    Award,
    AlertTriangle,
    Scale,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface CustomerStats {
    id: string;
    name: string;
    code: string;
    totalPaid: number;
    totalProductAmount: number;
    totalKg: number;
    averageKg: number;
    productTxnCount: number;
    currentDebt: number;
    performanceScore: number;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<CustomerStats[]>([]);
    const [totalDebt, setTotalDebt] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalKg, setTotalKg] = useState(0);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
                if (!res.ok) throw new Error('Failed to fetch reports');
                
                const data: CustomerStats[] = await res.json();
                
                let gDebt = 0;
                let gPaid = 0;
                let gKg = 0;

                data.forEach(c => {
                    gDebt += c.currentDebt;
                    gPaid += c.totalPaid;
                    gKg += c.totalKg;
                });

                setCustomers(data);
                setTotalDebt(gDebt);
                setTotalPaid(gPaid);
                setTotalKg(gKg);
            } catch (e) {
                console.error('Reports fetch failed:', e);
                toast.error('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Derived lists
    const debtors = [...customers].filter(c => c.currentDebt > 0);
    const topDebtors = [...debtors].sort((a, b) => b.currentDebt - a.currentDebt);
    const lowestDebt = [...debtors].sort((a, b) => a.currentDebt - b.currentDebt);
    
    const payers = [...customers].filter(c => c.totalPaid > 0);
    const topPayers = [...payers].sort((a, b) => b.totalPaid - a.totalPaid);
    const lowestPayers = [...payers].sort((a, b) => a.totalPaid - b.totalPaid);

    const kgTakers = [...customers].filter(c => c.productTxnCount > 0);
    const highestAvgKg = [...kgTakers].sort((a, b) => b.averageKg - a.averageKg);
    const lowestAvgKg = [...kgTakers].sort((a, b) => a.averageKg - b.averageKg);

    const performanceRanked = [...customers].sort((a, b) => b.performanceScore - a.performanceScore);

    const handleExport = () => {
        try {
            // Summary sheet data
            const summaryData = [
                ['DADCARE LEDGER - REPORT'],
                ['Generated:', new Date().toLocaleDateString()],
                [],
                ['Total Customers', customers.length],
                ['Total Debt', totalDebt],
                ['Total Paid', totalPaid],
                ['Total KG', totalKg],
            ];

            // Customers sheet data
            const customerRows = customers.map(c => ({
                'Name': c.name,
                'Code': c.code,
                'Current Debt ($)': Number(c.currentDebt.toFixed(2)),
                'Total KG': Number(c.totalKg.toFixed(2)),
                'Avg Daily KG': Number(c.averageKg.toFixed(2)),
                'Total Paid ($)': Number(c.totalPaid.toFixed(2)),
                'Performance (%)': Number(c.performanceScore.toFixed(1)),
            }));

            // Top Debtors sheet
            const debtorRows = [...customers]
                .filter(c => c.currentDebt > 0)
                .sort((a, b) => b.currentDebt - a.currentDebt)
                .map((c, i) => ({
                    'Rank': i + 1,
                    'Name': c.name,
                    'Code': c.code,
                    'Debt ($)': Number(c.currentDebt.toFixed(2)),
                }));

            const wb = XLSX.utils.book_new();

            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

            const wsCustomers = XLSX.utils.json_to_sheet(customerRows);
            XLSX.utils.book_append_sheet(wb, wsCustomers, 'All Customers');

            const wsDebtors = XLSX.utils.json_to_sheet(debtorRows);
            XLSX.utils.book_append_sheet(wb, wsDebtors, 'Top Debtors');

            XLSX.writeFile(wb, `dadcare-report-${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Excel report downloaded!');
        } catch (e) {
            console.error('Export failed:', e);
            toast.error('Export failed');
        }
    };

    const getPerformanceColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (score >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    };
    
    const getPerformanceLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 50) return 'Average';
        return 'Poor';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Generating advanced reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto w-full px-1 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        Advanced Reports
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Deep insights into customer behavior & performance
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="border-border hover:bg-muted shadow-sm transition-all hover:scale-105"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <Card className="glass-card transform transition-all hover:scale-[1.02]">
                    <CardContent className="p-5 flex flex-col justify-center items-center text-center">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Total Global Debt
                        </p>
                        <p className="text-3xl font-black text-red-500 tracking-tight">
                            ${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card transform transition-all hover:scale-[1.02]">
                    <CardContent className="p-5 flex flex-col justify-center items-center text-center">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Total Global Paid
                        </p>
                        <p className="text-3xl font-black text-emerald-500 tracking-tight">
                            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Tabs */}
            <Tabs defaultValue="performance" className="w-full">
                {/* Horizontal Scrollable Tabs List for Mobile */}
                <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-muted/50 border border-border p-1.5 rounded-2xl inline-flex min-w-full md:min-w-0">
                        <TabsTrigger
                            value="performance"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-xs font-semibold px-4 py-2 transition-all whitespace-nowrap"
                        >
                            <Award className="w-3.5 h-3.5 mr-1.5" />
                            Performance Matrix
                        </TabsTrigger>
                        <TabsTrigger
                            value="payers"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-xs font-semibold px-4 py-2 transition-all whitespace-nowrap"
                        >
                            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                            Top & Lowest Payers
                        </TabsTrigger>
                        <TabsTrigger
                            value="volume"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-xs font-semibold px-4 py-2 transition-all whitespace-nowrap"
                        >
                            <Scale className="w-3.5 h-3.5 mr-1.5" />
                            Daily Volume (KG)
                        </TabsTrigger>
                        <TabsTrigger
                            value="debtors"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-xs font-semibold px-4 py-2 transition-all whitespace-nowrap"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                            Debtors
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* 1. PERFORMANCE MATRIX */}
                <TabsContent value="performance" className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="glass-card overflow-hidden border-0 shadow-lg ring-1 ring-border/50">
                        <CardHeader className="pb-4 border-b border-border bg-gradient-to-r from-background to-muted/20">
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Customer Reliability & Performance
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on <strong>what they paid</strong> vs <strong>total products charged</strong> (excludes old initial debt setups).
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            {performanceRanked.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">No data available</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {performanceRanked.map((customer, i) => (
                                        <Link
                                            key={customer.id}
                                            href={`/customers/${customer.id}`}
                                            className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shadow-sm group-hover:scale-110 transition-transform">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{customer.name}</p>
                                                    <p className="text-[11px] text-muted-foreground flex gap-3 mt-1">
                                                        <span className="text-blue-400">Products: ${(customer.totalProductAmount || 0).toLocaleString()}</span>
                                                        <span className="text-emerald-500">Paid: ${customer.totalPaid.toLocaleString()}</span>
                                                        {customer.currentDebt > 0 && <span className="text-red-400">Debt: ${customer.currentDebt.toLocaleString()}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 ${getPerformanceColor(customer.performanceScore)}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                                    {customer.performanceScore.toFixed(0)}%
                                                    <span className="opacity-60 font-normal">{getPerformanceLabel(customer.performanceScore)}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. TOP & LOWEST PAYERS */}
                <TabsContent value="payers" className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border bg-gradient-to-r from-emerald-500/5 to-transparent">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    Highest Total Paid
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {topPayers.map((c, i) => (
                                        <div key={c.id} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-muted-foreground/50 w-4">{i + 1}.</span>
                                                <span className="text-sm font-semibold">{c.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-500">${c.totalPaid.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border bg-gradient-to-r from-red-500/5 to-transparent">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-red-400" />
                                    Lowest Total Paid
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {lowestPayers.map((c, i) => (
                                        <div key={c.id} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-muted-foreground/50 w-4">{i + 1}.</span>
                                                <span className="text-sm font-semibold">{c.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">${c.totalPaid.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* 3. DAILY VOLUME (KG) */}
                <TabsContent value="volume" className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-primary" />
                                    Repeatedly Highest KG (Average)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {highestAvgKg.map((c, i) => (
                                        <div key={c.id} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-primary/50 w-4">{i + 1}.</span>
                                                <span className="text-sm font-semibold">{c.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-primary">{c.averageKg.toFixed(1)} KG</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-muted-foreground" />
                                    Repeatedly Lowest KG (Average)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {lowestAvgKg.map((c, i) => (
                                        <div key={c.id} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-muted-foreground/50 w-4">{i + 1}.</span>
                                                <span className="text-sm font-semibold">{c.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{c.averageKg.toFixed(1)} KG</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* 4. DEBTORS (Original) */}
                <TabsContent value="debtors" className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border bg-gradient-to-r from-red-500/10 to-transparent">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-red-500" />
                                    Highest Debt (Lacagta Guud)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {topDebtors.map((c, i) => (
                                        <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-red-500/50 w-4">{i + 1}.</span>
                                                <span className="text-sm font-semibold group-hover:text-red-500 transition-colors">{c.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-red-500">${c.currentDebt.toLocaleString()}</span>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                                    Lowest Debt (Lacagta Guud)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {lowestDebt.map((c, i) => (
                                        <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-emerald-500/50 w-4">{i + 1}.</span>
                                                <span className="text-sm font-semibold group-hover:text-emerald-500 transition-colors">{c.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">${c.currentDebt.toLocaleString()}</span>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
