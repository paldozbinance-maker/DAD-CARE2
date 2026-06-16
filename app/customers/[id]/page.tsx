'use client';

// ─── SINGLE SOURCE OF TRUTH for balance labels ───────────────────────────────
// Change these two strings here and EVERY label in the UI updates automatically.
const LABEL_REESTO       = 'Reesto';       // Shown when a payment exists → remaining balance
const LABEL_LACAGTA_GUUD = 'Lacagta Guud'; // Shown when no payment made → total amount owed
/** Returns the correct balance label based purely on whether a payment was made */
const getBalanceLabel = (totalPaid: number): string =>
    totalPaid > 0 ? LABEL_REESTO : LABEL_LACAGTA_GUUD;
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Trash2,
    DollarSign,
    TrendingUp,
    Package,
    History,
    Loader2,
    Phone,
    Scale,
    Receipt,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    CheckCircle2,
    AlertCircle,
    User,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Pencil,
    Save,
    Share2,
    Printer,
    FileText,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { downloadReceiptPDF, shareReceiptToWhatsApp } from '@/lib/generate-receipt-pdf';
import { MessageCircle, FileDown } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    customer_code: string;
    gender?: string;
    phone?: string;
}

interface Transaction {
    id: string;
    type: 'PRODUCT' | 'PAYMENT' | 'ADJUSTMENT';
    reference_date: string;
    kg?: number;
    price_per_kg?: number;
    amount: number;
    previous_debt: number;
    new_debt: number;
    created_at: string;
    note?: string;
    receipt_id?: string | null;
}

interface Summary {
    totalKg: number;
    totalPaid: number;
    currentBalance: number;
    lastTransactionType?: string | null;
}

