'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { AddCustomerDialog } from '@/components/add-customer-dialog';
import { toast } from 'sonner';
import { Phone, Search, ChevronRight, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Customer {
    id: string;
    name: string;
    customer_code: string;
    gender?: string;
    phone?: string;
    avatar_url?: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch customers');
            setCustomers(Array.isArray(data) ? data : []);
        } catch (e: unknown) {
            const error = e as Error;
            toast.error(error.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCustomers(); }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const idA = parseInt(a.customer_code.replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(b.customer_code.replace(/\D/g, ''), 10) || 0;
        return idA - idB;
    });

    return (
        <div className="space-y-4 max-w-2xl mx-auto px-1 md:px-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-black tracking-tight text-foreground">Customers</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {loading ? '—' : customers.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 h-8 text-xs w-[160px] bg-background border-input focus:border-primary"
                        />
                    </div>
                    <AddCustomerDialog onSuccess={loadCustomers} />
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm">
                {loading ? (
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
                                <AddCustomerDialog onSuccess={loadCustomers} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {filteredCustomers.map((customer) => {
                            const isMale = customer.gender === 'Male';
                            const isFemale = customer.gender === 'Female';
                            const accentColor = isMale ? 'text-blue-400' : isFemale ? 'text-pink-400' : 'text-primary';
                            const avatarBg = isMale ? 'bg-blue-500/10 border-blue-500/30' : isFemale ? 'bg-pink-500/10 border-pink-500/30' : 'bg-primary/10 border-primary/30';

                            return (
                                <Link
                                    href={`/customers/${customer.id}`}
                                    key={customer.id}
                                    className="group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors cursor-pointer"
                                >
                                    {/* Avatar */}
                                    <Avatar className={`h-8 w-8 border shrink-0 ${avatarBg}`}>
                                        <AvatarFallback className={`text-xs font-black ${accentColor}`}>
                                            {isMale ? '👨' : isFemale ? '👩' : customer.name.substring(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-black truncate group-hover:${accentColor} transition-colors uppercase`}>
                                            {customer.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground/70">
                                                #{customer.customer_code}
                                            </span>
                                            {customer.phone && (
                                                <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Phone className="w-2.5 h-2.5" />
                                                    {customer.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Balance Info */}
                                    <div className="text-right shrink-0 min-w-[70px]">
                                        <p className={`text-sm font-black leading-none ${(customer as any).current_balance > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                            ${Math.abs(Math.round((customer as any).current_balance || 0)).toLocaleString()}
                                        </p>
                                        <p className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground mt-0.5">
                                            {(customer as any).current_balance > 0 ? 'Lacagta Guud' : 'Settled'}
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
        </div>
    );
}
