'use client';

import { useState, useEffect } from 'react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { AddCustomerDialog } from '@/components/add-customer-dialog';
import { CalendarIcon, Save, Plus, FileText, Edit, ChevronDown, ChevronRight, Search, BookOpen, Trash2, User, Loader2, Package, MessageSquare, Maximize2, Minimize2, Download, ShieldAlert, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { SecurityVerificationDialog } from '@/components/security-verification-dialog';
import { useDailyBookInit, useDailyBookDate, useLedgerStatusForDate } from '@/hooks/useDailyBook';
import { DailyBookErrorBoundary } from './error-boundary';
interface Customer {
    id: string;
    name: string;
    customer_code: string;
    gender?: string;
    phone?: string;
    avatar_url?: string;
}

interface DailyBookItem {
    customer_id: string;
    kg: number;
    present?: boolean;
    note?: string;
    customer?: {
        id: string;
        name: string;
        customer_code: string;
        gender?: string;
        avatar_url?: string;
    };
}

interface SavedEntry {
    date: string;
    totalKg: number;
    items: DailyBookItem[];
}

function getVipInfo(note?: string) {
    if (!note) return null;
    const match = note.match(/(\d+(?:\.\d+)?)\s*vip/i);
    if (match) {
        return { count: parseFloat(match[1]), text: `${match[1]} VIP` };
    }
    if (note.toLowerCase().includes('vip')) {
        return { count: 0, text: 'VIP' };
    }
    return null;
}

function DailyBookPageInner() {
    const [date, setDate] = useState<Date>(new Date());
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [entries, setEntries] = useState<{ [key: string]: { kg: number, present: boolean, note: string } }>({});
    const [saving, setSaving] = useState(false);
    const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
    const [viewMode, setViewMode] = useState<'edit' | 'details'>('edit');
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
    const [focusedEntry, setFocusedEntry] = useState<SavedEntry | null>(null);
    const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [latestSavedDateStr, setLatestSavedDateStr] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [visibleEntriesCount, setVisibleEntriesCount] = useState(10);
    const [processedCustomerIds, setProcessedCustomerIds] = useState<Set<string>>(new Set());
    const [loadingLedgerStatus, setLoadingLedgerStatus] = useState(false);
    const [historyLedgerStatus, setHistoryLedgerStatus] = useState<Record<string, Set<string>>>({});
    const [deleteConfirmDate, setDeleteConfirmDate] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // ⚡ SWR Hooks for Lightning Fast Caching
    const { data: initData, mutate: mutateInit } = useDailyBookInit();
    const loadInit = () => mutateInit(); // Used by AddCustomerDialog to refresh after adding a customer
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data: bookData } = useDailyBookDate(isInitialized && !editingDate ? dateStr : null);
    const { processedCustomerIds: swrLedgerIds, isLoading: swrLedgerLoading, mutate: mutateLedger } = useLedgerStatusForDate(dateStr);

    // Sync SWR Init Data to Local State (Protects Optimistic UI)
    useEffect(() => {
        if (initData && typeof initData === 'object' && initData.customers) {
            setCustomers(initData.customers);
            setSavedEntries(initData.history);
            
            if (!isInitialized) {
                if (initData.latestDate) {
                    setLatestSavedDateStr(initData.latestDate);
                    if (!editingDate) {
                        setDate(addDays(parseISO(initData.latestDate), 1));
                    }
                }
                setIsInitialized(true);
            }
        } else if (initData === undefined) {
             // Still loading, do nothing
        } else {
             // null (error) or empty — safely release the initialized lock
             setIsInitialized(true);
        }
    }, [initData, editingDate, isInitialized]);

    // Sync SWR Book Data to Local Entries
    useEffect(() => {
        if (bookData && bookData.items) {
            const loadedEntries: { [key: string]: { kg: number, present: boolean, note: string } } = {};
            bookData.items.forEach((item: DailyBookItem) => {
                loadedEntries[item.customer_id] = { kg: item.kg || 0, present: item.present ?? true, note: item.note || '' };
            });
            setEntries(loadedEntries);
        } else if (bookData === null) {
            setEntries({});
        }
    }, [bookData]);

    // Sync SWR Ledger Status to Local State
    useEffect(() => {
        setProcessedCustomerIds(swrLedgerIds);
        setLoadingLedgerStatus(swrLedgerLoading);
    }, [swrLedgerIds, swrLedgerLoading]);

    const fetchLatestDate = async () => {
        try {
            const res = await fetch('/api/daily-book-dates');
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const latest = data[0].date;
                setLatestSavedDateStr(latest);
                if (!editingDate) {
                    const nextDate = addDays(parseISO(latest), 1);
                    setDate(nextDate);
                }
            }
        } catch (err) {
            console.error('Failed to fetch latest date', err);
        }
    };

    const loadSavedEntries = async () => {
        try {
            const res = await fetch('/api/daily-book-history');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setSavedEntries(data);
            }
        } catch (e) {
            console.error('Failed to load history', e);
        }
    };


    const handleSave = async () => {
        setSaving(true);
        const dateStr = format(date, 'yyyy-MM-dd');

        const items = Object.entries(entries)
            .filter(([_, data]) => data.kg > 0 || data.present === false || data.note.trim() !== '')
            .map(([customer_id, data]) => ({
                customer_id,
                kg: data.kg,
                present: data.present,
                note: data.note,
                customer: customers.find(c => c.id === customer_id)
            }));

        // OPTIMISTIC UI UPDATE: Instantly reflect the change locally
        const newEntry: SavedEntry = {
            date: dateStr,
            totalKg: items.reduce((sum, item) => sum + item.kg, 0),
            items: items.map(item => ({
                ...item,
                customer: customers.find(c => c.id === item.customer_id)
            }))
        };

        const previousEntries = [...savedEntries];
        setSavedEntries(prev => {
            const filtered = prev.filter(e => e.date !== dateStr);
            return [newEntry, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        toast.success('Book saved successfully!', { description: 'Updated instantly' });
        
        // Reset the UI states immediately for a fast UX
        setEntries({});
        setEditingDate(null);
        setLatestSavedDateStr(dateStr);
        setDate(addDays(date, 1));
        setViewMode('details');

        try {
            if (editingDate && editingDate !== dateStr) {
                // Delete the old daily book entry to prevent duplicate keys or outdated records
                try {
                    const delRes = await fetch(`/api/daily-book?date=${editingDate}`, { method: 'DELETE' });
                    if (!delRes.ok && delRes.status !== 404) {
                        const errText = await delRes.text();
                        console.error('Failed to delete old entry:', errText);
                    }
                } catch (delErr) {
                    console.error('Error deleting old entry:', delErr);
                }
            }

            const res = await fetch('/api/daily-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, items })
            });

            if (!res.ok) {
                // Rollback if the server fails
                setSavedEntries(previousEntries);
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || 'Failed to save entry, rolled back');
                return;
            }

            // Success side effects
            setViewMode('details');
        } catch (e: any) {
            console.error('Save error:', e);
            toast.error(e.message || 'Network error');
        } finally {
            setSaving(false);
            fetchLatestDate(); // Refresh sequence after save
            mutateLedger(); // Refresh ledger indicators after save via SWR
        }
    };

    const handleEditEntry = (entry: SavedEntry) => {
        const selectedDate = parseISO(entry.date);
        setDate(selectedDate);
        const loadedEntries: { [key: string]: { kg: number, present: boolean, note: string } } = {};
        entry.items.forEach(item => {
            loadedEntries[item.customer_id] = { kg: item.kg || 0, present: item.present ?? true, note: item.note || '' };
        });
        setEntries(loadedEntries);
        setEditingDate(entry.date);
        setViewMode('edit');
    };

    const handleDeleteEntry = async () => {
        if (!deleteConfirmDate) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/daily-book?date=${deleteConfirmDate}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            setSavedEntries(prev => prev.filter(e => e.date !== deleteConfirmDate));
            toast.success('Moved to Recycle Bin');
            setDeleteConfirmDate(null);
        } catch (err: any) {
            toast.error('Failed to move to trash: ' + (err.message || 'Server error'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportBackup = async () => {
        try {
            const { downloadDailyBookBackupPDF } = await import('@/lib/export-pdf');
            downloadDailyBookBackupPDF(savedEntries);
            toast.success('Buuga Maalinlaha PDF backup downloaded successfully');
        } catch (e) {
            toast.error('Failed to generate PDF backup');
            console.error(e);
        }
    };

    const handleDateChange = (newDate: Date) => {
        // Mode bypass
        if (editingDate) {
            setDate(newDate);
            return;
        }

        if (latestSavedDateStr) {
            const nextRequired = addDays(parseISO(latestSavedDateStr), 1);
            if (!isSameDay(newDate, nextRequired)) {
                toast.error(`Real-life sequence required! The next date must be ${format(nextRequired, 'MMMM dd, yyyy')} because ${format(parseISO(latestSavedDateStr), 'MMMM dd')} was the last entry.`);
                return;
            }
        }
        setDate(newDate);
    };

    const totalKg = Object.values(entries).reduce((sum, data) => sum + (parseFloat(String(data.kg)) || 0), 0);
    const totalVip = Object.values(entries).reduce((sum, entry) => {
        const vip = getVipInfo(entry.note);
        return sum + (vip ? vip.count : 0);
    }, 0);
    const filteredEntries = searchDate
        ? savedEntries.filter(e => e.date && e.date.substring(0, 10) === format(searchDate, 'yyyy-MM-dd'))
        : savedEntries;

    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sortedCustomers = customers
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.customer_code.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const codeA = parseInt(a.customer_code.replace(/\D/g, '')) || 0;
            const codeB = parseInt(b.customer_code.replace(/\D/g, '')) || 0;
            return codeA - codeB;
        });

    const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Find all number inputs in the ledger box
            const ledgerBox = e.currentTarget.closest('[role="region"]'); // Using container if needed or just global
            const inputs = document.querySelectorAll('.ledger-input');
            const nextInput = inputs[index + 1] as HTMLInputElement;
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
                nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-1 md:px-0">
            {/* Header / Cover */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Buuga Maalinlaha</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-md ml-1">
                        Record and manage daily product entries, attendance, and notes for all customers in one centralized location.
                    </p>
                </div>
                
                <div className="relative z-10 flex gap-3 self-start md:self-center">
                    <Button
                        variant={viewMode === 'edit' ? 'default' : 'outline'}
                        onClick={() => setViewMode('edit')}
                        className={`h-11 rounded-xl px-5 font-black uppercase tracking-wider text-xs transition-all ${viewMode === 'edit' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5' : 'border-border/60 bg-background/50 backdrop-blur-sm text-foreground hover:bg-accent'}`}
                    >
                        <Plus className="w-4 h-4 mr-2 text-current opacity-80" />
                        New Entry
                    </Button>
                    <Button
                        variant={viewMode === 'details' ? 'default' : 'outline'}
                        onClick={() => setViewMode('details')}
                        className={`h-11 rounded-xl px-5 font-black uppercase tracking-wider text-xs transition-all ${viewMode === 'details' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5' : 'border-border/60 bg-background/50 backdrop-blur-sm text-foreground hover:bg-accent'}`}
                    >
                        <FileText className="w-4 h-4 mr-2 text-current opacity-80" />
                        History <span className="ml-1.5 opacity-70">({savedEntries.length})</span>
                    </Button>
                </div>
            </div>

            {viewMode === 'edit' ? (
                <>
                {/* TRUE FULLSCREEN OVERLAY — covers sidebar + everything */}
                {isFullScreen && (
                    <div className="fixed inset-0 z-[9999] bg-background flex flex-col animate-in fade-in duration-150">
                        {/* Fullscreen Top Bar */}
                        <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-card/90 backdrop-blur-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <BookOpen className="w-4 h-4 text-primary shrink-0" />
                                <span className="font-black text-sm uppercase tracking-tight truncate text-foreground">{format(date, 'MMM dd, yyyy')}</span>
                                {totalKg > 0 && <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">{Math.round(totalKg)} KG</span>}
                                {totalVip > 0 && <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">{totalVip} VIP</span>}
                                {editingDate && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-bold border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 shrink-0">
                                                <CalendarIcon className="w-3 h-3 mr-1" />
                                                Change Date
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-popover border-border shadow-xl z-[10000]">
                                            <Calendar mode="single" selected={date} onSelect={(newDate) => newDate && handleDateChange(newDate)} className="rounded-md border-0" />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {editingDate && (
                                    <Button variant="ghost" size="sm" onClick={() => { setEntries({}); setEditingDate(null); setDate(new Date()); }} className="h-8 px-3 text-[10px] font-bold uppercase text-muted-foreground">Cancel</Button>
                                )}
                                <Button onClick={handleSave} disabled={saving || totalKg === 0} size="sm" className="h-8 px-4 text-[10px] font-black uppercase bg-primary text-primary-foreground shadow-md">
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                                    {editingDate ? 'Update' : 'Save'}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Search bar */}
                        <div className="shrink-0 px-3 py-2 border-b border-border bg-card/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10 bg-background border-input focus:border-primary shadow-sm w-full" autoFocus />
                            </div>
                        </div>

                        {/* Scrollable customer table — fills all remaining space */}
                        <div className="flex-1 overflow-hidden relative">
                            <div className="h-full bg-[#fcf8f1] dark:bg-slate-900 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {/* Vertical Ledger Margin Line */}
                                <div className="absolute left-[50px] md:left-[70px] top-0 bottom-0 w-[1px] bg-red-400 dark:bg-red-900/50 pointer-events-none z-20" />
                                {/* Sticky col headers */}
                                <div className="sticky top-0 z-30 grid grid-cols-12 px-2 md:px-4 py-2 bg-[#f4ece0] dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-700 shadow-sm">
                                    <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">ID</div>
                                    <div className="col-span-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter pl-4">Customer Name</div>
                                    <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter text-center">Status</div>
                                    <div className="col-span-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter text-right">KG</div>
                                </div>
                                <div className="divide-y divide-blue-200/30 dark:divide-slate-800/50">
                                    {sortedCustomers.map((customer, index) => (
                                        <div key={customer.id} className="grid grid-cols-12 items-center px-2 md:px-4 py-1.5 transition-colors hover:bg-blue-100/20 dark:hover:bg-slate-800/30 group border-b border-blue-50/50 dark:border-slate-800/30 last:border-0">
                                            <div className="col-span-2 flex items-center justify-start">
                                                <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">#{customer.customer_code}</span>
                                            </div>
                                            <div className="col-span-5 flex flex-col justify-center pl-4 border-l border-red-200/50 dark:border-red-900/30">
                                                <div className="relative inline-flex items-center gap-1.5 w-fit max-w-full">
                                                    <span className="font-bold text-[11px] md:text-sm text-slate-700 dark:text-slate-300 uppercase truncate">{customer.name}</span>
                                                    {entries[customer.id]?.kg > 0 && (
                                                        processedCustomerIds.has(customer.id) ? (
                                                            <span title="Processed in Buuga Maqalka" className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black leading-none">✓</span>
                                                        ) : (
                                                            <span title="Not yet in Buuga Maqalka" className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black leading-none animate-pulse">!</span>
                                                        )
                                                    )}
                                                    <div className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-blue-200/50 dark:bg-slate-700 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center gap-1.5 px-1">
                                                <button onClick={() => setEntries({ ...entries, [customer.id]: { kg: entries[customer.id]?.kg || 0, note: entries[customer.id]?.note || '', present: !(entries[customer.id]?.present ?? true) } })} className={`h-5 w-5 md:h-6 md:w-6 rounded flex items-center justify-center text-[10px] md:text-[11px] font-black transition-colors border ${entries[customer.id]?.present !== false ? 'bg-green-100/50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400' : 'bg-red-100/50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'}`}>
                                                    {entries[customer.id]?.present !== false ? 'P' : 'A'}
                                                </button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" className={`h-5 w-5 md:h-6 md:w-6 p-0 rounded-md hover:bg-blue-100 dark:hover:bg-slate-800 ${entries[customer.id]?.note ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 dark:text-slate-600'}`}>
                                                            <MessageSquare className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-56 p-2 bg-popover border-border shadow-xl rounded-xl z-[10000]">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium text-xs text-muted-foreground leading-none">Note for {customer.name}</h4>
                                                            <Input placeholder="Add a remark..." value={entries[customer.id]?.note || ''} onChange={(e) => setEntries({ ...entries, [customer.id]: { kg: entries[customer.id]?.kg || 0, present: entries[customer.id]?.present ?? true, note: e.target.value } })} className="h-8 text-xs bg-background border-input focus-visible:ring-1 focus-visible:ring-primary shadow-none" autoFocus />
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="col-span-3 flex items-center justify-end gap-1">
                                                <div className="flex items-center justify-end gap-1 relative w-full">
                                                    {(() => {
                                                        const vipInfo = getVipInfo(entries[customer.id]?.note);
                                                        return vipInfo ? (
                                                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-yellow-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] border border-yellow-200 whitespace-nowrap animate-pulse">
                                                                {vipInfo.text}
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                    <Input type="number" step="1" placeholder="0" inputMode="decimal" value={entries[customer.id]?.kg || ''} disabled={entries[customer.id]?.present === false} onChange={(e) => setEntries({ ...entries, [customer.id]: { present: entries[customer.id]?.present ?? true, note: entries[customer.id]?.note || '', kg: parseInt(e.target.value, 10) || 0 } })} onKeyDown={(e) => handleKeyPress(e, index)} className={`ledger-input h-7 w-16 md:w-20 text-right font-black text-sm md:text-base border-0 border-b border-transparent rounded-none bg-transparent transition-all px-1 focus-visible:ring-0 shadow-none hover:border-blue-300 ${entries[customer.id]?.kg > 0 ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10' : 'text-slate-400 dark:text-slate-500'} ${entries[customer.id]?.present === false ? 'opacity-50' : ''}`} />
                                                </div>
                                                {(entries[customer.id]?.kg > 0 || entries[customer.id]?.present === false || entries[customer.id]?.note) && (
                                                    <Button variant="ghost" size="sm" onClick={() => { const n = { ...entries }; delete n[customer.id]; setEntries(n); }} className="h-8 w-8 md:h-6 md:w-6 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NORMAL CARD (shown when not fullscreen) */}
                <Card className="glass-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    {editingDate ? 'Updating' : 'New'} Entry
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    {format(date, 'MMMM dd, yyyy')}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            Select Date
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-popover border-border shadow-xl">
                                        <Calendar mode="single" selected={date} onSelect={(newDate) => newDate && handleDateChange(newDate)} className="rounded-md border-0" />
                                    </PopoverContent>
                                </Popover>
                                <AddCustomerDialog onSuccess={loadInit} nextId={(Math.max(0, ...customers.map(c => parseInt(c.customer_code.replace(/\D/g, '')) || 0)) + 1).toString()} />
                                <Button variant="outline" size="icon" onClick={() => setIsFullScreen(true)} className="h-10 w-10 text-muted-foreground hover:text-primary border-border" title="Enter Full Screen">
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Search bar */}
                        <div className="p-3 border-b border-border bg-card/50 flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10 bg-background border-input focus:border-primary shadow-sm" />
                            </div>
                        </div>

                        {customers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-primary" /></div>
                                <p className="font-medium">No customers found</p>
                                <p className="text-sm mt-1">Add a new customer to start recording entries</p>
                            </div>
                        ) : (
                            <div className="bg-[#fcf8f1] dark:bg-slate-900 relative overflow-hidden rounded-sm border border-slate-300 dark:border-slate-800 shadow-inner pb-24 md:pb-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent h-[60vh] md:h-[480px]">
                                <div className="absolute left-[50px] md:left-[70px] top-0 bottom-0 w-[1px] bg-red-400 dark:bg-red-900/50 pointer-events-none z-20" />
                                <div className="sticky top-0 z-30 grid grid-cols-12 px-2 md:px-4 py-2 bg-[#f4ece0] dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-700 shadow-sm">
                                    <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">ID</div>
                                    <div className="col-span-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter pl-4">Customer Name</div>
                                    <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter text-center">Status</div>
                                    <div className="col-span-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter text-right">KG</div>
                                </div>
                                <div className="divide-y divide-blue-200/30 dark:divide-slate-800/50">
                                    {sortedCustomers.map((customer, index) => (
                                        <div key={customer.id} className="grid grid-cols-12 items-center px-2 md:px-4 py-1 transition-colors hover:bg-blue-100/20 dark:hover:bg-slate-800/30 group border-b border-blue-50/50 dark:border-slate-800/30 last:border-0 relative">
                                            <div className="col-span-2 flex items-center justify-start">
                                                <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">#{customer.customer_code}</span>
                                            </div>
                                            <div className="col-span-5 flex flex-col justify-center pl-4 border-l border-red-200/50 dark:border-red-900/30">
                                                <div className="relative inline-flex items-center gap-1.5 w-fit max-w-full">
                                                    <span className="font-bold text-[11px] md:text-sm text-slate-700 dark:text-slate-300 uppercase truncate">{customer.name}</span>
                                                    {entries[customer.id]?.kg > 0 && (
                                                        processedCustomerIds.has(customer.id) ? (
                                                            <span title="Processed in Buuga Maqalka" className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black leading-none">✓</span>
                                                        ) : (
                                                            <span title="Not yet in Buuga Maqalka" className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black leading-none animate-pulse">!</span>
                                                        )
                                                    )}
                                                    <div className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-blue-200/50 dark:bg-slate-700 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center gap-1.5 px-1">
                                                <button onClick={() => setEntries({ ...entries, [customer.id]: { kg: entries[customer.id]?.kg || 0, note: entries[customer.id]?.note || '', present: !(entries[customer.id]?.present ?? true) } })} className={`h-5 w-5 md:h-6 md:w-6 rounded flex items-center justify-center text-[10px] md:text-[11px] font-black transition-colors border ${entries[customer.id]?.present !== false ? 'bg-green-100/50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400' : 'bg-red-100/50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'}`}>
                                                    {entries[customer.id]?.present !== false ? 'P' : 'A'}
                                                </button>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" className={`h-5 w-5 md:h-6 md:w-6 p-0 rounded-md hover:bg-blue-100 dark:hover:bg-slate-800 ${entries[customer.id]?.note ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 dark:text-slate-600'}`}>
                                                            <MessageSquare className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-56 p-2 bg-popover border-border shadow-xl rounded-xl z-[10000]">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium text-xs text-muted-foreground leading-none">Note for {customer.name}</h4>
                                                            <Input placeholder="Add a remark..." value={entries[customer.id]?.note || ''} onChange={(e) => setEntries({ ...entries, [customer.id]: { kg: entries[customer.id]?.kg || 0, present: entries[customer.id]?.present ?? true, note: e.target.value } })} className="h-8 text-xs bg-background border-input focus-visible:ring-1 focus-visible:ring-primary shadow-none" autoFocus />
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="col-span-3 flex items-center justify-end gap-1">
                                                <div className="flex items-center justify-end gap-1 relative w-full">
                                                    {(() => {
                                                        const vipInfo = getVipInfo(entries[customer.id]?.note);
                                                        return vipInfo ? (
                                                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-yellow-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] border border-yellow-200 whitespace-nowrap animate-pulse">
                                                                {vipInfo.text}
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                    <Input type="number" step="1" placeholder="0" inputMode="decimal" value={entries[customer.id]?.kg || ''} disabled={entries[customer.id]?.present === false} onChange={(e) => setEntries({ ...entries, [customer.id]: { present: entries[customer.id]?.present ?? true, note: entries[customer.id]?.note || '', kg: parseInt(e.target.value, 10) || 0 } })} onKeyDown={(e) => handleKeyPress(e, index)} className={`ledger-input h-7 w-16 md:w-20 text-right font-black text-sm md:text-base border-0 border-b border-transparent rounded-none bg-transparent transition-all px-1 focus-visible:ring-0 shadow-none hover:border-blue-300 ${entries[customer.id]?.kg > 0 ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10' : 'text-slate-400 dark:text-slate-500'} ${entries[customer.id]?.present === false ? 'opacity-50' : ''}`} />
                                                </div>
                                                {(entries[customer.id]?.kg > 0 || entries[customer.id]?.present === false || entries[customer.id]?.note) && (
                                                    <Button variant="ghost" size="sm" onClick={() => { const n = { ...entries }; delete n[customer.id]; setEntries(n); }} className="h-8 w-8 md:h-6 md:w-6 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Totals Section */}
                        <div className="mt-2 pt-2 border-t-[2px] border-double border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-sm p-2 shadow-inner">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                                <div className="flex items-center gap-2 bg-background dark:bg-slate-900 px-2 py-1.5 rounded-sm border border-primary/10 shadow-sm w-full md:w-auto">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10"><Package className="h-4 w-4 text-primary" /></div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground leading-none mb-0.5">Summary</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black text-primary tracking-tighter tabular-nums">{Math.round(totalKg)}</span>
                                            <span className="text-[9px] font-black text-primary uppercase opacity-60">Total KG</span>
                                            {totalVip > 0 && (
                                                <>
                                                    <span className="text-xl font-black text-amber-600 tracking-tighter tabular-nums ml-2">{totalVip}</span>
                                                    <span className="text-[9px] font-black text-amber-600 uppercase opacity-60">VIP</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    {editingDate && (
                                        <Button variant="outline" size="sm" onClick={() => { setEntries({}); setEditingDate(null); setDate(new Date()); }} className="h-8 md:h-10 px-4 border border-border text-muted-foreground font-bold uppercase tracking-tight text-[10px] hover:bg-muted/50">Cancel</Button>
                                    )}
                                    <Button onClick={handleSave} disabled={saving || totalKg === 0} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-tight text-[10px] h-8 md:h-10 flex-1 md:flex-none md:px-8 shadow-md shadow-primary/20 active:translate-y-0.5 transition-all">
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="mr-2 h-3 w-3" />}
                                        {editingDate ? 'Update' : 'Save Entry'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile sticky save bar */}
                        {!saving && totalKg > 0 && viewMode === 'edit' && (
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border md:hidden z-50 animate-in slide-in-from-bottom duration-500">
                                <Button onClick={handleSave} className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30">
                                    <div className="flex items-center justify-between w-full px-4">
                                        <div className="text-left">
                                            <p className="text-[10px] opacity-60 leading-none mb-1">Total Quantity</p>
                                            <p className="text-2xl leading-none">{Math.round(totalKg)} KG</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
                                            <Save className="w-5 h-5" />
                                            <span>Save</span>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </>
            ) : (
                <>
                {/* ── HISTORY FOCUS OVERLAY ── */}
                {focusedEntry && (() => {
                    const entry = focusedEntry;
                    const ledgerSet = historyLedgerStatus[entry.date];
                    const withKg = entry.items.filter(i => i.kg > 0);
                    const processedCount = ledgerSet ? withKg.filter(i => ledgerSet.has(i.customer_id)).length : 0;
                    const totalWithKg = withKg.length;
                    const allProcessed = ledgerSet && processedCount === totalWithKg && totalWithKg > 0;
                    return (
                        <div className="fixed inset-0 z-[9999] bg-background flex flex-col animate-in fade-in duration-150">
                            {/* Top bar */}
                            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/90 backdrop-blur-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Buuga Maalinlaha</p>
                                        <p className="font-black text-base text-foreground tracking-tight leading-none">{format(new Date(entry.date), 'MMMM dd, yyyy')}</p>
                                    </div>
                                    {ledgerSet && (
                                        allProcessed ? (
                                            <span className="hidden sm:flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-emerald-500/20">✓ All in Maqalka</span>
                                        ) : (
                                            <span className="hidden sm:flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-amber-500/20 animate-pulse">⚠ {processedCount}/{totalWithKg} Maqalka</span>
                                        )
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-[10px] font-bold uppercase border-border text-foreground"
                                        onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); setFocusedEntry(null); }}
                                    >
                                        <Edit className="w-3 h-3 mr-1" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setFocusedEntry(null)} className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full">
                                        <span className="text-lg font-bold leading-none">✕</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="shrink-0 flex items-center gap-4 px-4 py-2.5 border-b border-border bg-muted/20">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="font-bold">{entry.items.length}</span> customers
                                </div>
                                <div className="h-3 w-px bg-border" />
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black text-primary text-sm">{Math.round(entry.totalKg)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Total KG</span>
                                </div>
                                {(() => {
                                    const entryVipCount = entry.items.reduce((sum, i) => sum + (getVipInfo(i.note)?.count || 0), 0);
                                    if (entryVipCount > 0) {
                                        return (
                                            <>
                                                <div className="h-3 w-px bg-border" />
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-black text-amber-600 text-sm">{entryVipCount}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">VIP</span>
                                                </div>
                                            </>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Scrollable content — book style */}
                            <div className="flex-1 overflow-y-auto bg-[#fcf8f1] dark:bg-slate-900 relative">
                                {/* Vertical margin line */}
                                <div className="absolute left-[50px] md:left-[70px] top-0 bottom-0 w-[1px] bg-red-400 dark:bg-red-900/50 pointer-events-none z-10" />
                                {/* Sticky header */}
                                <div className="sticky top-0 z-20 grid grid-cols-12 px-3 md:px-5 py-2 bg-[#f4ece0] dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-700 shadow-sm">
                                    <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">ID</div>
                                    <div className="col-span-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter pl-4">Customer Name</div>
                                    <div className="col-span-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter text-right">KG / Status</div>
                                </div>
                                <div className="divide-y divide-blue-200/30 dark:divide-slate-800/50">
                                    {entry.items.map((item) => {
                                        const isProcessed = ledgerSet ? ledgerSet.has(item.customer_id) : null;
                                        return (
                                            <div key={item.customer_id} className="grid grid-cols-12 items-center px-3 md:px-5 py-2 hover:bg-blue-100/20 dark:hover:bg-slate-800/30">
                                                <div className="col-span-2">
                                                    <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">#{item.customer?.customer_code || '—'}</span>
                                                </div>
                                                <div className="col-span-6 pl-4 border-l border-red-200/50 dark:border-red-900/30 flex items-center gap-1.5">
                                                    <span className="font-bold text-[11px] md:text-sm text-slate-700 dark:text-slate-300 uppercase truncate">{item.customer?.name || 'Unknown'}</span>
                                                    {item.kg > 0 && isProcessed !== null && (
                                                        isProcessed ? (
                                                            <span title="In Buuga Maqalka" className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black">✓</span>
                                                        ) : (
                                                            <span title="Not in Buuga Maqalka yet" className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black animate-pulse">!</span>
                                                        )
                                                    )}
                                                </div>
                                                <div className="col-span-4 text-right">
                                                    {item.present === false ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase">Absent</span>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {(() => {
                                                                const vipInfo = getVipInfo(item.note);
                                                                return vipInfo ? (
                                                                    <span className="font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm text-[10px] md:text-xs uppercase tracking-widest inline-block whitespace-nowrap shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                                                                        {vipInfo.text}
                                                                    </span>
                                                                ) : null;
                                                            })()}
                                                            <span className="font-black text-primary text-sm md:text-base">{Math.round(item.kg)} <span className="text-[9px] opacity-60">KG</span></span>
                                                        </div>
                                                    )}
                                                    {item.note && !item.note.toLowerCase().trim().match(/^\d*\s*vip$/i) && <div className="text-[9px] text-muted-foreground truncate max-w-[90px] ml-auto mt-0.5">{item.note}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Footer total */}
                                <div className="sticky bottom-0 bg-[#f4ece0]/95 dark:bg-slate-950/95 border-t-2 border-double border-primary/20 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 py-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Quantity</span>
                                    <div className="flex items-center gap-4">
                                        {(() => {
                                            const entryVipCount = entry.items.reduce((sum, i) => sum + (getVipInfo(i.note)?.count || 0), 0);
                                            return entryVipCount > 0 ? (
                                                <span className="font-black text-amber-600 text-xl">{entryVipCount} <span className="text-xs opacity-60">VIP</span></span>
                                            ) : null;
                                        })()}
                                        <span className="font-black text-primary text-xl">{Math.round(entry.totalKg)} <span className="text-xs opacity-60">KG</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <SecurityVerificationDialog
                    isOpen={!!deleteConfirmDate}
                    onOpenChange={(open) => {
                        if (!open) setDeleteConfirmDate(null);
                    }}
                    onConfirm={handleDeleteEntry}
                    title="Move to Trash"
                    description={`Move the entry for ${deleteConfirmDate ? format(new Date(deleteConfirmDate), 'MMMM dd, yyyy') : ''} to the Recycle Bin?`}
                    isProcessing={isDeleting}
                />

                <Card className="glass-card">
                    <CardHeader className="border-b border-border">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Saved Entries
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {savedEntries.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportBackup}
                                        className="h-8 px-3 text-[11px] font-bold border-border text-muted-foreground hover:text-primary hover:border-primary/40 gap-1.5"
                                        title="Download full backup as PDF"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Backup
                                    </Button>
                                )}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="border-border text-primary hover:bg-accent hover:text-accent-foreground">
                                            <Search className="mr-2 h-4 w-4" />
                                            {searchDate ? format(searchDate, 'MMM dd') : 'Filter Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[100] bg-popover border-border shadow-lg">
                                        <Calendar
                                            mode="single"
                                            selected={searchDate}
                                            onSelect={(newDate) => { setSearchDate(newDate); setVisibleEntriesCount(10); }}
                                        />
                                        <div className="p-2 border-t border-border">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setSearchDate(undefined); setVisibleEntriesCount(10); }}
                                                className="w-full text-muted-foreground hover:text-primary"
                                            >
                                                Clear Filter
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {sortedEntries.length === 0 ? (
                            <div className="text-center py-16 bg-muted/20">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-medium text-foreground">No entries found</h3>
                                        <p className="text-muted-foreground text-sm mt-1">
                                    {searchDate ? 'Try selecting a different date' : 'Your saved entries will appear here'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-border">
                                {sortedEntries.slice(0, visibleEntriesCount).map((entry) => (
                                    <div
                                        key={entry.date}
                                        className="group transition-all hover:bg-muted/30"
                                        onClick={async () => {
                                            // Fetch ledger status for this date if not already cached
                                            if (!historyLedgerStatus[entry.date]) {
                                                try {
                                                    const res = await fetch(`/api/ledger-by-date?date=${entry.date}`);
                                                    if (res.ok) {
                                                        const ids: string[] = await res.json();
                                                        setHistoryLedgerStatus(prev => ({ ...prev, [entry.date]: new Set(ids) }));
                                                    }
                                                } catch (e) {
                                                    console.error('Failed to fetch history ledger status', e);
                                                }
                                            }
                                            setFocusedEntry(entry);
                                        }}
                                    >
                                        {/* Entry Header - Clickable */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer">
                                                <div className="flex items-center gap-3 md:gap-4 flex-1">
                                                    <div className={`p-2 rounded-lg transition-colors shrink-0 ${expandedEntry === entry.date ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-card'}`}>
                                                        {expandedEntry === entry.date ? (
                                                            <ChevronDown className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-foreground text-base md:text-lg">
                                                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-1 md:gap-3 text-xs md:text-sm text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" />
                                                                {entry.items.length} <span className="hidden md:inline">customers</span>
                                                            </span>
                                                            <span className="hidden md:inline">•</span>
                                                            <span className="font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-2 md:ml-0">
                                                                {Math.round(entry.totalKg)} KG
                                                            </span>
                                                            {/* Ledger status summary badge */}
                                                            {historyLedgerStatus[entry.date] ? (() => {
                                                                const withKg = entry.items.filter(i => i.kg > 0);
                                                                const processed = withKg.filter(i => historyLedgerStatus[entry.date].has(i.customer_id)).length;
                                                                const total = withKg.length;
                                                                return processed === total && total > 0 ? (
                                                                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border border-emerald-500/20">
                                                                        ✓ All in Maqalka
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border border-amber-500/20 animate-pulse">
                                                                        ⚠ {processed}/{total} Maqalka
                                                                    </span>
                                                                );
                                                            })() : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            <div className="flex items-center gap-2 mt-3 md:mt-0 border-t border-border/50 pt-3 md:border-0 md:pt-0" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditEntry(entry);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 md:flex-none text-primary border-primary/20 hover:bg-primary/10 h-10 md:h-8"
                                                >
                                                    <Edit className="w-4 h-4 mr-2 md:mr-1" /> <span>Edit</span>
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmDate(entry.date);
                                                    }}
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex-1 md:flex-none h-10 md:h-8"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2 md:mr-1" /> <span className="hidden md:inline">Move to Trash</span><span className="md:hidden">Trash</span>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedEntry === entry.date && (
                                            <div className="bg-muted/10 p-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                                                <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                                                    <div className="divide-y divide-border">
                                                        {entry.items.map((item) => {
                                                            const ledgerSet = historyLedgerStatus[entry.date];
                                                            const isProcessed = ledgerSet ? ledgerSet.has(item.customer_id) : null;
                                                            return (
                                                            <div key={item.customer_id} className={`flex items-center justify-between p-3 hover:bg-muted/30 ${isProcessed === true ? 'bg-emerald-500/3' : isProcessed === false && item.kg > 0 ? 'bg-amber-500/3' : ''}`}>
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-border/50 shrink-0">
                                                                        <AvatarImage src={item.customer?.avatar_url || ''} alt={item.customer?.name || 'Customer'} />
                                                                        <AvatarFallback className={`${
                                                                            isProcessed === true ? 'bg-emerald-500/10 text-emerald-600' :
                                                                            isProcessed === false && item.kg > 0 ? 'bg-amber-500/10 text-amber-600' :
                                                                            item.customer?.gender === 'Male' ? 'bg-blue-500/10 text-blue-500' :
                                                                            item.customer?.gender === 'Female' ? 'bg-pink-500/10 text-pink-500' :
                                                                            'bg-slate-500/10 text-slate-500'
                                                                        }`}>
                                                                            <User className="h-4 w-4" />
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col overflow-hidden">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="font-semibold text-sm text-foreground truncate">{item.customer?.name || 'Unknown'}</span>
                                                                            {/* Per-customer ledger status in history */}
                                                                            {item.kg > 0 && isProcessed !== null && (
                                                                                isProcessed ? (
                                                                                    <span title="In Buuga Maqalka" className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black">✓</span>
                                                                                ) : (
                                                                                    <span title="Not in Buuga Maqalka yet" className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black animate-pulse">!</span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-muted-foreground font-mono">#{item.customer?.customer_code || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right shrink-0 ml-2">
                                                                    {item.present === false ? (
                                                                        <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wider">Absent</span>
                                                                    ) : (
                                                                        <span className="font-black text-primary text-base md:text-lg">{Math.round(item.kg)} <span className="text-[10px] opacity-60">KG</span></span>
                                                                    )}
                                                                    {item.note && (
                                                                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[100px] md:max-w-[150px]">{item.note}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            );
                                                        })}
                                                        
                                                        {/* Summary Footer */}
                                                        <div className="bg-primary/5 p-4 flex items-center justify-between border-t-2 border-primary/10">
                                                            <span className="font-bold text-sm text-foreground uppercase tracking-wider">Total Quantity</span>
                                                            <span className="font-black text-primary text-xl">{Math.round(entry.totalKg)} <span className="text-xs opacity-60">KG</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {sortedEntries.length > visibleEntriesCount && (
                                <div className="p-4 border-t border-border flex justify-center bg-muted/5">
                                    <Button
                                        onClick={() => setVisibleEntriesCount(prev => prev + 10)}
                                        variant="outline"
                                        className="w-full max-w-xs h-10 font-black text-xs uppercase tracking-wider border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30"
                                    >
                                        View More (10x)
                                    </Button>
                                </div>
                            )}
                            </>
                        )}
                    </CardContent>
                </Card>
                </>
            )}
        </div>
    );
}

export default function DailyBookPage() {
    return (
        <DailyBookErrorBoundary>
            <DailyBookPageInner />
        </DailyBookErrorBoundary>
    );
}

