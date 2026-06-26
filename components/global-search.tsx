'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, Hash, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useClickAway } from '@/lib/hooks/use-click-away'; // I will check if this exists or just write click away logic

export function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/customers?lite=true');
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data);
                }
            } catch (e) {
                console.error('Search fetch error', e);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = query.trim() === '' ? [] : customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(query.toLowerCase())) ||
        (c.phone && c.phone.includes(query)) ||
        (c.customer_code && c.customer_code.toString().includes(query))
    );

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl mx-auto mb-6 z-50">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search by name, phone number, or ID..."
                    className="pl-11 h-14 bg-background border-2 border-primary/20 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 text-base shadow-sm rounded-2xl transition-all"
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {isOpen && query.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {filtered.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 pt-2">Search Results</p>
                            {filtered.map(customer => (
                                <button
                                    key={customer.id}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery('');
                                        router.push(`/customers/${customer.id}`);
                                    }}
                                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{customer.name}</p>
                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1"><Hash className="h-3 w-3"/>{customer.customer_code}</span>
                                                {customer.phone && (
                                                    <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{customer.phone}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Balance</p>
                                        <p className={`text-sm font-black ${customer.current_balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            ${Math.round(customer.current_balance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No customers found</p>
                            <p className="text-xs mt-1 opacity-70">Try searching with a different name or number</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
