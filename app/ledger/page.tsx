'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DollarSign, Plus, Loader2, Trash2, Package, ArrowRight, Receipt, Lock, User, Scale, CalendarIcon, TrendingUp, TrendingDown, Info, BookOpen, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateEntry {
    id: string;
    date: string;
    kg: string;
    pricePerKg: string;
    extraKg?: string;
    extraPricePerKg?: string;
    extraNote?: string;
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
    previous_debt?: number;
    new_debt: number;
    created_at?: string;
    receipt_id?: string;
    note?: string;
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
    note?: string | null;
}

const parseVip = (note: string) => {
    const fullMatch = note.match(/(\d+(?:\.\d+)?)\s*vip\s*(?:\*|x|@)?\s*(\d+(?:\.\d+)?)/i);
    if (fullMatch) {
        return {
            kg: parseFloat(fullMatch[1]),
            price: parseFloat(fullMatch[2])
        };
    }
    const simpleMatch = note.match(/(\d+(?:\.\d+)?)\s*vip/i);
    if (simpleMatch) {
        return {
            kg: parseFloat(simpleMatch[1]),
            price: null
        };
    }
    return null;
};

const parseHeshiish = (note: string) => {
    const fullMatch = note.match(/(\d+(?:\.\d+)?)\s*(?:heshiish|heshish)\s*(?:\*|x|@)?\s*(\d+(?:\.\d+)?)/i);
    if (fullMatch) {
        return {
            kg: parseFloat(fullMatch[1]),
            price: parseFloat(fullMatch[2])
        };
    }
    const simpleMatch = note.match(/(\d+(?:\.\d+)?)\s*(?:heshiish|heshish)/i);
    if (simpleMatch) {
        return {
            kg: parseFloat(simpleMatch[1]),
            price: null
        };
    }
    return null;
};

const buildEntryFromDailyRecord = (
    id: string,
    record: DailyBookRecord,
    defaultPrice: string
): { entry: DateEntry; shouldExpandExtra: boolean } => {
    let kg = record.kg ? record.kg.toString() : '0';
    let pricePerKg = defaultPrice;
    let extraKg = '';
    let extraPricePerKg = defaultPrice;
    let extraNote = 'Notebook';
    let shouldExpandExtra = false;

    if (record.note) {
        const noteText = record.note.trim();
        const vipData = parseVip(noteText);
        const heshiishData = parseHeshiish(noteText);

        if (vipData) {
            extraKg = vipData.kg.toString();
            if (vipData.price !== null) {
                extraPricePerKg = vipData.price.toString();
            }
            extraNote = 'VIP';
            shouldExpandExtra = true;
            // Subtract VIP KG from main KG and cap at 0
            const mainKgNum = Math.max(0, (record.kg || 0) - vipData.kg);
            kg = mainKgNum.toString();
        } else if (heshiishData) {
            extraKg = heshiishData.kg.toString();
            if (heshiishData.price !== null) {
                extraPricePerKg = heshiishData.price.toString();
            }
            extraNote = 'Heshiish';
            shouldExpandExtra = true;
            // Subtract Heshiish KG from main KG and cap at 0
            const mainKgNum = Math.max(0, (record.kg || 0) - heshiishData.kg);
            kg = mainKgNum.toString();
        }
    }

    return {
        entry: {
            id,
            date: record.date || '',
            kg,
            pricePerKg,
            extraKg,
            extraPricePerKg,
            extraNote
        },
        shouldExpandExtra
    };
};