interface ReceiptGroup {
    id: string;
    mainDate: string;
    kind: 'TRANSACTION' | 'ADJUSTMENT';
    entries: Transaction[];
    totalKilos: number;
    totalMaqalka: number;
    totalAdjustment: number;
    totalPaid: number;
    openingBalance: number;
    closingBalance: number;
    note?: string;
    titleString?: string;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [receipts, setReceipts] = useState<ReceiptGroup[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalKg: 0, totalPaid: 0, currentBalance: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'maqalka' | 'lacagaha'>('all');
    const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(new Set());

    // Edit State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editGender, setEditGender] = useState('');
    const [updating, setUpdating] = useState(false);

    const toggleReceipt = (id: string) => {
        setExpandedReceipts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const groupTransactionsInfoReceipts = (txns: Transaction[]) => {
        if (!txns || txns.length === 0) return [];

        // 1. Sort EVERYTHING deterministically by time and ID descending (Newest First)
        const sortedTxns = [...txns].sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            if (timeA !== timeB) return timeB - timeA;
            return a.id.localeCompare(b.id); // Tie-breaker for batch entries
        });

        // 2. Separate into receipt-id and orphans
        const withReceiptId = sortedTxns.filter(t => t.receipt_id);
        const withoutReceiptId = sortedTxns.filter(t => !t.receipt_id);

        const receiptGroups: Transaction[][] = [];

        // 3. Group by Receipt ID
        const groupedByReceiptId = withReceiptId.reduce((acc, t) => {
            const rid = t.receipt_id!;
            if (!acc[rid]) acc[rid] = [];
            acc[rid].push(t);
            return acc;
        }, {} as Record<string, Transaction[]>);

        Object.values(groupedByReceiptId).forEach(group => receiptGroups.push(group));

        // 4. For orphans, use 15s batching
        if (withoutReceiptId.length > 0) {
            let currentGroup: Transaction[] = [];
            withoutReceiptId.forEach((txn, i) => {
                if (i === 0) {
                    currentGroup.push(txn);
                } else {
                    const prev = withoutReceiptId[i - 1];
                    const diff = Math.abs(new Date(txn.created_at).getTime() - new Date(prev.created_at).getTime());
                    if (diff < 15000) {
                        currentGroup.push(txn);
                    } else {
                        receiptGroups.push(currentGroup);
                        currentGroup = [txn];
                    }
                }
            });
            if (currentGroup.length > 0) receiptGroups.push(currentGroup);
        }

        // 5. Process groups (they are already sorted internally newest-first)
        const processedReceipts = receiptGroups.map((group, idx) => {
            // Newest-first sort ensures group[0] is the LATEST entry
            const last = group[0];
            const first = group[group.length - 1];

            const totalKilos = group.reduce((sum, t) => sum + (t.kg || 0), 0);
            const totalMaqalka = group.filter(t => t.type === 'PRODUCT').reduce((sum, t) => sum + (t.amount || 0), 0);
            const totalPaid = group.filter(t => t.type === 'PAYMENT').reduce((sum, t) => sum + (t.amount || 0), 0);
            const totalAdjustment = group.filter(t => t.type === 'ADJUSTMENT').reduce((sum, t) => sum + (t.amount || 0), 0);
            const isAdjustmentOnly = group.length === group.filter(t => t.type === 'ADJUSTMENT').length;

            const productDates = group.filter(t => t.type === 'PRODUCT').map(t => new Date(t.reference_date));
            let titleString = format(new Date(last.created_at), 'EEEE, MMMM dd, yyyy');

            if (productDates.length > 0) {
                productDates.sort((a, b) => a.getTime() - b.getTime());
                const uniqueDates = Array.from(new Set(productDates.map(d => format(d, 'dd MMM'))));
                if (uniqueDates.length === 1) titleString = `Maqalka Taariikhda ${uniqueDates[0]}`;
                else if (uniqueDates.length === 2) titleString = `Maqalka Taariikhda ${uniqueDates[0]} iyo ${uniqueDates[1]}`;
                else titleString = `Maqalka Taariikhda ${uniqueDates[0]} ila ${uniqueDates[uniqueDates.length - 1]}`;
            }

            return {
                id: `group-${idx}-${last.id}`,
                mainDate: last.reference_date,
                kind: isAdjustmentOnly ? 'ADJUSTMENT' : 'TRANSACTION',
                titleString: titleString,
                entries: [...group].reverse(), // Store internally as oldest-first for the breakdown rendering
                totalKilos,
                totalMaqalka,
                totalPaid,
                totalAdjustment,
                openingBalance: first.previous_debt,
                closingBalance: last.new_debt,
                note: group.find(t => t.note)?.note
            } as ReceiptGroup;
        }).sort((a, b) => new Date(b.entries[0].created_at).getTime() - new Date(a.entries[0].created_at).getTime());

        // 6. MERGE STEP: fold payment-only receipts into the nearest product receipt.
        // We sort oldest-first so the product receipt always appears BEFORE the payment in iteration order,
        // then merge the payment backward into the last product receipt.
        const oldestFirst = [...processedReceipts].sort((a, b) =>
            new Date(a.entries[0].created_at).getTime() - new Date(b.entries[0].created_at).getTime()
        );

        const merged: ReceiptGroup[] = [];
        for (const current of oldestFirst) {
            const isPaymentOnly = current.totalMaqalka === 0 && current.totalAdjustment === 0 && current.totalPaid > 0;

            if (isPaymentOnly && merged.length > 0) {
                // Find the most recent product/adjustment receipt in merged (look backward)
                let targetIdx = -1;
                for (let k = merged.length - 1; k >= 0; k--) {
                    if (merged[k].totalMaqalka > 0 || merged[k].totalAdjustment > 0) {
                        targetIdx = k;
                        break;
                    }
                }

                if (targetIdx !== -1) {
                    const target = merged[targetIdx];
                    // Combine entries sorted oldest-first
                    const mergedEntries = [...target.entries, ...current.entries].sort(
                        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );
                    const latestEntry = mergedEntries[mergedEntries.length - 1];
                    merged[targetIdx] = {
                        ...target,
                        entries: mergedEntries,
                        totalPaid: target.totalPaid + current.totalPaid,
                        closingBalance: latestEntry.new_debt,
                    };
                    continue; // payment absorbed — don't add it separately
                }
            }
            merged.push(current);
        }

        // Re-sort newest-first for display
        return merged.sort((a, b) =>
            new Date(b.entries[b.entries.length - 1].created_at).getTime() -
            new Date(a.entries[a.entries.length - 1].created_at).getTime()
        );
    };

