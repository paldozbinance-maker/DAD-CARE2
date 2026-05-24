'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DollarSign, Plus, Loader2, Trash2, Package, ArrowRight, Receipt, Lock, User, Scale, CalendarIcon, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateEntry {
    id: string;
    date: string;
    kg: string;
    pricePerKg: string;
}

interface PaymentEntry {
    id: string;
    date: string;
    amount: string;
}

interface Transaction {
    id: string;
    type: 'PRODUCT' | 'PAYMENT' | 'ADJUSTMENT';
    reference_date: string;
    kg?: number;
    price_per_kg?: number;
    amount: number;
    new_debt: number;
}

interface CustomerSummary {
    totalKg: number;
    totalPaid: number;
    currentBalance: number;
}

interface DailyBookRecord {
    date: string;
    kg: number;
    processed: boolean;
}

export default function LedgerPage() {
    const [loading, setLoading] = useState(false);
    const [fetchingCustomers, setFetchingCustomers] = useState(true);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [defaultPrice, setDefaultPrice] = useState('35');
    const [isRestored, setIsRestored] = useState(false);
    const LOCAL_STORAGE_KEY = 'dadwork_ledger_draft';
    const SESSION_KEY = 'dadwork_ledger_session_active';

    // Data state
    const [allCustomers, setAllCustomers] = useState<{ id: string, name: string, customer_code: string }[]>([]);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<CustomerSummary>({ totalKg: 0, totalPaid: 0, currentBalance: 0 });

    // Form state
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerDailyDates, setCustomerDailyDates] = useState<DailyBookRecord[]>([]);
    const [dateEntries, setDateEntries] = useState<DateEntry[]>([]);
    const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([{ id: Date.now().toString(), date: format(new Date(), 'yyyy-MM-dd'), amount: '' }]);
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentNote, setAdjustmentNote] = useState('');

    useEffect(() => {
        const savedPrice = localStorage.getItem('dadwork_price_per_kg');
        if (savedPrice) setDefaultPrice(savedPrice);

        // sessionStorage disappears when browser/tab closes but survives navigation.
        // If there's NO session flag, this is a fresh open → clear old draft.
        // If session flag exists, user is just navigating back → restore draft.
        const isExistingSession = sessionStorage.getItem(SESSION_KEY);

        if (!isExistingSession) {
            // Fresh browser open or refresh → clear old data, mark session as active
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            sessionStorage.setItem(SESSION_KEY, 'true');
        } else {
            // Navigating back from another page → restore draft
            const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed.selectedCustomerId) setSelectedCustomerId(parsed.selectedCustomerId);
                    if (parsed.dateEntries && parsed.dateEntries.length > 0) setDateEntries(parsed.dateEntries);
                    if (parsed.paymentEntries && parsed.paymentEntries.length > 0) setPaymentEntries(parsed.paymentEntries);
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
        }
        setIsRestored(true);

        const fetchCustomers = async () => {
            try {
                const res = await fetch('/api/customers');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAllCustomers(data);
                }
            } catch (err) {
                console.error('Failed to fetch customers:', err);
            } finally {
                setFetchingCustomers(false);
            }
        };
        fetchCustomers();
    }, []);

    // Save draft to localStorage on every change (survives navigation)
    useEffect(() => {
        if (!isRestored) return;
        const draft = { selectedCustomerId, dateEntries, paymentEntries };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
    }, [selectedCustomerId, dateEntries, paymentEntries, isRestored]);

    // On browser close or refresh → clear the session flag so next open starts fresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);


    useEffect(() => {
        if (!selectedCustomerId) {
            setHistory([]);
            setSummary({ totalKg: 0, totalPaid: 0, currentBalance: 0 });
            return;
        }

        const fetchCustomerDetails = async () => {
            setFetchingDetails(true);
            try {
                // Fetch ledger history (increased limit for duplicate checking)
                const ledgerRes = await fetch(`/api/ledger?customerId=${selectedCustomerId}&limit=200&t=${Date.now()}`);
                const ledgerData = await ledgerRes.json();
                setHistory(ledgerData.transactions || []);
                setSummary(ledgerData.summary || { totalKg: 0, totalPaid: 0, currentBalance: 0 });

                // Fetch daily book records for this customer
                const dailyRes = await fetch(`/api/customer-daily-entries?customerId=${selectedCustomerId}`);
                if (dailyRes.ok) {
                    const dailyData = await dailyRes.json();
                    setCustomerDailyDates(dailyData || []);
                }
            } catch (err) {
                console.error('Failed to fetch customer details:', err);
                toast.error('Failed to load customer data');
            } finally {
                setFetchingDetails(false);
            }
        };

        fetchCustomerDetails();
    }, [selectedCustomerId, defaultPrice]);

    const handleCustomerChange = (customerId: string) => {
        setSelectedCustomerId(customerId);
        setDateEntries([{ id: Date.now().toString(), date: '', kg: '', pricePerKg: defaultPrice }]);
        setPaymentEntries([{ id: Date.now().toString(), date: format(new Date(), 'yyyy-MM-dd'), amount: '' }]);
        setHistory([]);
        setCustomerDailyDates([]);
    };

    const addDateEntry = () => {
        const newEntry: DateEntry = {
            id: Date.now().toString(),
            date: '',
            kg: '',
            pricePerKg: defaultPrice
        };
        setDateEntries([...dateEntries, newEntry]);
    };

    const updateDateEntry = (id: string, field: keyof DateEntry, value: string) => {
        if (field === 'date') {
            const isDuplicate = dateEntries.some(e => e.id !== id && e.date === value);
            if (isDuplicate && value) {
                toast.error('You cannot choose the same date twice!');
                return;
            }
        }

        setDateEntries(entries => entries.map(entry => {
            if (entry.id !== id) return entry;

            if (field === 'date') {
                const inHistory = history.find(h => h.reference_date === value && h.type === 'PRODUCT');
                if (inHistory) {
                    toast.error(`Date ${format(new Date(value), 'MMM dd')} was already served in the Ledger!`);
                    return { ...entry, date: '' };
                }

                const matchingDaily = customerDailyDates.find(d => d.date === value);
                if (matchingDaily) {
                    if (matchingDaily.processed) {
                        toast.error(`Date ${format(new Date(value), 'MMM dd')} was already served (saved in ledger)!`);
                        return { ...entry, date: '' };
                    }

                    if (matchingDaily.kg > 0) {
                        toast.success(`Found ${matchingDaily.kg} KG in Daily Book for this date!`);
                        return { ...entry, date: value, kg: matchingDaily.kg.toString() };
                    }
                }
            }

            return { ...entry, [field]: value };
        }));
    };

    const updatePaymentEntry = (id: string, field: keyof PaymentEntry, value: string) => {
        setPaymentEntries(entries => entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    };

    const removeDateEntry = (id: string) => {
        setDateEntries(entries => entries.filter(entry => entry.id !== id));
    };

    const productGrandTotal = dateEntries.reduce((sum, p) => {
        const kg = parseFloat(p.kg) || 0;
        const price = parseFloat(p.pricePerKg) || 0;
        return sum + (kg * price);
    }, 0);

    const activePaymentAmount = paymentEntries.reduce((sum, pay) => {
        const amount = parseFloat(pay.amount);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const currentReesto = history.length === 0 ? (parseFloat(adjustmentAmount) || 0) : summary.currentBalance;
    const subtotal = productGrandTotal + currentReesto;
    const finalLacagtaGuud = subtotal - activePaymentAmount;

    const activeDatesForHeader = dateEntries
        .filter(e => e.date && parseFloat(e.kg) > 0)
        .map(e => format(new Date(e.date), 'dd MMM'));

    const dynamicMaqalLabel = activeDatesForHeader.length > 0
        ? `Maqalka Taariikhda ${activeDatesForHeader.join(' iyo ')}`
        : 'Maqalka Total';

    const handleSubmit = async (e: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!selectedCustomerId) {
            toast.error('Please select a customer');
            return;
        }

        const validEntries = dateEntries.filter(e => e.date && parseFloat(e.kg) > 0 && parseFloat(e.pricePerKg) > 0);
        const validPayments = paymentEntries.filter(p => p.date && parseFloat(p.amount) > 0);

        if (validEntries.length === 0 && validPayments.length === 0 && !(history.length === 0 && parseFloat(adjustmentAmount) > 0)) {
            toast.error('No valid data to save');
            return;
        }

        setLoading(true);
        const receiptId = crypto.randomUUID();

        // 1. Gather all items for the batch
        const items = [];

        // Initial setup if first time
        if (history.length === 0 && parseFloat(adjustmentAmount) > 0) {
            items.push({
                type: 'ADJUSTMENT',
                date: format(new Date(), 'yyyy-MM-dd'),
                amount: adjustmentAmount,
                note: "Initial Debt Setup"
            });
        }

        // Product entries
        for (const entry of validEntries) {
            items.push({
                type: 'PRODUCT',
                date: entry.date,
                kg: entry.kg,
                price: entry.pricePerKg
            });
        }

        // Payment entries
        for (const pay of validPayments) {
            items.push({
                type: 'PAYMENT',
                date: pay.date,
                amount: pay.amount
            });
        }

        try {
            // 2. Single ATOMIC Post
            const res = await fetch('/api/ledger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedCustomerId,
                    receipt_id: receiptId,
                    items: items
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save receipt');
            }

            // Update summary locally for zero-lag accuracy
            setSummary(prev => ({ ...prev, currentBalance: data.finalDebt }));
            toast.success('Receipt saved successfully!');

            // 3. Reset form
            setDateEntries([{ id: Date.now().toString(), date: format(new Date(), 'yyyy-MM-dd'), kg: '', pricePerKg: defaultPrice }]);
            setPaymentEntries([{ id: (Date.now() + 1).toString(), date: format(new Date(), 'yyyy-MM-dd'), amount: '' }]);
            setAdjustmentAmount('');

            // 4. Refresh data (full sync)
            await handleCustomerChange(selectedCustomerId);

        } catch (err: any) {
            toast.error(err.message || 'Failed to save receipt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Buuga Maqalka</h2>
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        Manually record kilos and payments into master ledger
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="space-y-6">
                    <Card className="glass-card overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground">Transaction Receipt Form</CardTitle>
                                    <CardDescription className="text-muted-foreground">Select customer and process multiple transactions simultaneously</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-10">

                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                                        Select Customer
                                    </Label>
                                    {selectedCustomerId && !fetchingDetails && (
                                        <div className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border animate-in fade-in zoom-in duration-300",
                                            summary.currentBalance > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        )}>
                                            Current Balance: ${Math.abs(Math.round(summary.currentBalance)).toLocaleString()}
                                            {summary.currentBalance > 0 ? " (OWED)" : " (CREDIT)"}
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className={`w-5 h-5 ${selectedCustomerId ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <select
                                        className="w-full h-14 pl-12 pr-10 rounded-xl border border-border/60 bg-background/50 text-foreground font-bold appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                        value={selectedCustomerId}
                                        onChange={e => handleCustomerChange(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select Customer...</option>
                                        {allCustomers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name.toUpperCase()} (ID: {c.customer_code})</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        {fetchingDetails ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>

                                {selectedCustomerId && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-border pb-2">
                                                <Label className="text-sm font-black uppercase tracking-wider text-foreground">1. Maqalka <span className="text-muted-foreground text-xs font-normal capitalize ml-2">(Add Kilos)</span></Label>
                                                {dateEntries.length < 2 && (
                                                    <Button
                                                        type="button"
                                                        onClick={addDateEntry}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-lg font-bold text-xs"
                                                        disabled={fetchingDetails}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" /> Add Row
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="space-y-4">

                                                {dateEntries.map((entry) => (
                                                    <div key={entry.id} className="relative p-4 bg-muted/20 border border-border rounded-xl">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Date</Label>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-full h-10 justify-start text-left font-bold text-sm",
                                                                                !entry.date && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                                            {entry.date ? format(parseISO(entry.date), "PPP") : <span>Pick a date</span>}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0" align="start">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={entry.date ? parseISO(entry.date) : undefined}
                                                                            onSelect={(val) => val && updateDateEntry(entry.id, 'date', format(val, 'yyyy-MM-dd'))}
                                                                            disabled={(date) => {
                                                                                const dStr = format(date, 'yyyy-MM-dd');
                                                                                const inHist = history.some(h => h.reference_date === dStr && h.type === 'PRODUCT');
                                                                                const isProc = customerDailyDates.find(d => d.date === dStr)?.processed;
                                                                                const isFuture = date > new Date();
                                                                                return !!(inHist || isProc || isFuture);
                                                                            }}
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">KG (Kilos)</Label>
                                                                <div className="relative">
                                                                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        value={entry.kg}
                                                                        onChange={e => updateDateEntry(entry.id, 'kg', e.target.value)}
                                                                        inputMode="decimal"
                                                                        className="h-12 pl-9 text-base font-bold bg-background text-primary"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Price per KG</Label>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        value={entry.pricePerKg}
                                                                        onChange={e => updateDateEntry(entry.id, 'pricePerKg', e.target.value)}
                                                                        inputMode="decimal"
                                                                        className="h-12 pl-9 text-base font-bold bg-background"
                                                                        placeholder="35"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {dateEntries.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDateEntry(entry.id)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. LACAGAHA (Payment) Section */}
                                        <div className="space-y-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center justify-between border-b border-border pb-2">
                                                <Label className="text-sm font-black uppercase tracking-wider text-foreground">2. Lacagaha <span className="text-muted-foreground text-xs font-normal capitalize ml-2">(Payments Received)</span></Label>
                                                <Button
                                                    type="button"
                                                    onClick={() => setPaymentEntries([...paymentEntries, { id: Date.now().toString() + Math.random(), date: format(new Date(), 'yyyy-MM-dd'), amount: '' }])}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-lg font-bold text-xs"
                                                    disabled={fetchingDetails}
                                                >
                                                    <Plus className="w-4 h-4 mr-1" /> Add Row
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {paymentEntries.map((pay) => (
                                                    <div key={pay.id} className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black text-muted-foreground">Payment Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={pay.date}
                                                                onChange={e => setPaymentEntries(entries => entries.map(entry => entry.id === pay.id ? { ...entry, date: e.target.value } : entry))}
                                                                className="h-12 text-sm font-bold bg-background border-border"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black text-muted-foreground">Deposit Amount</Label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                                                <Input
                                                                    type="number"
                                                                    value={pay.amount}
                                                                    onChange={e => setPaymentEntries(entries => entries.map(entry => entry.id === pay.id ? { ...entry, amount: e.target.value } : entry))}
                                                                    inputMode="decimal"
                                                                    className="h-14 pl-12 text-2xl font-black bg-background border-border text-emerald-600 focus:border-emerald-500"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                        {paymentEntries.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPaymentEntries(entries => entries.filter(entry => entry.id !== pay.id))}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 4. BOOK MATH RECEIPT */}
                                        <div className="relative overflow-hidden mt-4 py-3 rounded-lg bg-[#fdfbf7] dark:bg-[#1e1c18] border border-border/60 font-mono text-xs shadow-inner">
                                            {/* Vertical Notebook Lines (Margin) */}
                                            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#C19A6B]/60 dark:bg-[#C19A6B]/40 z-0"></div>
                                            <div className="absolute left-9 top-0 bottom-0 w-px bg-[#C19A6B]/60 dark:bg-[#C19A6B]/40 z-0"></div>
                                            
                                            <div className="relative z-10 pl-12 pr-4 space-y-0 text-slate-800 dark:text-slate-300">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center mb-2">Receipt</p>

                                            {/* Maqalka breakdown lines */}
                                            {dateEntries.filter(e => e.date && parseFloat(e.kg) > 0 && parseFloat(e.pricePerKg) > 0).map((entry, idx) => (
                                                <div key={`rec-${idx}`} className="flex justify-between py-1 border-b border-border/30 text-muted-foreground">
                                                    <span>{format(new Date(entry.date), 'MMM dd')} · {entry.kg}KG × ${entry.pricePerKg}</span>
                                                    <span className="font-bold text-foreground">${Math.round(parseFloat(entry.kg) * parseFloat(entry.pricePerKg)).toLocaleString()}</span>
                                                </div>
                                            ))}

                                            {/* Maqalka Total */}
                                            <div className="flex justify-between py-1.5 border-b border-border/40 font-bold text-foreground">
                                                <span>{dynamicMaqalLabel}</span>
                                                <span>${productGrandTotal.toLocaleString()}</span>
                                            </div>

                                            {/* Reesto (Carry-over Balance) */}
                                            <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                                                <span className={cn("font-bold", currentReesto < 0 ? "text-emerald-600" : "text-destructive/80")}>
                                                    {history.length === 0 ? 'Initial Reesto' : 'Previous Balance'}
                                                </span>
                                                {fetchingDetails ? (
                                                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                                                ) : history.length === 0 ? (
                                                    <Input
                                                        type="number"
                                                        value={adjustmentAmount}
                                                        onChange={e => setAdjustmentAmount(e.target.value)}
                                                        inputMode="decimal"
                                                        placeholder="0"
                                                        className="h-7 w-20 text-right font-black text-xs border-primary/20 bg-background/50 px-1.5"
                                                    />
                                                ) : (
                                                    <span className={cn("font-black", currentReesto < 0 ? "text-emerald-600" : "text-destructive")}>
                                                        {currentReesto < 0 ? "-" : "+"}${Math.abs(Math.round(currentReesto)).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Subtotal */}
                                            <div className="flex justify-between py-1.5 border-b-2 border-border font-black text-foreground">
                                                <span>Subtotal</span>
                                                <span>${Math.round(subtotal).toLocaleString()}</span>
                                            </div>

                                            {/* Lacagaha (payments) */}
                                            {activePaymentAmount > 0 && (
                                                <>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600/60 pt-1.5">Lacagaha</p>
                                                    {paymentEntries.filter(p => p.date && parseFloat(p.amount) > 0).map((pay, idx) => (
                                                        <div key={`pay-${idx}`} className="flex justify-between py-1 border-b border-border/30 text-emerald-600 font-bold">
                                                            <span>{format(new Date(pay.date), 'MMM dd')} Payment</span>
                                                            <span>-${Math.round(parseFloat(pay.amount)).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {/* Final Balance - double underline style */}
                                            <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-double border-amber-400 dark:border-amber-600 px-1 py-1">
                                                <span className="font-black text-sm text-[#C19A6B] dark:text-[#D4B087]">Lacagta Guud</span>
                                                <span className={`text-lg font-black ${finalLacagtaGuud > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                                    ${Math.abs(Math.round(finalLacagtaGuud)).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className={`text-[8px] text-right font-bold uppercase ${finalLacagtaGuud > 0 ? 'text-destructive/60' : 'text-emerald-500/60'}`}>
                                                Lacagta Guud
                                            </p>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-10 rounded-lg font-black text-xs uppercase tracking-wider shadow-md"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Receipt'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* WISER MOBILE: Sticky Bottom Bar */}
            {selectedCustomerId && (
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 md:hidden z-50 animate-in slide-in-from-bottom duration-500 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
                    <div className="flex items-center gap-4 max-w-lg mx-auto">
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#C19A6B] dark:text-[#D4B087] leading-none mb-1">Lacagta Guud</p>
                            <p className={`text-xl font-black leading-none ${finalLacagtaGuud > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                ${Math.round(finalLacagtaGuud).toLocaleString()}
                            </p>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Receipt'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
