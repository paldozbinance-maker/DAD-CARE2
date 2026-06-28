'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { AddCustomerDialog } from '@/components/add-customer-dialog';
import { toast } from 'sonner';
import { Phone, Search, ChevronRight, Users, Star, Filter, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

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
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [filterType, setFilterType] = useState<string>('default');
    const [visibleCount, setVisibleCount] = useState(20);

    // ⚡ SWR: Instant cache — no more spinner every time you visit this page
    const { data: customersData, isLoading, mutate: mutateCustomers } = useSWR<Customer[]>(
        '/api/customers',
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 30000 }
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
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
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
        } else if (filterType === 'best') {
            const scoreA = ((a as any).total_paid || 0) - ((a as any).current_balance || 0);
            const scoreB = ((b as any).total_paid || 0) - ((b as any).current_balance || 0);
            return scoreB - scoreA;
        } else if (filterType === 'worst') {
            return ((b as any).current_balance || 0) - ((a as any).current_balance || 0);
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                                <DropdownMenuItem onClick={() => setFilterType('best')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl text-emerald-500 focus:text-emerald-600 focus:bg-emerald-500/10 ${filterType === 'best' ? 'bg-emerald-500/10' : ''}`}>
                                    ⭐ Macaamilka Ugu Fiican {filterType === 'best' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterType('worst')} className={`text-[10px] sm:text-xs font-bold cursor-pointer rounded-xl text-destructive focus:text-destructive focus:bg-destructive/10 ${filterType === 'worst' ? 'bg-destructive/10' : ''}`}>
                                    ⚠️ Macaamilka Ugu Liita {filterType === 'worst' && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
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