export default function LedgerPage() {
    const [loading, setLoading] = useState(false);
    const [fetchingCustomers, setFetchingCustomers] = useState(true);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [defaultPrice, setDefaultPrice] = useState('35');
    const [isRestored, setIsRestored] = useState(false);
    const LOCAL_STORAGE_KEY = 'dadwork_ledger_draft';
    const SESSION_KEY = 'dadwork_ledger_session_active';

    // Data state
    const [allCustomers, setAllCustomers] = useState<{ id: string, name: string, customer_code: string, unprocessed_books_count?: number, total_books_count?: number }[]>([]);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<CustomerSummary>({ totalKg: 0, totalPaid: 0, currentBalance: 0 });
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showLastMaqal, setShowLastMaqal] = useState(false);
    const [updateLastMaqal, setUpdateLastMaqal] = useState(false);

    // Form state
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerDailyDates, setCustomerDailyDates] = useState<DailyBookRecord[]>([]);
    const [dateEntries, setDateEntries] = useState<DateEntry[]>([]);
    const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([{ id: Date.now().toString(), date: '', amount: '' }]);
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentNote, setAdjustmentNote] = useState('');
    const [expandedExtraEntryIds, setExpandedExtraEntryIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data && data.dadwork_price_per_kg) {
                    setDefaultPrice(data.dadwork_price_per_kg);
                } else {
                    const savedPrice = localStorage.getItem('dadwork_price_per_kg');
                    if (savedPrice) setDefaultPrice(savedPrice);
                }
            } catch (e) {
                const savedPrice = localStorage.getItem('dadwork_price_per_kg');
                if (savedPrice) setDefaultPrice(savedPrice);
            }
        };
        loadSettings();

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

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
                    if (parsed.dateEntries && parsed.dateEntries.length > 0) {
                        setDateEntries(parsed.dateEntries);
                        const expandedIds = new Set<string>();
                        parsed.dateEntries.forEach((entry: DateEntry) => {
                            if (entry.extraKg && parseFloat(entry.extraKg) > 0) {
                                expandedIds.add(entry.id);
                            }
                        });
                        setExpandedExtraEntryIds(expandedIds);
                    }
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
                    setDateEntries(prev => {
                        const newExpandedIds = new Set<string>();
                        let newEntries;

                        // If no dates, or just 1 empty row, initialize sequentially
                        if (prev.length === 0 || (prev.length === 1 && !prev[0].date)) {
                            if (dailyData && dailyData.length > 0) {
                                const entryId = Date.now().toString();
                                const { entry, shouldExpandExtra } = buildEntryFromDailyRecord(entryId, dailyData[0], defaultPrice);
                                if (shouldExpandExtra) {
                                    newExpandedIds.add(entryId);
                                }
                                newEntries = [entry];
                            } else {
                                newEntries = [{ id: Date.now().toString(), date: '', kg: '0', pricePerKg: defaultPrice, extraKg: '', extraPricePerKg: defaultPrice, extraNote: 'Notebook' }];
                            }
                        } else {
                            // Re-sequence existing rows to strictly match unprocessed dates
                            newEntries = prev.map((entry, idx) => {
                                const d = dailyData[idx];
                                if (!d) return { ...entry, date: '' };
                                const { entry: parsedEntry, shouldExpandExtra } = buildEntryFromDailyRecord(entry.id, d, defaultPrice);
                                if (shouldExpandExtra) {
                                    newExpandedIds.add(entry.id);
                                }
                                return parsedEntry;
                            }).filter(e => e.date !== '');
                        }

                        if (newExpandedIds.size > 0) {
                            setTimeout(() => {
                                setExpandedExtraEntryIds(prevExpanded => {
                                    const combined = new Set(prevExpanded);
                                    newExpandedIds.forEach(id => combined.add(id));
                                    return combined;
                                });
                            }, 0);
                        }

                        return newEntries;
                    });
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
        setDateEntries([{ id: Date.now().toString(), date: '', kg: '', pricePerKg: defaultPrice, extraKg: '', extraPricePerKg: defaultPrice, extraNote: 'Notebook' }]);
        setPaymentEntries([{ id: Date.now().toString(), date: '', amount: '' }]);
        setHistory([]);
        setCustomerDailyDates([]);
        setShowLastMaqal(false);
        setUpdateLastMaqal(false);
        setExpandedExtraEntryIds(new Set());
    };

    const sortedCustomers = useMemo(() => {
        if (!currentUser?.assigned_customer_ids?.length) return allCustomers;

        const priorityIds = currentUser.assigned_customer_ids;
        const priorityCustomers: typeof allCustomers = [];
        const otherCustomers: typeof allCustomers = [];

        const customerMap = new Map(allCustomers.map(c => [c.id, c]));

        for (const id of priorityIds) {
            if (customerMap.has(id)) {
                priorityCustomers.push(customerMap.get(id)!);
                customerMap.delete(id);
            }
        }

        for (const c of allCustomers) {
            if (customerMap.has(c.id)) {
                otherCustomers.push(c);
            }
        }

        priorityCustomers.sort((a, b) => {
            const numA = parseInt(a.customer_code.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.customer_code.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        });

        otherCustomers.sort((a, b) => {
            const numA = parseInt(a.customer_code.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.customer_code.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        });

        return [...priorityCustomers, ...otherCustomers];
    }, [allCustomers, currentUser]);

    const lastReceiptGroup = useMemo(() => {
        if (!history || history.length === 0) return null;

        const sortedHistory = [...history].sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
        });

        const latestTxn = sortedHistory[0];
        if (!latestTxn) return null;

        const latestReceiptId = latestTxn.receipt_id;

        let lastGroupTxns: Transaction[] = [];
        if (latestReceiptId) {
            lastGroupTxns = sortedHistory.filter(t => t.receipt_id === latestReceiptId);
        } else {
            lastGroupTxns = [latestTxn];
            for (let i = 1; i < sortedHistory.length; i++) {
                const txn = sortedHistory[i];
                if (txn.receipt_id) break;
                const diff = Math.abs(new Date(txn.created_at || '').getTime() - new Date(latestTxn.created_at || '').getTime());
                if (diff < 15000) {
                    lastGroupTxns.push(txn);
                } else {
                    break;
                }
            }
        }

        if (lastGroupTxns.length === 0) return null;

        const sortedGroup = [...lastGroupTxns].reverse();

        const totalKilos = lastGroupTxns.reduce((sum, t) => sum + (t.kg || 0), 0);
        const totalMaqalka = lastGroupTxns.filter(t => t.type === 'PRODUCT').reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalPaid = lastGroupTxns.filter(t => t.type === 'PAYMENT').reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalAdjustment = lastGroupTxns.filter(t => t.type === 'ADJUSTMENT').reduce((sum, t) => sum + (t.amount || 0), 0);

        const firstTxn = sortedGroup[0];
        const lastTxnInGroup = sortedGroup[sortedGroup.length - 1];
        const openingBalance = firstTxn.previous_debt || 0;
        const closingBalance = lastTxnInGroup.new_debt;

        const productDates = sortedGroup.filter(t => t.type === 'PRODUCT').map(t => new Date(t.reference_date));
        let titleString = format(new Date(lastTxnInGroup.created_at || new Date()), 'EEEE, MMMM dd, yyyy');

        if (productDates.length > 0) {
            productDates.sort((a, b) => a.getTime() - b.getTime());
            const uniqueDates = Array.from(new Set(productDates.map(d => format(d, 'dd MMM'))));
            if (uniqueDates.length === 1) titleString = `Maqalka Taariikhda ${uniqueDates[0]}`;
            else if (uniqueDates.length === 2) titleString = `Maqalka Taariikhda ${uniqueDates[0]} iyo ${uniqueDates[1]}`;
            else titleString = `Maqalka Taariikhda ${uniqueDates[0]} ila ${uniqueDates[uniqueDates.length - 1]}`;
        }

        return {
            id: latestReceiptId || `orphan-latest`,
            titleString,
            entries: sortedGroup,
            totalKilos,
            totalMaqalka,
            totalPaid,
            totalAdjustment,
            openingBalance,
            closingBalance,
            receiptId: latestReceiptId
        };
    }, [history]);

    const addDateEntry = () => {
        const nextIndex = dateEntries.length;
        // Maximum 6 date rows at a time
        if (nextIndex >= 6) {
            toast.error("Maximum 6 date rows allowed at once!");
            return;
        }
        if (nextIndex >= customerDailyDates.length) {
            toast.error("No more unprocessed dates available!");
            return;
        }
        const nextUnprocessed = customerDailyDates[nextIndex];
        const newEntryId = Date.now().toString();
        const { entry, shouldExpandExtra } = buildEntryFromDailyRecord(newEntryId, nextUnprocessed, defaultPrice);
        if (shouldExpandExtra) {
            setExpandedExtraEntryIds(prev => {
                const next = new Set(prev);
                next.add(newEntryId);
                return next;
            });
        }
        setDateEntries([...dateEntries, entry]);
    };

    const updateDateEntry = (id: string, field: keyof DateEntry, value: string) => {
        setDateEntries(entries => entries.map(entry => {
            if (entry.id !== id) return entry;
            return { ...entry, [field]: value };
        }));
    };

    const updatePaymentEntry = (id: string, field: keyof PaymentEntry, value: string) => {
        setPaymentEntries(entries => entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    };

    const removeDateEntry = (id: string) => {
        setDateEntries(entries => {
            const filtered = entries.filter(entry => entry.id !== id);
            const nextExpandedIds = new Set<string>();
            const mapped = filtered.map((entry, idx) => {
                const d = customerDailyDates[idx];
                if (!d) return { ...entry, date: '' };
                const { entry: parsedEntry, shouldExpandExtra } = buildEntryFromDailyRecord(entry.id, d, defaultPrice);
                if (shouldExpandExtra) {
                    nextExpandedIds.add(entry.id);
                }
                return parsedEntry;
            });
            setExpandedExtraEntryIds(nextExpandedIds);
            return mapped;
        });
    };

    const productGrandTotal = dateEntries.reduce((sum, p) => {
        const kg = parseFloat(p.kg) || 0;
        const price = parseFloat(p.pricePerKg) || 0;
        const extraKg = parseFloat(p.extraKg || '') || 0;
        const extraPrice = parseFloat(p.extraPricePerKg || '') || 0;
        
        let itemSum = 0;
        if (kg > 0 && price > 0) itemSum += (kg * price);
        if (extraKg > 0 && extraPrice > 0) itemSum += (extraKg * extraPrice);
        return sum + itemSum;
    }, 0);

    const activePaymentAmount = paymentEntries.reduce((sum, pay) => {
        const amount = parseFloat(pay.amount);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const currentReesto = summary.currentBalance === 0 ? (parseFloat(adjustmentAmount) || 0) : summary.currentBalance;
    const subtotal = productGrandTotal + currentReesto;
    const finalLacagtaGuud = subtotal - activePaymentAmount;

    const activeDatesForHeader = dateEntries
        .filter(e => e.date && (parseFloat(e.kg) > 0 || parseFloat(e.extraKg || '0') > 0))
        .map(e => format(new Date(e.date), 'dd MMM'));

    const dynamicMaqalLabel = 'Maqalka';

    const handleSubmit = async (e: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!selectedCustomerId) {
            toast.error('Please select a customer');
            return;
        }

        const validEntries = dateEntries.filter(e => 
            e.date && (
                (parseFloat(e.kg) >= 0 && parseFloat(e.pricePerKg) > 0) || 
                (parseFloat(e.extraKg || '0') > 0 && parseFloat(e.extraPricePerKg || '0') > 0)
            )
        );
        const validPayments = paymentEntries.filter(p => p.date && parseFloat(p.amount) > 0);

        if (validEntries.length === 0 && validPayments.length === 0 && !(summary.currentBalance === 0 && parseFloat(adjustmentAmount) > 0)) {
            toast.error('No valid data to save');
            return;
        }

        setLoading(true);
        const receiptId = (updateLastMaqal && lastReceiptGroup?.receiptId)
            ? lastReceiptGroup.receiptId
            : crypto.randomUUID();

        // 1. Gather all items for the batch
        const items = [];

        // Initial setup if first time
        if (summary.currentBalance === 0 && parseFloat(adjustmentAmount) > 0) {
            items.push({
                type: 'ADJUSTMENT',
                date: format(new Date(), 'yyyy-MM-dd'),
                amount: adjustmentAmount,
                note: "Reesto"
            });
        }

        // Product entries
        for (const entry of validEntries) {
            if (parseFloat(entry.kg) > 0 && parseFloat(entry.pricePerKg) > 0) {
                items.push({
                    type: 'PRODUCT',
                    date: entry.date,
                    kg: entry.kg,
                    price: entry.pricePerKg
                });
            }
            if (entry.extraKg && parseFloat(entry.extraKg) > 0 && entry.extraPricePerKg && parseFloat(entry.extraPricePerKg) > 0) {
                items.push({
                    type: 'PRODUCT',
                    date: entry.date,
                    kg: entry.extraKg,
                    price: entry.extraPricePerKg,
                    note: entry.extraNote || "Notebook"
                });
            }
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
                headers: { 
                    'Content-Type': 'application/json',
                    'x-session-token': localStorage.getItem('dadwork_session_token') || ''
                },
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
            setDateEntries([{ id: Date.now().toString(), date: '', kg: '', pricePerKg: defaultPrice, extraKg: '', extraPricePerKg: defaultPrice, extraNote: 'Notebook' }]);
            setPaymentEntries([{ id: (Date.now() + 1).toString(), date: '', amount: '' }]);
            setAdjustmentAmount('');

            // 4. Refresh data (full sync)
            await handleCustomerChange(selectedCustomerId);
            
            // Re-fetch customers to update warning/correct symbols in real-time
            const custRes = await fetch('/api/customers');
            const custData = await custRes.json();
            if (Array.isArray(custData)) {
                setAllCustomers(custData);
            }

        } catch (err: any) {
            toast.error(err.message || 'Failed to save receipt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Cover */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Buuga Maqalka</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-md ml-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />
                        Manually record kilos and payments into master ledger.
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
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border animate-in fade-in zoom-in duration-300",
                                                summary.currentBalance > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            )}>
                                                Current Balance: ${Math.abs(Math.round(summary.currentBalance)).toLocaleString()}
                                                {summary.currentBalance > 0 ? " (OWED)" : " (CREDIT)"}
                                            </div>
                                            {history.length > 0 && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                                    const nextShow = !showLastMaqal;
                                                    setShowLastMaqal(nextShow);
                                                    if (!nextShow) {
                                                        setUpdateLastMaqal(false);
                                                    }
                                                }} className="h-6 text-[10px] px-2 rounded font-bold border-primary/20 text-primary hover:bg-primary/5">
                                                    <BookOpen className="w-3 h-3 mr-1" /> {showLastMaqal ? 'Hide Last Maqal' : 'Read Last Maqal'}
                                                </Button>
                                            )}
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
                                        {currentUser?.assigned_customer_ids?.length > 0 ? (
                                            <>
                                                <optgroup label="⭐ PRIORITY CUSTOMERS">
                                                    {sortedCustomers.filter(c => currentUser.assigned_customer_ids.includes(c.id)).map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            ⭐ {c.unprocessed_books_count ? '⚠️ ' : (c.total_books_count ? '✅ ' : '')}{c.name.toUpperCase()} (ID: {c.customer_code})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="OTHER CUSTOMERS">
                                                    {sortedCustomers.filter(c => !currentUser.assigned_customer_ids.includes(c.id)).map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.unprocessed_books_count ? '⚠️ ' : (c.total_books_count ? '✅ ' : '')}{c.name.toUpperCase()} (ID: {c.customer_code})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </>
                                        ) : (
                                            sortedCustomers.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.unprocessed_books_count ? '⚠️ ' : (c.total_books_count ? '✅ ' : '')}{c.name.toUpperCase()} (ID: {c.customer_code})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        {fetchingDetails ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>

                                {showLastMaqal && lastReceiptGroup && (
                                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                        {/* Receipt Header Actions */}
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                {updateLastMaqal ? (
                                                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-500/20 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                        Updating Last Maqal
                                                    </span>
                                                ) : (
                                                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                                                        🆕 New Maqal
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-1.5">
                                                {lastReceiptGroup.receiptId && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const nextUpdate = !updateLastMaqal;
                                                            setUpdateLastMaqal(nextUpdate);
                                                            
                                                            if (nextUpdate && lastReceiptGroup) {
                                                                // POPULATE FORM WITH lastReceiptGroup DATA
                                                                const productEntries = lastReceiptGroup.entries.filter(t => t.type === 'PRODUCT');
                                                                const paymentTxns = lastReceiptGroup.entries.filter(t => t.type === 'PAYMENT');
                                                                const adjustmentTxn = lastReceiptGroup.entries.find(t => t.type === 'ADJUSTMENT');

                                                                const dateMap = new Map<string, DateEntry>();
                                                                const newExpandedIds = new Set<string>();

                                                                productEntries.forEach(t => {
                                                                    const dateKey = t.reference_date || '';
                                                                    let existing = dateMap.get(dateKey);
                                                                    if (!existing) {
                                                                        existing = { id: Date.now().toString() + Math.random(), date: dateKey, kg: '', pricePerKg: defaultPrice, extraKg: '', extraPricePerKg: defaultPrice, extraNote: 'Notebook' };
                                                                        dateMap.set(dateKey, existing);
                                                                    }
                                                                    if (t.note) {
                                                                        existing.extraKg = t.kg?.toString() || '';
                                                                        existing.extraPricePerKg = t.price_per_kg?.toString() || '';
                                                                        existing.extraNote = t.note || 'Notebook';
                                                                        newExpandedIds.add(existing.id);
                                                                    } else {
                                                                        existing.kg = t.kg?.toString() || '';
                                                                        existing.pricePerKg = t.price_per_kg?.toString() || defaultPrice;
                                                                    }
                                                                });

                                                                const newDateEntries = Array.from(dateMap.values());
                                                                if (newDateEntries.length > 0) {
                                                                    setDateEntries(newDateEntries);
                                                                } else {
                                                                    setDateEntries([{ id: Date.now().toString(), date: format(new Date(), 'yyyy-MM-dd'), kg: '', pricePerKg: defaultPrice, extraKg: '', extraPricePerKg: defaultPrice, extraNote: 'Notebook' }]);
                                                                }

                                                                setExpandedExtraEntryIds(newExpandedIds);

                                                                if (paymentTxns.length > 0) {
                                                                    setPaymentEntries(paymentTxns.map(t => ({
                                                                        id: Date.now().toString() + Math.random(),
                                                                        date: t.reference_date || format(new Date(), 'yyyy-MM-dd'),
                                                                        amount: t.amount?.toString() || ''
                                                                    })));
                                                                } else {
                                                                    setPaymentEntries([{ id: Date.now().toString(), date: format(new Date(), 'yyyy-MM-dd'), amount: '' }]);
                                                                }

                                                                if (adjustmentTxn) {
                                                                    setAdjustmentAmount(adjustmentTxn.amount?.toString() || '');
                                                                } else {
                                                                    setAdjustmentAmount('');
                                                                }

                                                                // Notify + scroll to the form
                                                                toast.success(`Loaded ${productEntries.length} entries — edit below ⬇️`);
                                                                setTimeout(() => {
                                                                    document.getElementById('maqal-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                }, 100);
                                                            } else {
                                                                // REVERT TO UNPROCESSED STATE
                                                                setDateEntries(prev => {
                                                                    const newExpandedIds = new Set<string>();
                                                                    let newEntries;
                                                                    const dailyData = customerDailyDates;
                                                                    
                                                                    if (dailyData && dailyData.length > 0) {
                                                                        const entryId = Date.now().toString();
                                                                        const { entry, shouldExpandExtra } = buildEntryFromDailyRecord(entryId, dailyData[0], defaultPrice);
                                                                        if (shouldExpandExtra) {
                                                                            newExpandedIds.add(entryId);
                                                                        }
                                                                        newEntries = [entry];
                                                                    } else {
                                                                        newEntries = [{ id: Date.now().toString(), date: '', kg: '0', pricePerKg: defaultPrice, extraKg: '', extraPricePerKg: defaultPrice, extraNote: 'Notebook' }];
                                                                    }
                                                                    
                                                                    if (newExpandedIds.size > 0) {
                                                                        setTimeout(() => setExpandedExtraEntryIds(newExpandedIds), 0);
                                                                    } else {
                                                                        setTimeout(() => setExpandedExtraEntryIds(new Set()), 0);
                                                                    }
                                                                    
                                                                    return newEntries;
                                                                });
                                                                setPaymentEntries([{ id: Date.now().toString(), date: format(new Date(), 'yyyy-MM-dd'), amount: '' }]);
                                                                setAdjustmentAmount('');
                                                            }
                                                        }}
                                                        className={cn(
                                                            "h-7 text-[9px] px-2.5 rounded font-black uppercase tracking-wider",
                                                            updateLastMaqal ? "border-primary text-primary hover:bg-primary/5" : "border-border text-muted-foreground hover:bg-muted"
                                                        )}
                                                    >
                                                        {updateLastMaqal ? "Start New Maqal" : "Edit Last Maqal"}
                                                    </Button>
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={async () => {
                                                        setFetchingDetails(true);
                                                        try {
                                                            const ledgerRes = await fetch(`/api/ledger?customerId=${selectedCustomerId}&limit=200&t=${Date.now()}`);
                                                            const ledgerData = await ledgerRes.json();
                                                            setHistory(ledgerData.transactions || []);
                                                            setSummary(ledgerData.summary || { totalKg: 0, totalPaid: 0, currentBalance: 0 });
                                                            toast.success('Refreshed last maqal!');
                                                        } catch (e) {
                                                            toast.error('Failed to refresh data');
                                                        } finally {
                                                            setFetchingDetails(false);
                                                        }
                                                    }}
                                                    className="h-7 text-[9px] px-2 rounded font-bold border border-border/40 text-muted-foreground hover:bg-muted"
                                                >
                                                    <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Notebook Receipt Style Box */}
                                        <div className="relative overflow-hidden bg-[#fdfbf7] dark:bg-[#1e1c18] font-mono text-[11px] pb-4 rounded-xl border border-border/60 shadow-md">
                                            {/* Vertical Notebook Lines (Margin) */}
                                            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#C19A6B]/60 dark:bg-[#C19A6B]/40 z-0"></div>
                                            <div className="absolute left-9 top-0 bottom-0 w-px bg-[#C19A6B]/60 dark:bg-[#C19A6B]/40 z-0"></div>

                                            <div className="relative z-10 pl-12 pr-4 pt-3 space-y-0 text-slate-800 dark:text-slate-300">
                                                <p className="text-[9px] font-bold text-muted-foreground text-center mb-2 uppercase tracking-wider">
                                                    {lastReceiptGroup.titleString}
                                                </p>

                                                {/* 1. Maqalka entries (products) */}
                                                {lastReceiptGroup.entries.filter(e => e.type === 'PRODUCT').map(e => (
                                                    <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 font-medium">
                                                        <span>
                                                            {e.note ? '↳ ' : ''}
                                                            {format(new Date(e.reference_date), 'MMM dd')} · {Math.round(e.kg || 0)}KG @ ${e.price_per_kg}
                                                            {e.note ? ` (${e.note})` : ''}
                                                        </span>
                                                        <span className="font-bold">${Math.round(e.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}

                                                {/* 2. Maqalka Total */}
                                                {lastReceiptGroup.entries.some(e => e.type === 'PRODUCT') && (
                                                    <div className="flex justify-between py-1.5 border-b border-blue-300 dark:border-blue-800/60 font-bold text-slate-900 dark:text-slate-100">
                                                        <span>Maqalka</span>
                                                        <span>${Math.round(lastReceiptGroup.totalMaqalka).toLocaleString()}</span>
                                                    </div>
                                                )}

                                                {/* 3. Reesto (Previous/Opening Balance) */}
                                                {lastReceiptGroup.openingBalance !== 0 && (
                                                    <div className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-amber-700 dark:text-amber-500 font-bold bg-amber-500/5 px-1 -ml-1 rounded-sm mt-1">
                                                        <span>Reesto</span>
                                                        <span>{lastReceiptGroup.openingBalance > 0 ? '+' : ''}${Math.round(lastReceiptGroup.openingBalance).toLocaleString()}</span>
                                                    </div>
                                                )}

                                                {/* 3b. Adjustment entries (also Reesto) */}
                                                {lastReceiptGroup.entries.filter(e => e.type === 'ADJUSTMENT').map(e => (
                                                    <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-amber-700 dark:text-amber-500 font-bold bg-amber-500/5 px-1 -ml-1 rounded-sm mt-1">
                                                        <span>Reesto</span>
                                                        <span>+${Math.round(e.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}

                                                {/* 4. Lacagta Guud */}
                                                {(lastReceiptGroup.totalMaqalka > 0 || lastReceiptGroup.totalAdjustment > 0) && (
                                                    <div className="flex justify-between py-1.5 border-b-2 border-red-300 dark:border-red-900/50 font-black text-slate-900 dark:text-slate-100">
                                                        <span>Lacagta Guud</span>
                                                        <span>${Math.round(lastReceiptGroup.totalMaqalka + lastReceiptGroup.totalAdjustment + lastReceiptGroup.openingBalance).toLocaleString()}</span>
                                                    </div>
                                                )}

                                                {/* 5. Lacagaha (Payments) */}
                                                {lastReceiptGroup.entries.some(e => e.type === 'PAYMENT') && (
                                                    <>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700/80 dark:text-emerald-500/80 pt-2.5 pb-0.5">Lacagaha</p>
                                                        {lastReceiptGroup.entries.filter(e => e.type === 'PAYMENT').map(e => (
                                                            <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-emerald-700 dark:text-emerald-500 font-bold">
                                                                <span>{format(new Date(e.reference_date), 'MMM dd')} Payment</span>
                                                                <span>-${Math.round(e.amount).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}

                                                {/* 6. Final Balance */}
                                                {lastReceiptGroup.totalPaid > 0 && (
                                                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-double border-amber-400/50 dark:border-amber-600/50 px-1 py-1">
                                                        <span className="font-black text-sm text-[#C19A6B] dark:text-[#D4B087]">
                                                            Reesto
                                                        </span>
                                                        <span className={`text-lg font-black ${lastReceiptGroup.closingBalance > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                                            ${Math.abs(Math.round(lastReceiptGroup.closingBalance)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedCustomerId && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                        <div id="maqal-form-section" className="space-y-4">
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
                                                {dateEntries.map((entry, index) => (
                                                    <div key={entry.id} className="relative p-3 md:p-4 bg-background shadow-sm border border-border/60 rounded-2xl group transition-all hover:shadow-md">
                                                        <div className="flex flex-col gap-2">
                                                            {/* Date Row + Toggle */}
                                                            <div className="flex items-end gap-2">
                                                                <div className="flex-1 space-y-1.5">
                                                                    <Label className="text-[10px] md:text-xs uppercase font-black text-muted-foreground tracking-wider ml-1">Date</Label>
                                                                    <div className="relative">
                                                                        {updateLastMaqal ? (
                                                                            <Input
                                                                                type="date"
                                                                                value={entry.date || ""}
                                                                                onChange={e => updateDateEntry(entry.id, 'date', e.target.value)}
                                                                                className="h-11 md:h-12 pl-10 font-bold text-sm md:text-base rounded-xl border border-border/80 bg-background shadow-none"
                                                                            />
                                                                        ) : (
                                                                            <select
                                                                                value={entry.date || ""}
                                                                                disabled
                                                                                className={cn(
                                                                                    "w-full h-11 md:h-12 pl-10 pr-8 font-bold text-sm md:text-base rounded-xl border border-border/80 bg-muted/30 appearance-none cursor-not-allowed focus:ring-0",
                                                                                    !entry.date && "text-muted-foreground"
                                                                                )}
                                                                            >
                                                                                {entry.date ? (
                                                                                    <option value={entry.date}>
                                                                                        {(() => {
                                                                                            const mainKg = parseFloat(entry.kg) || 0;
                                                                                            const extraKg = parseFloat(entry.extraKg || '0') || 0;
                                                                                            const dateStr = format(parseISO(entry.date), "MMM dd, yyyy");
                                                                                            if (mainKg === 0 && extraKg === 0) {
                                                                                                return `${dateStr} ❌ Absent`;
                                                                                            }
                                                                                            const parts = [];
                                                                                            if (mainKg > 0) parts.push(`📦 ${mainKg} KG`);
                                                                                            if (extraKg > 0) parts.push(`📔 ${extraKg} KG (${entry.extraNote || 'Notebook'})`);
                                                                                            return `${dateStr} - ${parts.join(' + ')}`;
                                                                                        })()}
                                                                                    </option>
                                                                                ) : (
                                                                                    <option value="" disabled>No unprocessed dates</option>
                                                                                )}
                                                                            </select>
                                                                        )}
                                                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-primary pointer-events-none opacity-60" />
                                                                    </div>
                                                                </div>

                                                                {/* Main inputs + Extra Toggle inputs */}
                                                            </div>

                                                            {/* Main KG and Price/KG inputs (Always visible) */}
                                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider ml-1">KG</Label>
                                                                    <div className="relative group/input">
                                                                        <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70 group-focus-within/input:text-primary transition-colors" />
                                                                        <Input
                                                                            type="number"
                                                                            step="1"
                                                                            value={entry.kg}
                                                                            readOnly={!updateLastMaqal}
                                                                            onChange={e => updateDateEntry(entry.id, 'kg', e.target.value)}
                                                                            inputMode="decimal"
                                                                            className={cn(
                                                                                "h-12 pl-10 text-base font-black border-border/80 rounded-xl text-primary focus:bg-background transition-all shadow-none",
                                                                                updateLastMaqal ? "bg-background cursor-text" : "bg-muted/5 cursor-not-allowed opacity-90"
                                                                            )}
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider ml-1">Price / KG</Label>
                                                                    <div className="relative group/input">
                                                                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70 group-focus-within/input:text-primary transition-colors" />
                                                                        <Input
                                                                            type="number"
                                                                            step="1"
                                                                            value={entry.pricePerKg}
                                                                            onChange={e => updateDateEntry(entry.id, 'pricePerKg', e.target.value)}
                                                                            inputMode="decimal"
                                                                            className="h-12 pl-10 text-base font-black bg-muted/10 border-border/80 rounded-xl focus:bg-background transition-all shadow-none"
                                                                            placeholder="35"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Notebook extra entries toggle button & badge */}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setExpandedExtraEntryIds(prev => {
                                                                            const next = new Set(prev);
                                                                            if (next.has(entry.id)) next.delete(entry.id);
                                                                            else next.add(entry.id);
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={cn(
                                                                        "h-8 text-[10px] font-bold rounded-lg border-border/80 bg-muted/5 hover:bg-muted/15 flex items-center gap-1",
                                                                        expandedExtraEntryIds.has(entry.id) && "border-primary/30 text-primary bg-primary/5"
                                                                    )}
                                                                >
                                                                    {expandedExtraEntryIds.has(entry.id) ? (
                                                                        <>
                                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                                            Hide Notebook KG
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                                            Add Notebook KG
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                {entry.extraKg && entry.extraPricePerKg && !expandedExtraEntryIds.has(entry.id) && (
                                                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                                                                        📔 {entry.extraKg}kg @ ${entry.extraPricePerKg} ({entry.extraNote || 'Notebook'})
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Collapsible Notebook entries inputs */}
                                                            {expandedExtraEntryIds.has(entry.id) && (
                                                                <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-muted/5 border border-dashed border-border/60 rounded-xl animate-in slide-in-from-top-1 duration-150 w-full">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider ml-1">Notebook KG</Label>
                                                                        <div className="relative group/input">
                                                                            <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70 group-focus-within/input:text-primary transition-colors" />
                                                                            <Input
                                                                                type="number"
                                                                                step="1"
                                                                                value={entry.extraKg || ''}
                                                                                onChange={e => updateDateEntry(entry.id, 'extraKg', e.target.value)}
                                                                                inputMode="decimal"
                                                                                className="h-12 pl-10 text-base font-black bg-muted/10 border-border/80 rounded-xl text-primary focus:bg-background transition-all shadow-none"
                                                                                placeholder="0"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider ml-1">Notebook Price / KG</Label>
                                                                        <div className="relative group/input">
                                                                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70 group-focus-within/input:text-primary transition-colors" />
                                                                            <Input
                                                                                type="number"
                                                                                step="1"
                                                                                value={entry.extraPricePerKg || ''}
                                                                                onChange={e => updateDateEntry(entry.id, 'extraPricePerKg', e.target.value)}
                                                                                inputMode="decimal"
                                                                                className="h-12 pl-10 text-base font-black bg-muted/10 border-border/80 rounded-xl focus:bg-background transition-all shadow-none"
                                                                                placeholder="36"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1.5 col-span-2">
                                                                        <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider ml-1">Note / Name</Label>
                                                                        <div className="relative group/input">
                                                                            <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70 group-focus-within/input:text-primary transition-colors" />
                                                                            <Input
                                                                                type="text"
                                                                                value={entry.extraNote !== undefined ? entry.extraNote : 'Notebook'}
                                                                                onChange={e => updateDateEntry(entry.id, 'extraNote', e.target.value)}
                                                                                className="h-12 pl-10 text-sm font-bold bg-muted/10 border-border/80 rounded-xl focus:bg-background transition-all shadow-none"
                                                                                placeholder="Notebook"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                    onClick={() => setPaymentEntries([...paymentEntries, { id: Date.now().toString() + Math.random(), date: '', amount: '' }])}
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
                                                    <div key={pay.id} className="relative p-4 md:p-5 bg-emerald-500/5 shadow-sm border border-emerald-500/20 rounded-2xl group transition-all hover:shadow-md">
                                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 items-center">
                                                            <div className="space-y-1.5 md:space-y-2 col-span-2 md:col-span-1">
                                                                <Label className="text-[10px] md:text-xs uppercase font-black text-emerald-700/70 tracking-wider ml-1">Taariikhada Lacagta</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={pay.date}
                                                                    onChange={e => setPaymentEntries(entries => entries.map(entry => entry.id === pay.id ? { ...entry, date: e.target.value } : entry))}
                                                                    className="h-12 md:h-14 text-sm md:text-base font-bold bg-background border-emerald-500/30 rounded-xl focus:border-emerald-500 shadow-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5 md:space-y-2 col-span-2 md:col-span-1">
                                                                <Label className="text-[10px] md:text-xs uppercase font-black text-emerald-700/70 tracking-wider ml-1">Lacagta la dhiibay</Label>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                                                    <Input
                                                                        type="number"
                                                                        value={pay.amount}
                                                                        onChange={e => setPaymentEntries(entries => entries.map(entry => entry.id === pay.id ? { ...entry, amount: e.target.value } : entry))}
                                                                        inputMode="decimal"
                                                                        className="h-12 md:h-14 pl-11 md:pl-12 text-xl md:text-2xl font-black bg-background border-emerald-500/30 rounded-xl text-emerald-600 focus:border-emerald-500 shadow-none"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
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
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center mb-1">Receipt</p>

                                                {activeDatesForHeader.length > 0 && (
                                                    <p className="text-[9px] font-bold text-muted-foreground text-center mb-3">
                                                        Maqalka Taariikhda {activeDatesForHeader.join(' iyo ')}
                                                    </p>
                                                )}

                                                {/* Maqalka breakdown lines */}
                                                {dateEntries.filter(e => e.date && (
                                                    (parseFloat(e.kg) > 0 && parseFloat(e.pricePerKg) > 0) ||
                                                    (e.extraKg && parseFloat(e.extraKg) > 0 && e.extraPricePerKg && parseFloat(e.extraPricePerKg) > 0)
                                                )).map((entry, idx) => {
                                                    const showMain = parseFloat(entry.kg) > 0 && parseFloat(entry.pricePerKg) > 0;
                                                    const showExtra = entry.extraKg && parseFloat(entry.extraKg) > 0 && entry.extraPricePerKg && parseFloat(entry.extraPricePerKg) > 0;
                                                    return (
                                                        <div key={`rec-${idx}`} className="space-y-1 py-1 border-b border-border/30 text-muted-foreground">
                                                            {showMain && (
                                                                <div className="flex justify-between">
                                                                    <span>{format(new Date(entry.date), 'MMM dd')} · {entry.kg}KG × ${entry.pricePerKg}</span>
                                                                    <span className="font-bold text-foreground">${Math.round(parseFloat(entry.kg) * parseFloat(entry.pricePerKg)).toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                            {showExtra && (
                                                                <div className={cn("flex justify-between text-[10px] text-muted-foreground/80", showMain ? "pl-3" : "")}>
                                                                    <span>{showMain ? '↳ ' : ''}{format(new Date(entry.date), 'MMM dd')} · {entry.extraKg}KG × ${entry.extraPricePerKg} ({entry.extraNote || 'Notebook'})</span>
                                                                    <span className="font-bold text-foreground">${Math.round(parseFloat(entry.extraKg || '0') * parseFloat(entry.extraPricePerKg || '0')).toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Maqalka Total */}
                                                <div className="flex justify-between py-1.5 border-b border-border/40 font-bold text-foreground">
                                                    <span>{dynamicMaqalLabel}</span>
                                                    <span>${productGrandTotal.toLocaleString()}</span>
                                                </div>

                                                {/* Reesto (Carry-over Balance) */}
                                                {(currentReesto !== 0 || summary.currentBalance === 0) && (
                                                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                                                        <span className={cn("font-bold", currentReesto < 0 ? "text-emerald-600" : "text-destructive/80")}>{currentReesto > 0 ? 'Reesto' : 'Reesto'}</span>
                                                        {summary.currentBalance === 0 ? (
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
                                                                {currentReesto < 0 ? "-" : "+"}{Math.abs(Math.round(currentReesto)).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Subtotal */}
                                                {(productGrandTotal > 0 || (summary.currentBalance === 0 && parseFloat(adjustmentAmount) > 0)) && (
                                                    <div className="flex justify-between py-1.5 border-b-2 border-border font-black text-foreground">
                                                        <span>Lacagta Guud</span>
                                                        <span>${Math.round(subtotal).toLocaleString()}</span>
                                                    </div>
                                                )}

                                                {/* Lacagaha (payments) */}
                                                {activePaymentAmount > 0 && (
                                                    <>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600/60 pt-1.5">Lacagaha</p>
                                                        {paymentEntries.filter(p => p.date && parseFloat(p.amount) > 0).map((pay, idx) => (
                                                            <div key={`pay-${idx}`} className="flex justify-between py-1 border-b border-border/30 text-emerald-600 font-bold">
                                                                <span>{format(new Date(pay.date), 'MMM dd yyyy')} Lacagta</span>
                                                                <span>-${Math.round(parseFloat(pay.amount)).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}

                                                {/* Final Balance - double underline style (Only if payments were made) */}
                                                {activePaymentAmount > 0 && (
                                                    <div className="flex flex-col">
                                                        <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-double border-amber-400 dark:border-amber-600 px-1 py-1">
                                                            <span className="font-black text-sm text-[#C19A6B] dark:text-[#D4B087]">Reesto</span>
                                                            <span className={`text-lg font-black ${finalLacagtaGuud > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                                                ${Math.abs(Math.round(finalLacagtaGuud)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[8px] text-right font-bold uppercase ${finalLacagtaGuud > 0 ? 'text-destructive/60' : 'text-emerald-500/60'}`}>
                                                            Reesto
                                                        </p>
                                                    </div>
                                                )}
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
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#C19A6B] dark:text-[#D4B087] leading-none mb-1">{activePaymentAmount > 0 ? 'Reesto' : 'Lacagta Guud'}</p>
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
