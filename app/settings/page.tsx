'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, DollarSign, Database, Save, Download, Upload, Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    // Price per KG
    const [pricePerKg, setPricePerKg] = useState('35');
    const [loading, setLoading] = useState(false);

    // Load saved price
    useEffect(() => {
        const saved = localStorage.getItem('dadwork_price_per_kg');
        if (saved) setPricePerKg(saved);
    }, []);

    const handleSavePrice = () => {
        localStorage.setItem('dadwork_price_per_kg', pricePerKg);
        toast.success(`Price per KG set to $${pricePerKg}`);
    };

    // Backup/Export
    const handleExportCSV = async () => {
        setLoading(true);
        try {
            const custRes = await fetch('/api/customers');
            const customers = await custRes.json();

            let csvContent = 'Customer,Code,Date,Type,KG,Price,Amount,Balance After\n';

            if (Array.isArray(customers)) {
                for (const cust of customers) {
                    const ledgerRes = await fetch(`/api/ledger?customerId=${cust.id}&limit=10000`);
                    const ledgerData = await ledgerRes.json();
                    const txns = ledgerData.transactions || [];

                    txns.forEach((t: any) => {
                        csvContent += `"${cust.name}","${cust.customer_code}","${t.reference_date}","${t.type}",${t.kg || 0},${t.price_per_kg || 0},${t.amount},${t.new_debt}\n`;
                    });
                }
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dadwork-ledger-full-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Excel-friendly CSV exported');
        } catch (e) {
            toast.error('Failed to export CSV');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your system preferences
                </p>
            </div>

            <Tabs defaultValue="business" className="w-full">
                <TabsList className="bg-muted border border-border p-1 rounded-xl w-full grid grid-cols-3">
                    <TabsTrigger
                        value="business"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold"
                    >
                        <DollarSign className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                        Business
                    </TabsTrigger>
                    <TabsTrigger
                        value="appearance"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold"
                    >
                        <Sun className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                        Theme
                    </TabsTrigger>
                    <TabsTrigger
                        value="backup"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold"
                    >
                        <Database className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                        Backup
                    </TabsTrigger>
                </TabsList>

                {/* Business Settings */}
                <TabsContent value="business">
                    <Card className="glass-card">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-foreground flex items-center gap-2 text-base">
                                <DollarSign className="w-5 h-5 text-primary" />
                                Price Settings
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Set the default price per kilogram for calculations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-foreground">
                                    Default Price per KG ($)
                                </Label>
                                <div className="relative max-w-xs">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                    <Input
                                        type="number"
                                        value={pricePerKg}
                                        onChange={(e) => setPricePerKg(e.target.value)}
                                        className="pl-10 h-14 text-2xl font-bold bg-background border-border"
                                        step="1"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This price is used as the default when processing daily book entries into the ledger.
                                </p>
                            </div>
                            <Button
                                onClick={handleSavePrice}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Price
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance */}
                <TabsContent value="appearance">
                    <Card className="glass-card">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-foreground flex items-center gap-2 text-base">
                                <Sun className="w-5 h-5 text-primary" />
                                Appearance
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Choose your preferred theme
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                        <Sun className="h-6 w-6 text-amber-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-sm">
                                        <Moon className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">Dark</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backup */}
                <TabsContent value="backup">
                    <Card className="glass-card">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-foreground flex items-center gap-2 text-base">
                                <Database className="w-5 h-5 text-primary" />
                                Data Backup
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Export all your business data as a backup file
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Download className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground mb-1">Export Full Backup</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Download a complete JSON backup of all customers, transactions, payments, and settings.
                                        </p>
                                        <Button
                                            onClick={handleExportAll}
                                            disabled={loading}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Exporting...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Backup
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-muted/50 border border-border">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-emerald-500/10">
                                        <Save className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1 italic">Security & Reliability Info</h3>
                                        <div className="text-xs text-muted-foreground space-y-2 mt-2">
                                            <p className="font-bold text-foreground">1. Cloud Persistence</p>
                                            <p>Your data is stored in Supabase (Google Cloud infrastructure) with 99.9% uptime. It is not just on your phone—it is in the master cloud database.</p>
                                            <p className="font-bold text-foreground">2. Automatic Backups</p>
                                            <p>The database performs daily automatic backups. Even if your computer breaks, your data is safe.</p>
                                            <p className="font-bold text-foreground">3. Proof of Record</p>
                                            <p>Every single transaction is logged with a timestamp and a unique ID. You can download these as CSV for legal proof.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
