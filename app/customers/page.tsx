'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState, useMemo } from 'react';
import { AddCustomerDialog } from '@/components/add-customer-dialog';
import { toast } from 'sonner';
import { Phone, Search, ChevronRight, Users, Star, Filter, Check, Loader2, Clock, Globe, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import useSWR from 'swr';

const fetcher = async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dadwork_session_token') || '' : '';
    const res = await fetch(url, { headers: token ? { 'x-session-token': token } : {} });
    if (!res.ok) throw new Error('Fetch error');
    return res.json();
};

interface Customer {
    id: string;
    name: string;
    customer_code: string;
    gender?: string;
    phone?: string;
    avatar_url?: string;
}

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [filterType, setFilterType] = useState<string>('default');
    const [visibleCount, setVisibleCount] = useState(20);
    const [rankingMode, setRankingMode] = useState<'maqalka' | 'lacagta'>('maqalka');
    const [selectedMaqalPair, setSelectedMaqalPair] = useState<string>('latest');
    const [showAllTimePct, setShowAllTimePct] = useState<Record<string, boolean>>({});
    const [maqalSearch, setMaqalSearch] = useState('');

    const { data: maqalPairs } = useSWR<any[]>('/api/maqal-pairs', fetcher, { revalidateOnFocus: false, dedupingInterval: 120000 });

    // Latest pair = latest pair with ≥20 customers who paid (the "qualified" latest)
    const latestPair = maqalPairs?.find(pair => parseInt(pair.payment_count) >= 20) || null;

    // Debounce search input
    useEffect(() => {
        if (searchTerm === debouncedSearch) return;
        setIsSearching(true);
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearch]);

    // Helper to format pair date strings like "2026-06-28" or ISO → "28 Jun"
    const formatPairDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            // Handle both "2026-06-28" and "2026-06-28T00:00:00.000Z"
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
            }
        } catch {}
        // Fallback: split by '-'
        const [, m, dd] = dateStr.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${parseInt(dd)} ${months[parseInt(m) - 1]}`;
    };

    // Extract day number from a date string for search matching
    const getDayFromDate = (dateStr: string): string => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return String(d.getUTCDate());
        } catch {}
        const parts = dateStr.split('-');
        return parts.length >= 3 ? String(parseInt(parts[2])) : '';
    };

    const filteredPairs = maqalPairs?.filter(pair => {
        if (!maqalSearch) return true;
        const q = maqalSearch.toLowerCase().trim();
        const formatted = `${formatPairDate(pair.date1)} & ${formatPairDate(pair.date2)}`.toLowerCase();
        const day1 = getDayFromDate(pair.date1);
        const day2 = getDayFromDate(pair.date2);
        // Match against formatted text, or raw day numbers
        return formatted.includes(q) || day1 === q || day2 === q || day1.startsWith(q) || day2.startsWith(q);
    });

    // ⚡ SWR: Instant cache — no more spinner every time you visit this page
    // When 'latest' is selected, use the qualified latest pair (≥20 payments)
    const customersUrl = (() => {
        let baseUrl = '/api/customers';
        if (selectedMaqalPair === 'latest' && latestPair) {
            baseUrl += `?maqal_d1=${latestPair.date1}&maqal_d2=${latestPair.date2}`;
        } else if (selectedMaqalPair && selectedMaqalPair.includes('|')) {
            baseUrl += `?maqal_d1=${selectedMaqalPair.split('|')[0]}&maqal_d2=${selectedMaqalPair.split('|')[1]}`;
        }
        
        // Pass the max date to exclude "waiting" maqals from All-Time calculations
        if (latestPair) {
            const separator = baseUrl.includes('?') ? '&' : '?';
            baseUrl += `${separator}max_all_time_date=${latestPair.date1}`;
        }
        
        return baseUrl;
    })();

    const { data: customersData, isLoading, mutate: mutateCustomers } = useSWR<Customer[]>(
        customersUrl,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 }
    );
    const customers = customersData || [];

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Failed to parse current user session', e);
            }
        }
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(debouncedSearch.toLowerCase())
    ).sort((a, b) => {
        if (filterType === 'most_paid') {
            return ((b as any).total_paid || 0) - ((a as any).total_paid || 0);
        } else if (filterType === 'least_paid') {
            return ((a as any).total_paid || 0) - ((b as any).total_paid || 0);
        } else if (filterType === 'most_kg') {
            const avgA = (a as any).total_books_count ? ((a as any).total_kg || 0) / (a as any).total_books_count : 0;
            const avgB = (b as any).total_books_count ? ((b as any).total_kg || 0) / (b as any).total_books_count : 0;
            return avgB - avgA;
        } else if (filterType === 'least_kg') {
            const avgA = (a as any).total_books_count ? ((a as any).total_kg || 0) / (a as any).total_books_count : 0;
            const avgB = (b as any).total_books_count ? ((b as any).total_kg || 0) / (b as any).total_books_count : 0;
            return avgA - avgB;
        } else if (filterType === 'best_maqal' || filterType === 'worst_maqal' || filterType === 'best_lacag' || filterType === 'worst_lacag') {
            const getPct = (c: any) => {
                if (selectedMaqalPair === 'all_time' || showAllTimePct[c.id]) return c.all_time_maqal_pct ?? -1;
                return c.selected_maqal_pct ?? c.latest_maqal_pct ?? -1;
            };
            const pctA = getPct(a);
            const pctB = getPct(b);
            const debtA = (a as any).current_balance ?? 0;
            const debtB = (b as any).current_balance ?? 0;

            if (filterType === 'best_maqal') return pctB - pctA;
            if (filterType === 'worst_maqal') return pctA - pctB;
            if (filterType === 'best_lacag') return debtA - debtB;
            if (filterType === 'worst_lacag') return debtB - debtA;
        }

        // default behavior
        const assignedIds = currentUser?.assigned_customer_ids || [];
        const isAAssigned = assignedIds.includes(a.id);
        const isBAssigned = assignedIds.includes(b.id);

        if (isAAssigned && !isBAssigned) return -1;
        if (!isAAssigned && isBAssigned) return 1;

        const idA = parseInt(a.customer_code.replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(b.customer_code.replace(/\D/g, ''), 10) || 0;
        return idA - idB;
    });

    return (
        <div className="space-y-4 max-w-2xl mx-auto px-1 md:px-0" suppressHydrationWarning>
            {/* Header / Cover */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-6">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner">
                            <Users className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Customers</h2>
                        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full ml-2">
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : customers.length}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-md ml-1">
                        Manage all registered clients, review balances, and find individuals in your ledger instantly.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-3 self-stretch md:self-center">
                    <div className="relative flex-1 sm:w-[220px]">
                        {isSearching
                            ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                            : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        }
                        <Input
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-11 bg-background/50 backdrop-blur-sm border-border/60 focus:border-primary transition-colors w-full rounded-xl"
                        />
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={`h-11 px-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${filterType !== 'default' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background/50 text-foreground border-border/60 hover:bg-muted/50'}`}>
                                    <Filter className="w-4 h-4" />
                                    <span className="text-xs font-bold hidden sm:inline-block">Filter</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-xl">
                                <DropdownMenuItem onClick={() => setFilterType('default')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'default' ? 'bg-primary/10 text-primary' : ''}`}>
                                    ⚙️ Caadi (Default) {filterType === 'default' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl text-emerald-500 focus:text-emerald-600 focus:bg-emerald-500/10">
                                        ⭐ Macaamilka Ugu Fiican
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="w-48 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-xl">
                                            <DropdownMenuItem onClick={() => setFilterType('best_lacag')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'best_lacag' ? 'bg-emerald-500/10 text-emerald-500' : ''}`}>
                                                Lacagta {filterType === 'best_lacag' && <Check className="w-3 h-3 ml-auto" />}
                                            </DropdownMenuItem>
                                            
                                            <div className="px-2 pt-2 pb-1">
                                                <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Maqalka</div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search dates (e.g. 24)..." 
                                                    value={maqalSearch}
                                                    onChange={(e) => setMaqalSearch(e.target.value)}
                                                    className="w-full text-xs bg-muted/50 border border-border/50 rounded-md p-1.5 focus:ring-1 focus:ring-primary/50 text-foreground"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto overflow-x-hidden p-1 space-y-0.5">
                                                {(!maqalSearch || "latest maqal".includes(maqalSearch.toLowerCase())) && (
                                                    <DropdownMenuItem onClick={() => { 
                                                        setFilterType('best_maqal'); 
                                                        setSelectedMaqalPair('latest');
                                                    }} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${(filterType === 'best_maqal' && selectedMaqalPair === 'latest') ? 'bg-primary/10 text-primary' : ''}`}>
                                                        ✅ Latest Maqal {latestPair && <span className="ml-1 text-[9px] opacity-70">({formatPairDate(latestPair.date1)} & {formatPairDate(latestPair.date2)})</span>}
                                                        {(filterType === 'best_maqal' && selectedMaqalPair === 'latest') && <Check className="w-3 h-3 ml-auto" />}
                                                    </DropdownMenuItem>
                                                )}
                                                {(!maqalSearch || "all time".includes(maqalSearch.toLowerCase())) && (
                                                    <DropdownMenuItem onClick={() => { setFilterType('best_maqal'); setSelectedMaqalPair('all_time'); }} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${(filterType === 'best_maqal' && selectedMaqalPair === 'all_time') ? 'bg-primary/10 text-primary' : ''}`}>
                                                        All Time {(filterType === 'best_maqal' && selectedMaqalPair === 'all_time') && <Check className="w-3 h-3 ml-auto" />}
                                                    </DropdownMenuItem>
                                                )}
                                                {filteredPairs?.map(pair => {
                                                    const val = `${pair.date1}|${pair.date2}`;
                                                    const paidCount = parseInt(pair.payment_count) || 0;
                                                    const totalCount = parseInt(pair.total_customers) || 0;
                                                    const isQualified = paidCount >= 20;
                                                    return (
                                                        <DropdownMenuItem key={val} onClick={() => { setFilterType('best_maqal'); setSelectedMaqalPair(val); }} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${(filterType === 'best_maqal' && selectedMaqalPair === val) ? 'bg-primary/10 text-primary' : ''}`}>
                                                            <span className="flex items-center gap-1 flex-1 min-w-0">
                                                                {formatPairDate(pair.date1)} & {formatPairDate(pair.date2)}
                                                                {isQualified ? (
                                                                    <span className="ml-1 text-[8px] font-black px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                                                                        ✅ {paidCount}/{totalCount}
                                                                    </span>
                                                                ) : (
                                                                    <span className="ml-1 text-[8px] font-black px-1 py-0.5 rounded bg-amber-500/15 text-amber-400">
                                                                        ⏳ {paidCount}/{totalCount}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            {(filterType === 'best_maqal' && selectedMaqalPair === val) && <Check className="w-3 h-3 ml-auto shrink-0" />}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                                {maqalSearch && filteredPairs?.length === 0 && (
                                                    <div className="text-center py-3 text-[10px] font-medium text-muted-foreground">
                                                        No pairs available
                                                    </div>
                                                )}
                                            </div>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl text-destructive focus:text-destructive focus:bg-destructive/10">
                                        ⚠️ Macaamilka Ugu Liita
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="w-48 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-xl">
                                            <DropdownMenuItem onClick={() => setFilterType('worst_lacag')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'worst_lacag' ? 'bg-destructive/10 text-destructive' : ''}`}>
                                                Lacagta {filterType === 'worst_lacag' && <Check className="w-3 h-3 ml-auto" />}
                                            </DropdownMenuItem>
                                            
                                            <div className="px-2 pt-2 pb-1">
                                                <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Maqalka</div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search dates (e.g. 24)..." 
                                                    value={maqalSearch}
                                                    onChange={(e) => setMaqalSearch(e.target.value)}
                                                    className="w-full text-xs bg-muted/50 border border-border/50 rounded-md p-1.5 focus:ring-1 focus:ring-primary/50 text-foreground"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto overflow-x-hidden p-1 space-y-0.5">
                                                {(!maqalSearch || "latest maqal".includes(maqalSearch.toLowerCase())) && (
                                                    <DropdownMenuItem onClick={() => { 
                                                        setFilterType('worst_maqal'); 
                                                        setSelectedMaqalPair('latest');
                                                    }} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${(filterType === 'worst_maqal' && selectedMaqalPair === 'latest') ? 'bg-primary/10 text-primary' : ''}`}>
                                                        ✅ Latest Maqal {latestPair && <span className="ml-1 text-[9px] opacity-70">({formatPairDate(latestPair.date1)} & {formatPairDate(latestPair.date2)})</span>}
                                                        {(filterType === 'worst_maqal' && selectedMaqalPair === 'latest') && <Check className="w-3 h-3 ml-auto" />}
                                                    </DropdownMenuItem>
                                                )}
                                                {(!maqalSearch || "all time".includes(maqalSearch.toLowerCase())) && (
                                                    <DropdownMenuItem onClick={() => { setFilterType('worst_maqal'); setSelectedMaqalPair('all_time'); }} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${(filterType === 'worst_maqal' && selectedMaqalPair === 'all_time') ? 'bg-primary/10 text-primary' : ''}`}>
                                                        All Time {(filterType === 'worst_maqal' && selectedMaqalPair === 'all_time') && <Check className="w-3 h-3 ml-auto" />}
                                                    </DropdownMenuItem>
                                                )}
                                                {filteredPairs?.map(pair => {
                                                    const val = `${pair.date1}|${pair.date2}`;
                                                    const paidCount = parseInt(pair.payment_count) || 0;
                                                    const totalCount = parseInt(pair.total_customers) || 0;
                                                    const isQualified = paidCount >= 20;
                                                    return (
                                                        <DropdownMenuItem key={val} onClick={() => { setFilterType('worst_maqal'); setSelectedMaqalPair(val); }} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${(filterType === 'worst_maqal' && selectedMaqalPair === val) ? 'bg-primary/10 text-primary' : ''}`}>
                                                            <span className="flex items-center gap-1 flex-1 min-w-0">
                                                                {formatPairDate(pair.date1)} & {formatPairDate(pair.date2)}
                                                                {isQualified ? (
                                                                    <span className="ml-1 text-[8px] font-black px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                                                                        ✅ {paidCount}/{totalCount}
                                                                    </span>
                                                                ) : (
                                                                    <span className="ml-1 text-[8px] font-black px-1 py-0.5 rounded bg-amber-500/15 text-amber-400">
                                                                        ⏳ {paidCount}/{totalCount}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            {(filterType === 'worst_maqal' && selectedMaqalPair === val) && <Check className="w-3 h-3 ml-auto shrink-0" />}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                                {maqalSearch && filteredPairs?.length === 0 && (
                                                    <div className="text-center py-3 text-[10px] font-medium text-muted-foreground">
                                                        No pairs available
                                                    </div>
                                                )}
                                            </div>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuItem onClick={() => setFilterType('most_paid')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'most_paid' ? 'bg-primary/10 text-primary' : ''}`}>
                                    💰 Lacagta Ugu Badan Bixiyay {filterType === 'most_paid' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterType('least_paid')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'least_paid' ? 'bg-primary/10 text-primary' : ''}`}>
                                    💸 Lacagta Ugu Yar Bixiyay {filterType === 'least_paid' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterType('most_kg')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'most_kg' ? 'bg-primary/10 text-primary' : ''}`}>
                                    ⚖️ KG Ugu Badan {filterType === 'most_kg' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterType('least_kg')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl ${filterType === 'least_kg' ? 'bg-primary/10 text-primary' : ''}`}>
                                    🪶 KG Ugu Yar {filterType === 'least_kg' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AddCustomerDialog onSuccess={() => mutateCustomers()} />
                    </div>
                </div>
            </div>


            {/* List */}
            <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm">
                {isLoading ? (
                    <div className="divide-y divide-border/30">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-muted rounded w-1/3" />
                                    <div className="h-2.5 bg-muted/50 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                            {searchTerm ? 'No results found' : 'No customers yet'}
                        </p>
                        {!searchTerm && (
                            <div className="mt-4">
                                <AddCustomerDialog onSuccess={() => mutateCustomers()} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {filteredCustomers.slice(0, visibleCount).map((customer, index) => {
                            const isMale = customer.gender === 'Male';
                            const isFemale = customer.gender === 'Female';
                            const accentColor = isMale ? 'text-blue-400' : isFemale ? 'text-pink-400' : 'text-primary';
                            const avatarBg = isMale ? 'bg-blue-500/10 border-blue-500/30' : isFemale ? 'bg-pink-500/10 border-pink-500/30' : 'bg-primary/10 border-primary/30';

                            let performanceColor = '';
                            if (filterType === 'best' && index < 5) performanceColor = 'bg-emerald-500/10';
                            else if (filterType === 'worst' && index < 5) performanceColor = 'bg-destructive/10';

                            return (
                                <Link
                                    href={`/customers/${customer.id}`}
                                    key={customer.id}
                                    className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors cursor-pointer ${performanceColor}`}
                                >
                                    {/* Avatar */}
                                    <Avatar className={`h-8 w-8 border shrink-0 ${avatarBg}`}>
                                        <AvatarFallback className={`text-xs font-black ${accentColor}`}>
                                            {isMale ? '👨' : isFemale ? '👩' : customer.name.substring(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-black truncate group-hover:${accentColor} transition-colors uppercase flex items-center gap-1.5`}>
                                            {customer.name}
                                            {currentUser?.assigned_customer_ids?.includes(customer.id) && (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                    Priority
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground/70">
                                                #{customer.customer_code}
                                            </span>
                                            {customer.phone && (
                                                <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Phone className="w-2.5 h-2.5" />
                                                    {customer.phone}
                                                </span>
                                            )}
                                            {/* Dynamic Maqal % — SINGLE badge, toggles between maqal/all-time */}
                                            {(() => {
                                                const allTimePct = (customer as any).all_time_maqal_pct ?? 0;
                                                const allTimeTotal = (customer as any).all_time_maqal_total ?? 0;
                                                const maqalPct = (customer as any).selected_maqal_pct ?? (customer as any).latest_maqal_pct ?? 0;
                                                const maqalTotal = (customer as any).selected_maqal_total ?? (customer as any).latest_maqal_total ?? 0;

                                                // Show all-time if user selected 'all_time' or toggled this customer, OR if they have no maqal data for the current pair
                                                const showAllTime = selectedMaqalPair === 'all_time' || showAllTimePct[customer.id] || (maqalTotal <= 0 && allTimeTotal > 0);
                                                
                                                const pct = showAllTime ? allTimePct : maqalPct;
                                                const total = showAllTime ? allTimeTotal : maqalTotal;
                                                const icon = showAllTime ? <Globe className="w-2.5 h-2.5" /> : <CalendarDays className="w-2.5 h-2.5" />;
                                                const label = showAllTime ? 'All Time' : '';

                                                if (filterType === 'default') return null;
                                                if (total <= 0 && allTimeTotal <= 0) return null;

                                                return (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setShowAllTimePct(prev => ({...prev, [customer.id]: !prev[customer.id]}));
                                                        }}
                                                        className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer hover:opacity-80 active:scale-95 border ${
                                                            pct >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                                            : pct >= 50 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                                                            : pct >= 25 ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                                                        }`}
                                                        title={showAllTime ? `All-Time: ${pct}% — Click for maqal view` : `Maqal: ${pct}% — Click for all-time`}
                                                    >
                                                        {icon}
                                                        <span>{pct}%</span>
                                                    </button>
                                                );
                                            })()}
                                            {/* Unsolved pair reminder — pulsing amber — hide when specific maqal selected */}
                                            {selectedMaqalPair === 'latest' && !(customer as any).is_target_days_done && (customer as any).pair_date1 && (customer as any).pair_date2 && (
                                                <span className="reminder-pulse text-[8px] font-bold text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {formatPairDate((customer as any).pair_date1)} & {formatPairDate((customer as any).pair_date2)}
                                                </span>
                                            )}
                                            {(filterType === 'most_paid' || filterType === 'least_paid' || filterType === 'best') && (
                                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 rounded">
                                                    Paid: ${(customer as any).total_paid || 0}
                                                </span>
                                            )}
                                            {(filterType === 'most_kg' || filterType === 'least_kg') && (
                                                <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 rounded">
                                                    KG Maalintii: {((customer as any).total_books_count ? ((customer as any).total_kg || 0) / (customer as any).total_books_count : 0).toFixed(1).replace(/\.0$/, '')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Balance Info */}
                                    <div className="text-right shrink-0 min-w-[70px]">
                                        <p className={`text-sm font-black leading-none ${(customer as any).current_balance > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                            ${Math.abs(Math.round((customer as any).current_balance || 0)).toLocaleString('en-US')}
                                        </p>
                                        <p className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground mt-0.5">
                                            {(customer as any).current_balance < 0 ? 'Heyn' : (customer as any).last_receipt_has_payment ? 'Reesto' : 'Lacagta Guud'}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 text-muted-foreground/30 group-hover:${accentColor} group-hover:translate-x-0.5 transition-all`} />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
            {filteredCustomers.length > visibleCount && (
                <button 
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    className="w-full mt-4 py-3 rounded-xl border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                    Load More Customers
                </button>
            )}
        </div>
    );
}
