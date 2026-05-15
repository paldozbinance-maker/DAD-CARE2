'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Download,
    Loader2,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CustomerDebt {
    id: string;
    name: string;
    code: string;
    debt: number;
    totalKg: number;
    totalPaid: number;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<CustomerDebt[]>([]);
    const [totalDebt, setTotalDebt] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalKg, setTotalKg] = useState(0);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Fetch all customers
                const custRes = await fetch('/api/customers');
                const custData = await custRes.json();
                if (!Array.isArray(custData)) return;

                // Fetch ledger data for each customer
                const customerDebts: CustomerDebt[] = [];
                let grandTotalDebt = 0;
                let grandTotalPaid = 0;
                let grandTotalKg = 0;

                for (const cust of custData) {
                    try {
                        const ledgerRes = await fetch(`/api/ledger?customerId=${cust.id}&limit=1000&t=${Date.now()}`);
                        const ledgerData = await ledgerRes.json();

                        const summary = ledgerData.summary || { totalKg: 0, totalPaid: 0, currentBalance: 0 };

                        customerDebts.push({
                            id: cust.id,
                            name: cust.name,
                            code: cust.customer_code,
                            debt: summary.currentBalance,
                            totalKg: summary.totalKg,
                            totalPaid: summary.totalPaid
                        });

                        grandTotalDebt += summary.currentBalance;
                        grandTotalPaid += summary.totalPaid;
                        grandTotalKg += summary.totalKg;
                    } catch {
                        // Skip this customer on error
                    }
                }

                setCustomers(customerDebts);
                setTotalDebt(grandTotalDebt);
                setTotalPaid(grandTotalPaid);
                setTotalKg(grandTotalKg);
            } catch (e) {
                console.error('Reports fetch failed:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const topDebtors = [...customers].filter(c => c.debt > 0).sort((a, b) => b.debt - a.debt);
    const lowestDebt = [...customers].filter(c => c.debt > 0).sort((a, b) => a.debt - b.debt);

    const handleExport = () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            summary: { totalDebt, totalPaid, totalKg, totalCustomers: customers.length },
            customers: customers.map(c => ({
                name: c.name,
                code: c.code,
                currentDebt: c.debt,
                totalKg: c.totalKg,
                totalPaid: c.totalPaid
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dadwork-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Generating reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        Reports
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Analyze business performance
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="border-border hover:bg-muted"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                <Card className="glass-card">
                    <CardContent className="p-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Debt</p>
                        <p className="text-lg md:text-2xl font-bold text-red-500">
                            ${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Paid</p>
                        <p className="text-lg md:text-2xl font-bold text-emerald-500">
                            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total KG</p>
                        <p className="text-lg md:text-2xl font-bold text-primary">
                            {totalKg.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="top-debtors" className="w-full">
                <TabsList className="bg-muted border border-border p-1 rounded-xl w-full grid grid-cols-2">
                    <TabsTrigger
                        value="top-debtors"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold"
                    >
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                        Top Debtors
                    </TabsTrigger>
                    <TabsTrigger
                        value="lowest-debt"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold"
                    >
                        <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
                        Lowest Debt
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="top-debtors">
                    <Card className="glass-card overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-red-500" />
                                Highest Lacagta Guud
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {topDebtors.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No outstanding debts
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {topDebtors.map((customer, i) => (
                                        <Link
                                            key={customer.id}
                                            href={`/customers/${customer.id}`}
                                            className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {customer.totalKg.toLocaleString()} KG · Paid ${customer.totalPaid.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-red-500">
                                                    ${customer.debt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lowest-debt">
                    <Card className="glass-card overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-emerald-500" />
                                Lowest Lacagta Guud
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {lowestDebt.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No outstanding debts
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {lowestDebt.map((customer, i) => (
                                        <Link
                                            key={customer.id}
                                            href={`/customers/${customer.id}`}
                                            className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {customer.totalKg.toLocaleString()} KG · Paid ${customer.totalPaid.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-emerald-500">
                                                    ${customer.debt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* All Customers Summary */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        All Customers Summary ({customers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Mobile-friendly table using cards */}
                    <div className="divide-y divide-border">
                        {customers.map((customer) => (
                            <Link
                                key={customer.id}
                                href={`/customers/${customer.id}`}
                                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground truncate">{customer.name}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        #{customer.code} · {customer.totalKg} KG
                                    </p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className={`text-sm font-bold ${customer.debt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        ${Math.abs(customer.debt).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Paid: ${customer.totalPaid.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
