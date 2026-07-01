'use client';

// ─── SINGLE SOURCE OF TRUTH for balance labels ───────────────────────────────
// Change these two strings here and EVERY label in the UI updates automatically.
const LABEL_REESTO       = 'Reesto';       // Shown when a payment exists → remaining balance
const LABEL_LACAGTA_GUUD = 'Lacagta Guud'; // Shown when no payment made → total amount owed
const LABEL_HEYN         = 'Heyn';         // Shown when customer overpays (negative debt)
/** Returns the correct balance label based purely on whether a payment was made */
const getBalanceLabel = (totalPaid: number, closingBalance: number): string => {
    if (closingBalance < 0) return LABEL_HEYN;
    return totalPaid > 0 ? LABEL_REESTO : LABEL_LACAGTA_GUUD;
};
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
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
    DialogDescription,
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
import { MessageCircle, FileDown, Lock } from 'lucide-react';
import { SecurityVerificationDialog } from '@/components/security-verification-dialog';
import { useSession } from '@/hooks/useSession';

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
    edit_count?: number;
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

const fetcher = async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dadwork_session_token') || '' : '';
    const res = await fetch(url, { headers: token ? { 'x-session-token': token } : {} });
    if (!res.ok) throw new Error('Fetch error');
    return res.json();
};

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [receipts, setReceipts] = useState<ReceiptGroup[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalKg: 0, totalPaid: 0, currentBalance: 0 });
    const [loading, setLoading] = useState(true);
    const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(new Set());

    const { session } = useSession();
    const isAtLeastAdmin = session?.role === 'SUPER_ADMIN' || session?.role === 'ADMIN';
    const isSuperAdmin = session?.role === 'SUPER_ADMIN';

    // Pagination & Filter State
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTitle, setSearchTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterActive, setFilterActive] = useState(false);

    // Edit State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editGender, setEditGender] = useState('');
    const [updating, setUpdating] = useState(false);
    const [pendingSecurityAction, setPendingSecurityAction] = useState<'clear_history' | 'delete_customer' | 'delete_receipt' | null>(null);
    const [receiptToDelete, setReceiptToDelete] = useState<ReceiptGroup | null>(null);

    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [editTxAmount, setEditTxAmount] = useState('');
    const [editTxKg, setEditTxKg] = useState('');
    const [editTxPrice, setEditTxPrice] = useState('');

    const openEditModal = (tx: Transaction) => {
        setTransactionToEdit(tx);
        setEditTxAmount(tx.amount.toString());
        setEditTxKg(tx.kg ? tx.kg.toString() : '');
        setEditTxPrice(tx.price_per_kg ? tx.price_per_kg.toString() : '');
    };

    const handleEditTransaction = async () => {
        if (!transactionToEdit) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/ledger/${transactionToEdit.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-session-token': localStorage.getItem('dadwork_session_token') || '' },
                body: JSON.stringify({
                    amount: editTxAmount ? parseFloat(editTxAmount) : undefined,
                    kg: editTxKg ? parseFloat(editTxKg) : undefined,
                    price_per_kg: editTxPrice ? parseFloat(editTxPrice) : undefined
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            toast.success(`Updated successfully! Remaining edits: ${data.remaining_edits}`);
            setTransactionToEdit(null);
            loadCustomerData(true);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleUndoTransaction = async (txId: string) => {
        if (!confirm('Are you sure you want to undo this entry? This will recalculate all subsequent balances.')) return;
        try {
            const res = await fetch(`/api/ledger/${txId}`, {
                method: 'DELETE',
                headers: { 'x-session-token': localStorage.getItem('dadwork_session_token') || '' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to undo');
            toast.success('Entry successfully undone.');
            loadCustomerData(true);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteReceiptGroup = async (receipt: ReceiptGroup) => {
        setPendingSecurityAction(null);
        setReceiptToDelete(null);
        setUpdating(true);
        try {
            const transactionIds = receipt.entries.map(e => e.id);
            const res = await fetch(`/api/ledger/batch`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-session-token': localStorage.getItem('dadwork_session_token') || '' 
                },
                body: JSON.stringify({ transactionIds, customerId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete receipt');
            toast.success('Receipt successfully deleted and balance recalculated.');
            loadCustomerData(true);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

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

    const { data: allCustomers } = useSWR<Customer[]>('/api/customers', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 120000,   // 2 min — shared cache with other pages
        keepPreviousData: true,
    });
    
    // Construct the base URL for the first page of ledger data
    let baseLedgerUrl = `/api/ledger?customerId=${customerId}&limit=200&offset=0`;
    if (startDate) baseLedgerUrl += `&startDate=${startDate}`;
    if (endDate) baseLedgerUrl += `&endDate=${endDate}`;
    
    const { data: initialLedgerData, mutate: mutateLedger } = useSWR(baseLedgerUrl, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 30000,    // 30s
        keepPreviousData: true,     // Show old data while refreshing
    });

    // Sync SWR cache instantly to local state
    useEffect(() => {
        if (allCustomers) {
            setCustomer(allCustomers.find((c: Customer) => c.id === customerId) || null);
        }
    }, [allCustomers, customerId]);

    useEffect(() => {
        if (initialLedgerData) {
            const allTxns = initialLedgerData.transactions || [];
            setTransactions(allTxns);
            setReceipts(groupTransactionsInfoReceipts(allTxns));
            setSummary(initialLedgerData.summary || { totalKg: 0, totalPaid: 0, currentBalance: 0 });
            setHasMore(allTxns.length === 200);
            setLoading(false);
        }
    }, [initialLedgerData]);

    const loadCustomerData = async (reset = false) => {
        if (reset) {
            setTransactions([]);
            setReceipts([]);
            setHasMore(true);
            setLoading(true);
        }
        mutateLedger();
    };

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const nextOffset = transactions.length;
            let url = `/api/ledger?customerId=${customerId}&limit=200&offset=${nextOffset}&t=${Date.now()}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const ledgerRes = await fetch(url);
            const ledgerData = await ledgerRes.json();

            if (ledgerData.transactions && ledgerData.transactions.length > 0) {
                const newTxns = [...transactions, ...ledgerData.transactions];
                setTransactions(newTxns);
                setReceipts(groupTransactionsInfoReceipts(newTxns));
                setHasMore(ledgerData.transactions.length === 200);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            toast.error('Failed to load more history');
        } finally {
            setLoadingMore(false);
        }
    };



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

    const handleClearAllHistory = () => {
        setPendingSecurityAction('clear_history');
    };

    const executeClearAllHistory = async () => {
        setPendingSecurityAction(null);
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

    const handleDeleteCustomer = () => {
        setPendingSecurityAction('delete_customer');
    };

    const executeDeleteCustomer = async () => {
        setPendingSecurityAction(null);
        if (!customer) return;
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

    const finalReceipts = filteredReceipts.filter(r => {
        if (!searchTitle) return true;
        const title = r.titleString || format(new Date(r.mainDate), 'MMM dd, yyyy');
        return title.toLowerCase().includes(searchTitle.toLowerCase());
    });

    // The card label must match the final line of the most recent receipt:
    // "Reesto" = latest receipt HAS a payment (remaining balance after payment)
    // "Lacagta Guud" = latest receipt has NO payment (full amount still owed)
    const latestReceiptHasPayment = filteredReceipts.length > 0 ? filteredReceipts[0].totalPaid > 0 : false;

    return (
        <div className="max-w-2xl mx-auto space-y-3 pb-20">
            <SecurityVerificationDialog
                isOpen={!!pendingSecurityAction}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingSecurityAction(null);
                        setReceiptToDelete(null);
                    }
                }}
                onConfirm={() => {
                    if (pendingSecurityAction === 'clear_history') executeClearAllHistory();
                    if (pendingSecurityAction === 'delete_customer') executeDeleteCustomer();
                    if (pendingSecurityAction === 'delete_receipt' && receiptToDelete) handleDeleteReceiptGroup(receiptToDelete);
                }}
                title={
                    pendingSecurityAction === 'clear_history' ? 'Clear History' : 
                    pendingSecurityAction === 'delete_receipt' ? 'Delete Receipt Block' : 
                    'Delete Customer'
                }
                description={
                    pendingSecurityAction === 'clear_history' ? 'Permanently clear all ledger history for this customer?' : 
                    pendingSecurityAction === 'delete_receipt' ? `Permanently delete ${receiptToDelete?.entries.length} transactions from "${receiptToDelete?.titleString}"?` :
                    'Permanently delete this customer and all their data?'
                }
                isProcessing={updating}
            />

            {/* Transaction Edit Modal */}
            <Dialog open={!!transactionToEdit} onOpenChange={(open) => !open && setTransactionToEdit(null)}>
                <DialogContent className="sm:max-w-[425px] glass-card border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Transaction</DialogTitle>
                        <DialogDescription className="text-[10px] opacity-70">
                            You have {(2 - (transactionToEdit?.edit_count || 0))} edits remaining.
                        </DialogDescription>
                        {transactionToEdit?.type === 'PRODUCT' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mt-2 rounded-md">
                                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 shrink-0" />
                                    KG amounts are locked to ensure perfect synchronization. To edit the KG, please edit the Buuga Maalinlaha (Daily Book).
                                </p>
                            </div>
                        )}
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {transactionToEdit?.type === 'PRODUCT' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 opacity-60">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">KG <Lock className="w-2.5 h-2.5" /></Label>
                                    <Input
                                        type="number"
                                        value={editTxKg}
                                        disabled
                                        className="h-12 font-bold bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price/KG</Label>
                                    <Input
                                        type="number"
                                        value={editTxPrice}
                                        onChange={e => {
                                            setEditTxPrice(e.target.value);
                                            if (editTxKg && e.target.value) {
                                                setEditTxAmount((parseFloat(editTxKg) * parseFloat(e.target.value)).toString());
                                            }
                                        }}
                                        className="h-12 font-bold"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amount ($)</Label>
                            <Input
                                type="number"
                                value={editTxAmount}
                                onChange={e => setEditTxAmount(e.target.value)}
                                className="h-12 font-bold"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full h-12 font-black uppercase tracking-widest"
                            onClick={handleEditTransaction}
                            disabled={updating || (transactionToEdit?.edit_count || 0) >= 2}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {(transactionToEdit?.edit_count || 0) >= 2 ? 'Edit Limit Reached' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                {getBalanceLabel(filteredReceipts[0]?.totalPaid ?? 0, summary.currentBalance)}
                            </span>
                            {/* Latest maqal % — matches customer list */}
                            {(() => {
                                const latestWithProducts = filteredReceipts.find(r => r.totalMaqalka > 0);
                                if (!latestWithProducts || latestWithProducts.totalMaqalka === 0) return null;
                                const pct = Math.min(100, Math.round((latestWithProducts.totalPaid / latestWithProducts.totalMaqalka) * 100));
                                return (
                                    <span className={`block mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded inline-block ${pct >= 100 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                                        {pct}% Paid
                                    </span>
                                );
                            })()}
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
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setFilterActive(!filterActive)} className="h-7 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 rounded-full hover:bg-muted shadow-sm border border-transparent hover:border-border">
                        <Filter className="w-3 h-3" /> Filter
                    </Button>
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
            </div>

            {/* Filter Section */}
            {filterActive && (
                <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 space-y-1.5">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Quick Search</Label>
                        <Input 
                            placeholder="e.g. 07 Jun" 
                            className="h-10 text-xs font-bold bg-background shadow-inner" 
                            value={searchTitle} 
                            onChange={(e) => setSearchTitle(e.target.value)} 
                        />
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">DB Start Date</Label>
                        <Input type="date" className="h-10 text-xs font-bold bg-background shadow-inner" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">DB End Date</Label>
                        <Input type="date" className="h-10 text-xs font-bold bg-background shadow-inner" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                        <Button size="sm" className="h-10 w-full md:w-auto font-black uppercase tracking-widest text-[10px] px-6 shadow-md" onClick={() => loadCustomerData(true)}>Search</Button>
                    </div>
                </div>
            )}

            {/* 4. RECEIPT HISTORY LIST */}
            <div className="space-y-3">
                {finalReceipts.length === 0 ? (
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
                    finalReceipts.map((receipt) => {
                        const isExpanded = expandedReceipts.has(receipt.id);
                        return (
                            <div key={receipt.id} className="rounded-lg border border-border/60 overflow-hidden bg-card">
                            <button
                                    onClick={() => toggleReceipt(receipt.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors"
                                >
                                    <div className={`w-1 h-8 rounded-full shrink-0 ${receipt.kind === 'ADJUSTMENT' ? 'bg-amber-500' : 'bg-primary'}`} />
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-[11px] font-bold text-foreground leading-tight truncate">
                                            {receipt.titleString || format(new Date(receipt.mainDate), 'MMM dd, yyyy')}
                                        </p>
                                        {/* Inline badges: % paid + diff amount */}
                                        {receipt.totalMaqalka > 0 && (() => {
                                            const paymentsInReceipt = receipt.entries.filter(e => e.type === 'PAYMENT').reduce((sum, e) => sum + Math.abs(e.amount), 0);
                                            const pct = Math.min(100, Math.round((paymentsInReceipt / receipt.totalMaqalka) * 100));
                                            const diff = paymentsInReceipt - receipt.totalMaqalka;
                                            // diff > 0 = overpaid (Kaso hartay = has credit) → GREEN
                                            // diff < 0 = still owes (Ka dhiman) → ORANGE ≥50%, RED <50%
                                            const isOverpaid = diff > 0;   // paid MORE than maqal
                                            const isExact = diff === 0;
                                            const owesColor = pct >= 50
                                                ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                                                : 'bg-red-500/15 text-red-700 dark:text-red-400';
                                            
                                            if (paymentsInReceipt === 0) return null;

                                            return (
                                                <div className="mt-1.5 w-full h-[18px] overflow-hidden relative border-l-2 border-r-2 border-amber-400/40 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 rounded shadow-[0_0_8px_rgba(251,191,36,0.15)]">
                                                    <div className="inline-flex gap-4 w-max animate-kinetic px-2">
                                                        {/* % Paid badge */}
                                                        <span className={`text-[8px] font-black tracking-widest uppercase flex items-center gap-1 animate-lightning ${pct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            ⚡ {pct}% Paid
                                                        </span>
                                                        {/* Diff badge */}
                                                        {!isExact && (
                                                            <span className={`text-[8px] font-black tracking-widest uppercase flex items-center gap-1 animate-lightning ${
                                                                isOverpaid
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : (pct >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400')
                                                            }`}>
                                                                ⚡ {isOverpaid
                                                                    ? `Kaso hartay -$${Math.abs(Math.round(diff))}`
                                                                    : `Ka dhiman +$${Math.abs(Math.round(diff))}`}
                                                            </span>
                                                        )}
                                                        {isExact && pct >= 100 && (
                                                            <span className="text-[8px] font-black tracking-widest uppercase flex items-center gap-1 animate-lightning text-emerald-600 dark:text-emerald-400">
                                                                ⚡ ✓ Exact
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <span className={`text-sm font-black shrink-0 ${receipt.closingBalance > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                        {receipt.closingBalance < 0 ? '-' : ''}${Math.abs(Math.round(receipt.closingBalance)).toLocaleString()}
                                    </span>
                                    {isSuperAdmin && (
                                        <div 
                                            role="button" 
                                            tabIndex={0}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setReceiptToDelete(receipt);
                                                setPendingSecurityAction('delete_receipt');
                                            }} 
                                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500/10 text-red-500/70 hover:text-red-600 transition-colors shrink-0 ml-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </div>
                                    )}
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
                                                    {receipt.titleString && (() => {
                                                        const paymentsInReceipt = receipt.entries.filter(e => e.type === 'PAYMENT').reduce((sum, e) => sum + Math.abs(e.amount), 0);
                                                        const pct = receipt.totalMaqalka > 0 ? Math.min(100, Math.round((paymentsInReceipt / receipt.totalMaqalka) * 100)) : 100;
                                                        return (
                                                            <div className="flex flex-col items-center justify-center gap-1 mb-3">
                                                                <p className="text-[9px] font-bold text-muted-foreground text-center">
                                                                    {receipt.titleString}
                                                                </p>
                                                                {receipt.totalMaqalka > 0 && (
                                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider ${pct >= 100 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : pct >= 50 ? 'bg-amber-500/20 text-amber-700 dark:text-amber-500' : 'bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                                                                        {pct}% Paid
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* 1. Maqalka entries (products) */}
                                                    {receipt.entries.filter(e => e.type === 'PRODUCT').filter((e, idx, arr) => {
                                                        if (Math.round(e.kg || 0) > 0) return true;
                                                        const hasOther = arr.some(other => other.reference_date === e.reference_date && other.id !== e.id && Math.round(other.kg || 0) > 0);
                                                        return !hasOther;
                                                    }).map((e, idx, arr) => {
                                                        const isAbsent = Math.round(e.kg || 0) === 0;
                                                        const hasMain = arr.some(other => other.reference_date === e.reference_date && !other.note && Math.round(other.kg || 0) > 0);
                                                        return (
                                                            <div key={e.id} className={`flex justify-between items-start py-1.5 border-b border-blue-200 dark:border-blue-900/40 font-medium ${isAbsent ? 'opacity-60 line-through-none' : ''}`}>
                                                                <div className="flex flex-col flex-1">
                                                                    <span>
                                                                        {(e.note && hasMain) ? '↳ ' : ''}
                                                                        {format(new Date(e.reference_date), 'MMM dd')} · {isAbsent ? '❌ Baaqatay' : `${Math.round(e.kg || 0)}KG @ $${e.price_per_kg}`}
                                                                        {e.note ? ` (${e.note})` : ''}
                                                                    </span>
                                                                    {/* Edit/Undo completely removed for PRODUCT entries as requested */}
                                                                </div>
                                                                <span className="font-bold shrink-0">{isAbsent ? '$0' : `$${Math.round(e.amount).toLocaleString()}`}</span>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* 2. Maqalka Total (products subtotal only) */}
                                                    {receipt.entries.some(e => e.type === 'PRODUCT') && (() => {
                                                        const paymentsInReceipt = receipt.entries.filter(e => e.type === 'PAYMENT').reduce((sum, e) => sum + Math.abs(e.amount), 0);
                                                        const pct = receipt.totalMaqalka > 0 ? Math.min(100, Math.round((paymentsInReceipt / receipt.totalMaqalka) * 100)) : 100;
                                                        return (
                                                            <div className="flex justify-between py-1.5 border-b border-blue-300 dark:border-blue-800/60 font-bold text-slate-900 dark:text-slate-100">
                                                                <span className="flex items-center gap-2">
                                                                    Maqalka
                                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm ${pct >= 100 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : pct >= 50 ? 'bg-amber-500/20 text-amber-700 dark:text-amber-500' : 'bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                                                                        {pct}% Paid
                                                                    </span>
                                                                </span>
                                                                <span>${Math.round(receipt.totalMaqalka).toLocaleString()}</span>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* 3. Reesto (Previous/Opening Balance) */}
                                                    {receipt.openingBalance !== 0 && (
                                                        <div className={`flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 font-bold px-1 -ml-1 rounded-sm mt-1 ${
                                                            receipt.openingBalance < 0
                                                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/5'
                                                                : 'text-amber-700 dark:text-amber-500 bg-amber-500/5'
                                                        }`}>
                                                            <span>{receipt.openingBalance < 0 ? LABEL_HEYN : LABEL_REESTO}</span>
                                                            <span>
                                                                {receipt.openingBalance < 0 ? '-' : '+'}
                                                                ${Math.abs(Math.round(receipt.openingBalance)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* 3b. Adjustment entries (also Reesto — carried-over debt) */}
                                                    {receipt.entries.filter(e => e.type === 'ADJUSTMENT').map(e => (
                                                        <div key={e.id} className="flex justify-between py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-amber-700 dark:text-amber-500 font-bold bg-amber-500/5 px-1 -ml-1 rounded-sm mt-1">
                                                            <span>{e.amount < 0 ? LABEL_HEYN : LABEL_REESTO}</span>
                                                            <span>{e.amount > 0 ? '+' : ''}${Math.abs(Math.round(e.amount)).toLocaleString()}</span>
                                                        </div>
                                                    ))}

                                                    {/* 4. Lacagta Guud — total owed (Maqalka + Heyn) */}
                                                    {(receipt.totalMaqalka > 0 || receipt.totalAdjustment > 0) && (() => {
                                                        const totalOwed = Math.round(receipt.totalMaqalka + receipt.totalAdjustment + receipt.openingBalance);
                                                        return (
                                                            <div className="flex justify-between py-1.5 border-b-2 border-red-300 dark:border-red-900/50 font-black text-slate-900 dark:text-slate-100">
                                                                <span>{totalOwed < 0 ? LABEL_HEYN : LABEL_LACAGTA_GUUD}</span>
                                                                <span>${Math.abs(totalOwed).toLocaleString()}</span>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* 5. Lacagaha (Payments list) */}
                                                    {receipt.entries.some(e => e.type === 'PAYMENT') && (
                                                        <>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700/80 dark:text-emerald-500/80 pt-2.5 pb-0.5">Lacagaha</p>
                                                            {receipt.entries.filter(e => e.type === 'PAYMENT').map(e => (
                                                                <div key={e.id} className="flex justify-between items-start py-1.5 border-b border-blue-200 dark:border-blue-900/40 text-emerald-700 dark:text-emerald-500 font-bold">
                                                                    <div className="flex flex-col flex-1">
                                                                        <span>{format(new Date(e.reference_date), 'MMM dd')} Payment</span>
                                                                        {(() => {
                                                                            const txTime = new Date(e.created_at || e.reference_date).getTime();
                                                                            const isRecent = (Date.now() - txTime) < 24 * 60 * 60 * 1000;
                                                                            if (isAtLeastAdmin && isRecent) {
                                                                                return (
                                                                                    <div className="flex gap-3 mt-1 opacity-60 hover:opacity-100 transition-opacity print:hidden">
                                                                                        <button onClick={(ev) => { ev.stopPropagation(); openEditModal(e); }} className="text-[10px] uppercase font-bold flex items-center gap-1 hover:underline"><Pencil className="w-3 h-3"/> Edit</button>
                                                                                        <button onClick={(ev) => { ev.stopPropagation(); handleUndoTransaction(e.id); }} className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline"><Trash2 className="w-3 h-3"/> Undo</button>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })()}
                                                                    </div>
                                                                    <span className="shrink-0">-${Math.round(e.amount).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* 6. Final Balance — shown when payment was made */}
                                                    {receipt.totalPaid > 0 && (
                                                        <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-double border-amber-400/50 dark:border-amber-600/50 px-1 py-1">
                                                            <span className={`font-black text-sm ${
                                                                receipt.closingBalance < 0
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-[#C19A6B] dark:text-[#D4B087]'
                                                            }`}>
                                                                {receipt.closingBalance < 0 ? LABEL_HEYN : LABEL_REESTO}
                                                            </span>
                                                            <span className={`text-lg font-black ${
                                                                receipt.closingBalance > 0
                                                                    ? 'text-destructive'
                                                                    : receipt.closingBalance < 0
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-slate-500'
                                                            }`}>
                                                                {receipt.closingBalance < 0 ? '-' : ''}${Math.abs(Math.round(receipt.closingBalance)).toLocaleString()}
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

            {/* Pagination Load More Button */}
            {hasMore && finalReceipts.length > 0 && !searchTitle && (
                <Button 
                    variant="outline" 
                    onClick={loadMore} 
                    disabled={loadingMore} 
                    className="w-full mt-6 h-12 font-black uppercase tracking-widest text-xs border-dashed border-2 hover:bg-muted shadow-sm text-muted-foreground hover:text-foreground"
                >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    Load Older History
                </Button>
            )}
        </div>
    );
}
