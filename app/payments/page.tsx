'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    CreditCard,
    DollarSign,
    Calendar,
    Search,
    Plus,
    Loader2,
    ArrowUpRight,
    User
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
    const [dialogOpen, setDialogOpen] = useState(false);

    // Payment form state
    const [customers, setCustomers] = useState<{ id: string; name: string; customer_code: string }[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [paymentNote, setPaymentNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filterCustomerId, setFilterCustomerId] = useState('all');

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

    const handleRecordPayment = async () => {
        if (!selectedCustomer || !paymentAmount) {
            toast.error('Select a customer and enter an amount');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedCustomer,
                    amount: paymentAmount,
                    date: paymentDate,
                    note: paymentNote
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Payment failed');
            }

            toast.success('Payment recorded successfully!');
            setDialogOpen(false);
            setSelectedCustomer('');
            setPaymentAmount('');
            setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
            setPaymentNote('');
            setLoading(true);
            fetchPayments();
        } catch (e: any) {
            toast.error(e.message || 'Failed to record payment');
        } finally {
            setSubmitting(false);
        }
    };

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        Lacagaha
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track and manage customer payments
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Record Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-500" />
                                Record Payment
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Customer</Label>
                                <select
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground font-medium appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                >
                                    <option value="">Select customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} (#{c.customer_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">Date</Label>
                                    <Input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="h-12 bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">Amount ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="pl-10 h-12 text-xl font-bold bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Note (optional)</Label>
                                <Input
                                    placeholder="Payment note..."
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className="bg-background border-border"
                                />
                            </div>
                            <Button
                                onClick={handleRecordPayment}
                                disabled={submitting || !selectedCustomer || !paymentAmount}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                {submitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Confirm Payment'
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <Card className="glass-card">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Today&apos;s Collections
                        </p>
                        <p className="text-lg md:text-2xl font-bold text-foreground">
                            ${(data?.todayTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Total Collected
                        </p>
                        <p className="text-lg md:text-2xl font-bold text-foreground">
                            ${(data?.totalAllTime || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card col-span-2 md:col-span-1">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Calendar className="h-4 w-4 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Total Transactions
                        </p>
                        <p className="text-lg md:text-2xl font-bold text-foreground">
                            {data?.count || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-sm font-semibold text-foreground">
                            Lacagaha History
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <select
                                value={filterCustomerId}
                                onChange={(e) => setFilterCustomerId(e.target.value)}
                                className="h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[200px]"
                            >
                                <option value="all">All Customers History</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}'s History</option>
                                ))}
                            </select>
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search payments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-sm w-full bg-background border-border"
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
                            <DollarSign className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchTerm ? 'No payments match your search' : 'No payments recorded yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {payment.customer?.name || 'Unknown'}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {format(new Date(payment.created_at), 'MMM dd, yyyy · h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-500">
                                            +${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Balance: ${payment.new_debt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
