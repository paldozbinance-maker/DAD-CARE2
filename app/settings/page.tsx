'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    Settings,
    DollarSign,
    Database,
    Save,
    Download,
    Sun,
    Moon,
    Loader2,
    Users,
    User,
    UserPlus,
    UserCheck,
    Trash2,
    Search,
    Phone,
    Plus,
    Image as ImageIcon,
    Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface UserData {
    id: string;
    username: string;
    name: string;
    password?: string;
    role: string;
    is_active: boolean;
    gender?: string;
    phone?: string;
    avatar_url?: string;
    assigned_customer_ids?: string[];
    created_at: string;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    // Price per KG
    const [pricePerKg, setPricePerKg] = useState('35');
    const [loading, setLoading] = useState(false);

    // Current User
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Users state
    const [users, setUsers] = useState<UserData[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchUser, setSearchUser] = useState('');
    const [searchCustomer, setSearchCustomer] = useState('');
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // User Form State
    const [userForm, setUserForm] = useState({
        username: '',
        name: '',
        password: '',
        role: 'ADMIN' as string,
        gender: '',
        phone: '',
        avatar_url: '',
        assigned_customer_ids: [] as string[]
    });

    // Auto trigger DB migration on Settings page load
    useEffect(() => {
        const runMigration = async () => {
            try {
                const res = await fetch('/api/fix-db');
                const data = await res.json();
                if (data.success) {
                    console.log('✅ Auto migration check succeeded:', data.message);
                } else {
                    console.error('❌ Auto migration check failed:', data.error);
                }
            } catch (e) {
                console.error('Failed to run migration:', e);
            }
        };
        runMigration();
    }, []);

    // Load saved price
    useEffect(() => {
        const saved = localStorage.getItem('dadwork_price_per_kg');
        if (saved) setPricePerKg(saved);
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        loadUsers();
        loadCustomers();
    }, []);

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setUsers(data);
            }
        } catch (e) {
            toast.error('Failed to load users');
        } finally {
            setUsersLoading(false);
        }
    };

    const loadCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setAllCustomers(data);
            }
        } catch (e) {
            console.error('Failed to load customers:', e);
        }
    };

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

    // User actions
    const targetRole = currentUser?.role === 'SUPER_ADMIN' ? 'ADMIN' : 'USER';

    const handleOpenCreateDialog = () => {
        setSelectedUser(null);
        setUserForm({
            username: '',
            name: '',
            password: '',
            role: targetRole as any,
            gender: '',
            phone: '',
            avatar_url: '',
            assigned_customer_ids: []
        });
        setSearchCustomer('');
        setIsUserDialogOpen(true);
    };

    const handleOpenEditDialog = (user: UserData) => {
        setSelectedUser(user);
        setUserForm({
            username: user.username,
            name: user.name || '',
            password: user.password || '',
            role: user.role,
            gender: user.gender || '',
            phone: user.phone || '',
            avatar_url: user.avatar_url || '',
            assigned_customer_ids: user.assigned_customer_ids || []
        });
        setSearchCustomer('');
        setIsUserDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserForm(prev => ({ ...prev, avatar_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleToggleCustomerAssignment = (customerId: string) => {
        setUserForm(prev => {
            const alreadyAssigned = prev.assigned_customer_ids.includes(customerId);
            if (alreadyAssigned) {
                return {
                    ...prev,
                    assigned_customer_ids: prev.assigned_customer_ids.filter(id => id !== customerId)
                };
            } else {
                return {
                    ...prev,
                    assigned_customer_ids: [...prev.assigned_customer_ids, customerId]
                };
            }
        });
    };

    const handleSaveUser = async () => {
        if (!userForm.username || !userForm.name) {
            toast.error('Username and Full Name are required');
            return;
        }

        setLoading(true);
        try {
            const isEditing = selectedUser !== null;
            const url = isEditing ? `/api/users/${selectedUser.id}` : '/api/users';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            });

            const responseData = await res.json();

            if (res.ok) {
                toast.success(isEditing ? 'User updated successfully' : 'User created successfully');
                setIsUserDialogOpen(false);

                if (isEditing && currentUser && selectedUser?.id === currentUser.id) {
                    const updatedUser = { ...currentUser, ...responseData };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    setCurrentUser(updatedUser);
                }

                loadUsers();
            } else {
                toast.error(responseData.error || 'Failed to save user');
            }
        } catch (e) {
            toast.error('Connection error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('User deleted successfully');
                loadUsers();
            } else {
                toast.error('Failed to delete user');
            }
        } catch (e) {
            toast.error('Connection error occurred');
        }
    };

    const handleToggleUserAdmin = async (user: UserData) => {
        const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`Role updated to ${newRole}`);
                loadUsers();
            } else {
                toast.error('Failed to update role');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    // Filters
    const filteredUsers = users.filter(u =>
        ((currentUser?.role === 'SUPER_ADMIN' && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')) ||
            (currentUser?.role === 'ADMIN' && u.role === 'USER')) &&
        (u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchUser.toLowerCase()))
    );

    // Get all assigned customers by OTHER admins/users to prevent duplicate assignment
    const assignedToOthers = new Set(
        users.filter(u => u.id !== selectedUser?.id).flatMap(u => u.assigned_customer_ids || [])
    );

    const filteredCustomers = allCustomers.filter(c =>
        !assignedToOthers.has(c.id) &&
        (c.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
            c.customer_code?.toLowerCase().includes(searchCustomer.toLowerCase()))
    );

    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full px-1 md:px-0" suppressHydrationWarning>
            {/* Header / Cover */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-card overflow-hidden border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-6">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Settings</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-md ml-1">
                        Manage your system users, business configurations, themes, and data backups.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="business" className="w-full">
                <TabsList className={`bg-muted border border-border p-1 rounded-xl w-full grid gap-1 ${currentUser?.role === 'SUPER_ADMIN' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <TabsTrigger
                            value="business"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold py-2.5"
                        >
                            <DollarSign className="w-3.5 h-3.5 mr-1.5 hidden sm:block text-primary" />
                            Business
                        </TabsTrigger>
                    )}
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold py-2.5"
                    >
                        <Users className="w-3.5 h-3.5 mr-1.5 hidden sm:block text-blue-500" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger
                        value="appearance"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold py-2.5"
                    >
                        <Sun className="w-3.5 h-3.5 mr-1.5 hidden sm:block text-amber-500" />
                        Theme
                    </TabsTrigger>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                        <TabsTrigger
                            value="backup"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs font-semibold py-2.5"
                        >
                            <Database className="w-3.5 h-3.5 mr-1.5 hidden sm:block text-emerald-500" />
                            Backup
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Business Settings */}
                {currentUser?.role === 'SUPER_ADMIN' && (
                    <TabsContent value="business">
                        <Card className="glass-card mt-4 border border-border/60">
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
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-11"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Price
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Users Management Tab */}
                <TabsContent value="users">
                    <div className="space-y-4 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchUser}
                                    onChange={e => setSearchUser(e.target.value)}
                                    className="pl-10 bg-background border-border"
                                />
                            </div>
                            <Button
                                onClick={handleOpenCreateDialog}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 shrink-0 h-11"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add New User
                            </Button>
                        </div>

                        <Card className="glass-card border border-border/60 overflow-hidden">
                            <CardHeader className="bg-muted/20 border-b border-border py-4">
                                <CardTitle className="text-foreground text-base flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    User Management
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Create login accounts, fill profiles, and assign priority customers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {usersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-xs font-semibold uppercase tracking-widest">Loading Users...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="text-foreground font-bold text-lg">No Users Registered</p>
                                        <p className="text-muted-foreground text-sm mt-1 mb-6">Create credentials and profile information for system users.</p>
                                        <Button onClick={handleOpenCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                                            <Plus className="w-4 h-4 mr-2" /> Create First User
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/40">
                                        {filteredUsers.map((user) => {
                                            const hasAvatar = !!user.avatar_url;
                                            const assignedCount = user.assigned_customer_ids?.length || 0;
                                            const isUserAdmin = user.role === 'ADMIN';

                                            return (
                                                <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-muted/10 transition-colors">
                                                    {/* Profile Info */}
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border border-border bg-muted shrink-0 shadow-sm">
                                                            {hasAvatar ? (
                                                                <AvatarImage src={user.avatar_url} className="object-cover" />
                                                            ) : null}
                                                            <AvatarFallback className="text-base font-black bg-primary/10 text-primary uppercase">
                                                                {user.gender === 'Female' ? '👩' : user.gender === 'Male' ? '👨' : user.name?.charAt(0) || '👤'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-foreground text-sm uppercase">{user.name}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${isUserAdmin ? 'bg-amber-500/15 text-amber-500 border border-amber-500/35' : 'bg-blue-500/15 text-blue-500 border border-blue-500/35'}`}>
                                                                    {user.role}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                                                <span className="font-bold">@{user.username}</span>
                                                                {user.phone && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="w-3 h-3 text-muted-foreground/60" /> {user.phone}
                                                                    </span>
                                                                )}
                                                                <span className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-bold">
                                                                    {assignedCount} Priority Customers
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenEditDialog(user)}
                                                            className="border-border hover:bg-muted text-foreground text-xs font-bold px-3.5 rounded-xl"
                                                        >
                                                            Edit
                                                        </Button>
                                                        {user.username !== 'admin' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                            >
                                                                <Trash2 className="w-4.5 h-4.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <Card className="glass-card mt-4 border border-border/60">
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

                {/* Backup Tab */}
                {currentUser?.role === 'SUPER_ADMIN' && (
                    <TabsContent value="backup">
                        <Card className="glass-card mt-4 border border-border/60">
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
                                                Download a complete Excel-friendly CSV backup of all customers and transactions.
                                            </p>
                                            <Button
                                                onClick={handleExportCSV}
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
                )}
            </Tabs>

            {/* Create/Edit User Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            {selectedUser ? <UserCheck className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                            {selectedUser ? 'Edit User Details' : 'Add New User Profile'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Define login credentials, basic details, profile picture, and assign their priority customers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Profile Picture Upload & Preview */}
                            <div className="space-y-2 md:col-span-2 flex flex-col items-center bg-muted/20 border border-dashed border-border/80 p-4 rounded-2xl relative overflow-hidden">
                                <Avatar className="h-20 w-20 border-2 border-primary bg-background shadow-inner">
                                    {userForm.avatar_url ? (
                                        <AvatarImage src={userForm.avatar_url} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="text-2xl font-black text-primary bg-primary/5 uppercase">
                                        {userForm.gender === 'Female' ? '👩' : userForm.gender === 'Male' ? '👨' : userForm.name?.charAt(0) || '👤'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mt-3 flex items-center justify-center">
                                    <Label
                                        htmlFor="avatar-upload"
                                        className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Upload Picture
                                    </Label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {userForm.avatar_url && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setUserForm(p => ({ ...p, avatar_url: '' }))}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-bold ml-2 h-8 px-2 rounded-lg"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">Recommended: Square format image, size under 2MB.</p>
                            </div>

                            {/* Username */}
                            <div className="space-y-1.5">
                                <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Username *</Label>
                                <Input
                                    value={userForm.username}
                                    onChange={e => setUserForm({ ...userForm, username: e.target.value.toLowerCase().trim() })}
                                    placeholder="Enter username"
                                    disabled={selectedUser !== null}
                                    className="bg-background border-border focus:border-primary text-sm h-11"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Password *</Label>
                                <Input
                                    type="password"
                                    value={userForm.password}
                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    placeholder="Password"
                                    className="bg-background border-border focus:border-primary text-sm h-11"
                                />
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Full Name *</Label>
                                <Input
                                    value={userForm.name}
                                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="bg-background border-border focus:border-primary text-sm h-11"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Phone Number</Label>
                                <Input
                                    value={userForm.phone}
                                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                    type="tel"
                                    className="bg-background border-border focus:border-primary text-sm h-11"
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-1.5">
                                <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Gender</Label>
                                <div className="flex gap-2">
                                    {['Male', 'Female'].map((g) => {
                                        const isSelected = userForm.gender === g;
                                        return (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setUserForm({ ...userForm, gender: g })}
                                                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${isSelected
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                    : 'border-border hover:border-primary/20 text-muted-foreground bg-background/50'
                                                    }`}
                                            >
                                                {g === 'Male' ? '👨 Male' : '👩 Female'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Customer Assignment Checklist */}
                        <div className="space-y-2 border-t border-border pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground text-xs font-black uppercase tracking-wider">
                                    Assign Customers ({userForm.assigned_customer_ids.length} Selected)
                                </Label>
                                <span className="text-[10px] text-muted-foreground font-medium">Assigned customers will appear at the top of their list (Priority)</span>
                            </div>

                            <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search customers to assign..."
                                    value={searchCustomer}
                                    onChange={e => setSearchCustomer(e.target.value)}
                                    className="pl-8 bg-background border-border h-9 text-xs"
                                />
                            </div>

                            <div className="border border-border/80 rounded-2xl p-2.5 max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-background/40 shadow-inner">
                                {filteredCustomers.length === 0 ? (
                                    <div className="col-span-full py-6 text-center text-xs text-muted-foreground">
                                        No customers match your search
                                    </div>
                                ) : (
                                    filteredCustomers.map(customer => {
                                        const isAssigned = userForm.assigned_customer_ids.includes(customer.id);
                                        return (
                                            <button
                                                key={customer.id}
                                                type="button"
                                                onClick={() => handleToggleCustomerAssignment(customer.id)}
                                                className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${isAssigned
                                                    ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                                                    : 'border-border/40 hover:border-border text-foreground hover:bg-muted/20'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${isAssigned ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background'
                                                    }`}>
                                                    {isAssigned && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs truncate uppercase leading-tight">{customer.name}</p>
                                                    <p className="text-[9px] text-muted-foreground leading-none mt-0.5">#{customer.customer_code}</p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 border-t border-border pt-4 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsUserDialogOpen(false)}
                                className="flex-1 border-border rounded-xl font-bold h-11"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveUser}
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl h-11 shadow-md shadow-primary/10"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Profile'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
