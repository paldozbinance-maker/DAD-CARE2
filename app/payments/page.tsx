'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    CreditCard,
    DollarSign,
    Calendar,
    Search,
    Loader2,
    ArrowUpRight,
    Wallet,
    TrendingUp,
    Banknote
} from 'lucide-react';

interface Payment {
    id: string;
    customer_id: string;
    amount: number;
    note: string | null;
    created_at: string;
    reference_date: string;
    previous_debt: number;
    new_debt: number;
    customer: { id: string; name: string; customer_code: string } | null;
}

interface PaymentData {
    payments: Payment[];
    todayTotal: number;
    totalAllTime: number;
    count: number;
}

export default function PaymentsPage() {
    const [data, setData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCustomerId, setFilterCustomerId] = useState('all');
    const [customers, setCustomers] = useState<{ id: string; name: string; customer_code: string }[]>([]);

    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/payments');
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (e) {
            console.error('Failed to fetch payments:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const json = await res.json();
            if (Array.isArray(json)) setCustomers(json);
        } catch (e) {
            console.error('Failed to fetch customers:', e);
        }
    };

    useEffect(() => {
        fetchPayments();
        fetchCustomers();
    }, []);

    let filteredPayments = data?.payments || [];
    
    if (filterCustomerId !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.customer_id === filterCustomerId);
    }

    if (searchTerm) {
        filteredPayments = filteredPayments.filter(p =>
            p.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.customer?.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return (
        <div className="space-y-5 md:space-y-6 max-w-3xl mx-auto w-full px-1 md:px-0">
            {/* Header / Cover */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-2">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Lacagaha</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-md ml-1">
                        Track and manage all customer payments securely.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5 md:gap-4">
                <Card className="glass-card group">
                    <CardContent className="p-3.5 md:p-5">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="p-1.5 md:p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/15 transition-colors">
                                <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500" />
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                            Today
                        </p>
                        <p className="text-base md:text-xl font-black text-foreground tabular-nums">
                            ${(data?.todayTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card group">
                    <CardContent className="p-3.5 md:p-5">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
                                <Banknote className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                            All Time
                        </p>
                        <p className="text-base md:text-xl font-black text-foreground tabular-nums">
                            ${(data?.totalAllTime || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card group">
                    <CardContent className="p-3.5 md:p-5">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="p-1.5 md:p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/15 transition-colors">
                                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-[9px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                            Txns
                        </p>
                        <p className="text-base md:text-xl font-black text-foreground tabular-nums">
                            {data?.count || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                    <div className="flex flex-col gap-3">
                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                            <div className="p-1 rounded-md bg-primary/10">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            Payment History
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                            <select
                                value={filterCustomerId}
                                onChange={(e) => setFilterCustomerId(e.target.value)}
                                className="h-9 px-3 rounded-xl border border-border/50 bg-background/80 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none flex-1 sm:max-w-[200px]"
                            >
                                <option value="all">All Customers</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search payments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-xs w-full bg-background/80 border-border/50 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-3">
                                <DollarSign className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchTerm ? 'No payments match your search' : 'No payments recorded yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {filteredPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/15 transition-colors">
                                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-foreground">
                                                {payment.customer?.name || 'Unknown'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                {format(new Date(payment.created_at), 'MMM dd, yyyy · h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-black text-emerald-500 tabular-nums">
                                            +${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-medium tabular-nums">
                                            Bal: ${payment.new_debt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
