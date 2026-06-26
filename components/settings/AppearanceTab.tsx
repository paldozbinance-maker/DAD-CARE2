'use client';

import { useTheme } from 'next-themes';
import { Palette, Sun, Moon, Check } from 'lucide-react';

export function AppearanceTab() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-violet-500/5 to-transparent">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-violet-500/15">
                        <Palette className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Appearance</h3>
                        <p className="text-[10px] text-muted-foreground">Choose your preferred look</p>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${theme === 'light'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border/50 hover:border-primary/30 bg-background/50'
                            }`}
                    >
                        {theme === 'light' && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
                            </div>
                        )}
                        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Sun className="h-7 w-7 text-amber-500" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Light</span>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${theme === 'dark'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border/50 hover:border-primary/30 bg-background/50'
                            }`}
                    >
                        {theme === 'dark' && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
                            </div>
                        )}
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center shadow-sm">
                            <Moon className="h-7 w-7 text-blue-400" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Dark</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