    const loadCustomerData = async () => {
        try {
            const custRes = await fetch('/api/customers');
            const allCustomers = await custRes.json();
            const foundCustomer = allCustomers.find((c: Customer) => c.id === customerId);
            setCustomer(foundCustomer);

            const ledgerRes = await fetch(`/api/ledger?customerId=${customerId}&limit=200&t=${Date.now()}`);
            const ledgerData = await ledgerRes.json();

            const allTxns = ledgerData.transactions || [];
            setTransactions(allTxns);
            setReceipts(groupTransactionsInfoReceipts(allTxns));
            setSummary(ledgerData.summary || { totalKg: 0, totalPaid: 0, currentBalance: 0 });
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error('Failed to load customer profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customerId) loadCustomerData();
    }, [customerId]);

    const handleOpenEdit = () => {
        if (!customer) return;
        setEditName(customer.name);
        setEditPhone(customer.phone || '');
        setEditCode(customer.customer_code);
        setEditGender(customer.gender || 'Other');
        setIsEditDialogOpen(true);
    };

    const handleUpdateCustomer = async () => {
        if (!customer) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/customers?id=${customerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    phone: editPhone,
                    customer_code: editCode,
                    gender: editGender
                })
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success('Customer updated successfully');
            setIsEditDialogOpen(false);
            loadCustomerData(); // Refresh info
        } catch (err) {
            toast.error('Failed to update customer');
        } finally {
            setUpdating(false);
        }
    };

    const handleClearAllHistory = async () => {
        const userInput = prompt('Are you sure you want to DELETE ALL ledger history for this customer? This cannot be undone. Type "DELETE" to confirm:');
        if (userInput !== 'DELETE') {
            if (userInput !== null) toast.error('Confirmation failed. History not cleared.');
            return;
        }
        setUpdating(true);
        try {
            const res = await fetch(`/api/ledger?customerId=${customerId}`, {
                method: 'DELETE',
                headers: { 'x-session-token': localStorage.getItem('dadwork_session_token') || '' }
            });
            if (!res.ok) throw new Error('Failed to clear history');
            toast.success('All history cleared. Balance is now $0.');
            loadCustomerData();
        } catch (e) {
            toast.error('Failed to clear history');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteCustomer = async () => {
        if (!customer) return;
        const userInput = prompt(`Are you sure you want to delete ${customer.name}? This removes ALL their data permanently. Type "DELETE" to confirm:`);
        if (userInput !== 'DELETE') {
            if (userInput !== null) toast.error('Confirmation failed. Customer not deleted.');
            return;
        }
        try {
            const res = await fetch(`/api/customers?id=${customerId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(`${customer.name} deleted`);
                router.push('/customers');
            }
        } catch {
            toast.error('Network error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Loading history...</p>
                </div>
            </div>
        );
    }

    if (!customer) return null;

    const filteredReceipts = receipts.filter(r => {
        // Show receipts that have either Maqalka (products), payments, or adjustments
        return r.totalMaqalka > 0 || r.totalPaid > 0 || r.totalAdjustment > 0;
    });

    // The card label must match the final line of the most recent receipt:
    // "Reesto" = latest receipt HAS a payment (remaining balance after payment)
    // "Lacagta Guud" = latest receipt has NO payment (full amount still owed)
    const latestReceiptHasPayment = filteredReceipts.length > 0 ? filteredReceipts[0].totalPaid > 0 : false;

    return (
        <div className="max-w-2xl mx-auto space-y-3 pb-20">
            {/* 1. Header Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.push('/customers')} className="rounded-full gap-1.5 text-muted-foreground hover:text-foreground text-xs h-8 px-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
                <div className="flex gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs h-8 px-2.5" onClick={handleOpenEdit}>
                                <Pencil className="w-3 h-3" /> Edit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] glass-card border-border shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Customer Details</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</Label>
                                    <Input
                                        id="name"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="h-12 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer Code</Label>
                                        <Input
                                            id="code"
                                            value={editCode}
                                            onChange={e => setEditCode(e.target.value)}
                                            className="h-12 font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gender</Label>
                                        <Select value={editGender} onValueChange={setEditGender}>
                                            <SelectTrigger className="h-12 font-bold">
                                                <SelectValue placeholder="Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={editPhone}
                                        onChange={e => setEditPhone(e.target.value)}
                                        className="h-12 font-bold"
                                        placeholder="+252..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenEdit}
                                        className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest border-border/60 hover:bg-muted"
                                    >
                                        <Pencil className="w-3 h-3 mr-1.5 text-muted-foreground" />
                                        Edit Info
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearAllHistory}
                                        className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1.5" />
                                        Clear All History
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full h-12 font-black uppercase tracking-widest"
                                    onClick={handleUpdateCustomer}
                                    disabled={updating}
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" className="rounded-full border-red-500/20 text-red-500 hover:bg-red-500/10 h-8 w-8 p-0" onClick={handleDeleteCustomer}>
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* 2. COMPACT PROFILE CARD */}
            <Card className="glass-card overflow-hidden border">
                <CardContent className="p-2.5 sm:p-3">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-10 w-10 border-2 border-background shadow shrink-0">
                            <AvatarFallback className="text-sm bg-primary text-primary-foreground font-black">
                                {customer.name.substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-sm sm:text-base font-black tracking-tight text-foreground uppercase truncate">{customer.name}</h1>
                                <span className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-primary/20 shrink-0">
                                    {customer.customer_code}
                                </span>
                            </div>
                            {customer.phone && (
                                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                    {customer.phone}
                                </p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            <p className={`text-lg sm:text-xl font-black leading-none ${summary.currentBalance > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                ${Math.abs(Math.round(summary.currentBalance)).toLocaleString()}
                            </p>
                            <span className={`text-[8px] uppercase font-bold ${summary.currentBalance > 0 ? 'text-destructive/70' : 'text-emerald-500/70'}`}>
                                {/* Driven by getBalanceLabel — single source of truth */}
                                {getBalanceLabel(filteredReceipts[0]?.totalPaid ?? 0)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Header for History */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <History className="w-3 h-3 text-primary" />
                    Buuga Maqalka History
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 rounded-full border-blue-500/20 bg-background hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    onClick={() => {
                        import('@/lib/export-pdf').then(m => m.downloadCustomerHistoryPDF(customer, transactions));
                    }}
                >
                    <FileDown className="w-3 h-3" />
                    Export PDF
                </Button>
            </div>

            {/* 4. RECEIPT HISTORY LIST */}
            <div className="space-y-3">
                {filteredReceipts.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-border/50">
                            <History className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Records Found</p>
                            <p className="text-xs text-muted-foreground/60">Change your filter or add a new transaction.</p>
                        </div>
                    </div>
                ) : (
                    filteredReceipts.map((receipt) => {
                        const isExpanded = expandedReceipts.has(receipt.id);
                        return (
                            <div key={receipt.id} className="rounded-lg border border-border/60 overflow-hidden bg-card">
                                <button
                                    onClick={() => toggleReceipt(receipt.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors"
                                >
                                    <div className={`w-1 h-8 rounded-full shrink-0 ${receipt.kind === 'ADJUSTMENT' ? 'bg-amber-500' : 'bg-primary'}`} />
                                    <p className="text-[11px] font-bold text-foreground flex-1 text-left leading-tight truncate">
                                        {receipt.titleString || format(new Date(receipt.mainDate), 'MMM dd, yyyy')}
                                    </p>
                                    <span className={`text-sm font-black shrink-0 ${receipt.closingBalance > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                        ${Math.abs(Math.round(receipt.closingBalance)).toLocaleString()}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-border/40 animate-in slide-in-from-top-1 duration-150">
                                        {/* PRINT PROOF HEADER (Visible only during print) */}
                                        <div className="hidden print:block p-6 text-center border-b-2 border-primary mb-4">
                                            <h1 className="text-2xl font-black uppercase tracking-widest">Dadcare Ledger Proof</h1>
                                            <p className="text-sm font-bold text-muted-foreground mt-1">{customer.name} · ID: {customer.customer_code}</p>
                                            <p className="text-[10px] uppercase mt-2">{receipt.titleString}</p>
                                        </div>

                                        <div className="px-3 py-2 flex justify-end gap-2 bg-muted/10 border-b border-border/30 print:hidden flex-wrap">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 rounded-full border-emerald-500/20 bg-background hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                onClick={() => {
                                                    downloadReceiptPDF({
                                                        customerName: customer.name,
                                                        customerCode: customer.customer_code,
                                                        titleString: receipt.titleString || '',
                                                        entries: receipt.entries,
                                                        totalMaqalka: receipt.totalMaqalka,
                                                        totalPaid: receipt.totalPaid,
                                                        totalAdjustment: receipt.totalAdjustment,
                                                        openingBalance: receipt.openingBalance,
                                                        closingBalance: receipt.closingBalance,
                                                    });
                                                    toast.success('PDF Downloaded!');
                                                }}
                                            >
                                                <FileDown className="w-3 h-3" />
                                                PDF
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 rounded-full border-green-500/20 bg-background hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                onClick={() => {
                                                    shareReceiptToWhatsApp({
                                                        customerName: customer.name,
                                                        customerCode: customer.customer_code,
                                                        titleString: receipt.titleString || '',
                                                        entries: receipt.entries,
                                                        totalMaqalka: receipt.totalMaqalka,
                                                        totalPaid: receipt.totalPaid,
                                                        totalAdjustment: receipt.totalAdjustment,
                                                        openingBalance: receipt.openingBalance,
                                                        closingBalance: receipt.closingBalance,
                                                    }, customer.phone);
                                                }}
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                WhatsApp
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 rounded-full border-primary/20 bg-background hover:bg-primary hover:text-white transition-all shadow-sm"
                                                onClick={() => window.print()}
                                            >
                                                <Printer className="w-3 h-3" />
                                                Print
                                            </Button>
                                        </div>
                                        {receipt.kind === 'ADJUSTMENT' ? (
                                            <div>
                                            </div>
                                        ) : (
                                            <div className="relative overflow-hidden bg-[#fdfbf7] dark:bg-[#1e1c18] font-mono text-[11px] pb-4 rounded-b-lg border-t border-border/40 shadow-inner">
                                                {/* Vertical Notebook Lines (Margin) */}
                                                <div className="absolute left-8 top-0 bottom-0 w-px bg-[#C19A6B]/60 dark:bg-[#C19A6B]/40 z-0"></div>
                                                <div className="absolute left-9 top-0 bottom-0 w-px bg-[#C19A6B]/60 dark:bg-[#C19A6B]/40 z-0"></div>

                                                <div className="relative z-10 pl-12 pr-4 pt-3 space-y-0 text-slate-800 dark:text-slate-300">
                                                    {receipt.titleString && (
                                                        <p className="text-[9px] font-bold text-muted-foreground text-center mb-2">
                                                            {receipt.titleString}
                                                        </p>
                                                    )}

                                                    {/* 1. Maqalka entries (products) */}
                                                    {receipt.entries.filter(e => e.type === 'PRODUCT').map(e => (
                                                        <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 font-medium">
                                                            <span>{format(new Date(e.reference_date), 'MMM dd')} · {Math.round(e.kg || 0)}KG @ ${e.price_per_kg}</span>
                                                            <span className="font-bold">${Math.round(e.amount).toLocaleString()}</span>
                                                        </div>
                                                    ))}

                                                    {/* 2. Maqalka Total (products subtotal only) */}
                                                    {receipt.entries.some(e => e.type === 'PRODUCT') && (
                                                        <div className="flex justify-between py-1.5 border-b border-blue-300 dark:border-blue-800/60 font-bold text-slate-900 dark:text-slate-100">
                                                            <span>Maqalka</span>
                                                            <span>${Math.round(receipt.totalMaqalka).toLocaleString()}</span>
                                                        </div>
                                                    )}

                                                    {/* 3. Reesto (Previous/Opening Balance) */}
                                                    {receipt.openingBalance !== 0 && (
                                                        <div className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-amber-700 dark:text-amber-500 font-bold bg-amber-500/5 px-1 -ml-1 rounded-sm mt-1">
                                                            <span>Reesto</span>
                                                            <span>{receipt.openingBalance > 0 ? '+' : ''}${Math.round(receipt.openingBalance).toLocaleString()}</span>
                                                        </div>
                                                    )}

                                                    {/* 3b. Adjustment entries (also Reesto — carried-over debt) */}
                                                    {receipt.entries.filter(e => e.type === 'ADJUSTMENT').map(e => (
                                                        <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-amber-700 dark:text-amber-500 font-bold bg-amber-500/5 px-1 -ml-1 rounded-sm mt-1">
                                                            <span>{LABEL_REESTO}</span>
                                                            <span>+${Math.round(e.amount).toLocaleString()}</span>
                                                        </div>
                                                    ))}

                                                    {/* 4. Lacagta Guud — total owed (Maqalka + Reesto), shown only when no payment made */}
                                                    {(receipt.totalMaqalka > 0 || receipt.totalAdjustment > 0) && (
                                                        <div className="flex justify-between py-1.5 border-b-2 border-red-300 dark:border-red-900/50 font-black text-slate-900 dark:text-slate-100">
                                                            {/* Uses LABEL_LACAGTA_GUUD — single source of truth */}
                                                            <span>{LABEL_LACAGTA_GUUD}</span>
                                                            <span>${Math.round(receipt.totalMaqalka + receipt.totalAdjustment + receipt.openingBalance).toLocaleString()}</span>
                                                        </div>
                                                    )}

                                                    {/* 5. Lacagaha (Payments list) */}
                                                    {receipt.entries.some(e => e.type === 'PAYMENT') && (
                                                        <>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700/80 dark:text-emerald-500/80 pt-2.5 pb-0.5">Lacagaha</p>
                                                            {receipt.entries.filter(e => e.type === 'PAYMENT').map(e => (
                                                                <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-emerald-700 dark:text-emerald-500 font-bold">
                                                                    <span>{format(new Date(e.reference_date), 'MMM dd')} Payment</span>
                                                                    <span>-${Math.round(e.amount).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* 6. Final Balance — only shown when payment was made */}
                                                    {receipt.totalPaid > 0 && (
                                                        <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-double border-amber-400/50 dark:border-amber-600/50 px-1 py-1">
                                                            <span className="font-black text-sm text-[#C19A6B] dark:text-[#D4B087]">
                                                                {/* Uses LABEL_REESTO — single source of truth */}
                                                                {LABEL_REESTO}
                                                            </span>
                                                            <span className={`text-lg font-black ${receipt.closingBalance > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                                                ${Math.abs(Math.round(receipt.closingBalance)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
