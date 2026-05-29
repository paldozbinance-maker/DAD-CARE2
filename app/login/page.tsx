'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, KeyRound, UserCircle2, Fingerprint, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!username || !password) {
            toast.error('Please enter both username and password');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim().toLowerCase(), password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                toast.success(`Welcome back, ${data.name || data.username}!`);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 500);
            } else {
                toast.error(data.error || 'Invalid username or password');
                setLoading(false);
            }
        } catch (error) {
            toast.error('Connection error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background items-center justify-center p-4 transition-colors duration-500">

            <div className="w-full max-w-md relative z-10">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                        <span className="text-3xl font-black text-primary-foreground italic">D</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter">
                        DAD<span className="text-primary italic">WORK</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide uppercase text-xs">Precision Ledger Systems</p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-[2rem] p-10 shadow-2xl border border-border/50 relative overflow-hidden">
                    {/* Subtle gradient glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -z-10 rounded-full" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1">Username</Label>
                            <div className="relative group">
                                <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="bg-background/50 border-border h-14 pl-10 rounded-xl focus-visible:ring-primary focus-visible:ring-offset-0 text-foreground"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1">Password</Label>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="bg-background/50 border-border h-14 pl-10 rounded-xl focus-visible:ring-primary focus-visible:ring-offset-0 text-foreground"
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-xl mt-6 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <Sparkles className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    SECURE LOGIN
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <div className="bg-muted/40 backdrop-blur-sm p-4 rounded-xl border border-border/50 text-sm text-muted-foreground inline-block">
                        <span className="text-primary font-black uppercase tracking-widest mr-2">Demo:</span>
                        <code className="bg-background px-2 py-0.5 rounded text-foreground font-bold">admin / 123</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
