'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Star,
    Shield,
    Palette,
    HardDrive,
    Pencil,
    Activity,
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

    // Audit Logs state
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

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

    // Auto trigger DB migration on Settings page load — ONCE ONLY
    useEffect(() => {
        const alreadyMigrated = localStorage.getItem('dadwork_db_migrated_v2');
        if (alreadyMigrated) return; // ⚡ Skip if already done

        const runMigration = async () => {
            try {
                const res = await fetch('/api/fix-db');
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('dadwork_db_migrated_v2', 'true'); // Never run again
                    console.log('✅ One-time migration done');
                } else {
                    console.error('❌ Migration failed:', data.error);
                }
            } catch (e) {
                console.error('Failed to run migration:', e);
            }
        };
        runMigration();
    }, []);

    useEffect(() => {
        // Load global settings
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data && data.dadwork_price_per_kg) {
                    setPricePerKg(data.dadwork_price_per_kg);
                    localStorage.setItem('dadwork_price_per_kg', data.dadwork_price_per_kg); // fallback for quick load
                }
            } catch (e) {
                console.error('Failed to load global settings:', e);
            }
        };
        loadSettings();

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);
            if (parsedUser.role === 'SUPER_ADMIN') {
                loadAuditLogs();
            }
        }
        loadUsers();
        loadCustomers();
    }, []);

    const loadAuditLogs = async () => {
        setAuditLoading(true);
        try {
            const res = await fetch('/api/audit-logs');
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data);
            }
        } catch (e) {
            console.error('Failed to load audit logs:', e);
        } finally {
            setAuditLoading(false);
        }
    };

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

    const handleSavePrice = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'dadwork_price_per_kg', value: pricePerKg })
            });
            if (res.ok) {
                localStorage.setItem('dadwork_price_per_kg', pricePerKg);
                toast.success(`Global Price per KG set to $${pricePerKg}`);
            } else {
                toast.error('Failed to save global price');
            }
        } catch (e) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    // Backup/Export
    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const custRes = await fetch('/api/customers');
            const customers = await custRes.json();

            if (Array.isArray(customers)) {
                const txnsByCustomer: Record<string, any[]> = {};
                for (const cust of customers) {
                    const ledgerRes = await fetch(`/api/ledger?customerId=${cust.id}&limit=10000`);
                    const ledgerData = await ledgerRes.json();
                    txnsByCustomer[cust.id] = ledgerData.transactions || [];
                }
                
                const { downloadSystemBackupPDF } = await import('@/lib/export-pdf');
                downloadSystemBackupPDF(customers, txnsByCustomer);
                toast.success('Colorful PDF backup exported successfully');
            }
        } catch (e) {
            toast.error('Failed to export PDF');
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-black text-foreground">Access Denied</h2>
                <p className="text-muted-foreground mt-2 text-sm">You do not have permission to view this page.</p>
            </div>
        );
    }

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isAnyAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

    return (
        <div className="space-y-4 max-w-4xl mx-auto w-full pb-24" suppressHydrationWarning>
            {/* Compact Header */}
            <div className="relative px-4 pt-4 pb-3 rounded-2xl bg-card overflow-hidden border border-border/50 mx-1 shadow-sm">
                <div className="absolute -top-20 -right-20 w-52 h-52 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                        <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-foreground tracking-tight">Settings</h2>
                        <p className="text-[11px] text-muted-foreground font-medium -mt-0.5">Users, theme & data</p>
                    </div>
                </div>
            </div>

            {/* Tabs - Compact pill style */}
            <div className="px-1">
                <Tabs defaultValue={isSuperAdmin ? "business" : "users"} className="w-full">
                    <TabsList className="bg-muted/60 backdrop-blur-sm border border-border/40 p-1 rounded-2xl w-full flex gap-0.5 h-auto">
                        {isSuperAdmin && (
                            <TabsTrigger
                                value="business"
                                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-[11px] font-bold py-2.5 px-1 gap-1.5 transition-all"
                            >
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="hidden xs:inline">Price</span>
                                <span className="xs:hidden">💲</span>
                            </TabsTrigger>
                        )}
                        <TabsTrigger
                            value="users"
                            className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-[11px] font-bold py-2.5 px-1 gap-1.5 transition-all"
                        >
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger
                            value="appearance"
                            className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-[11px] font-bold py-2.5 px-1 gap-1.5 transition-all"
                        >
                            <Palette className="w-3.5 h-3.5 text-violet-500" />
                            Theme
                        </TabsTrigger>
                        {isAnyAdmin && (
                            <TabsTrigger
                                value="backup"
                                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-[11px] font-bold py-2.5 px-1 gap-1.5 transition-all"
                            >
                                <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                                <span className="hidden xs:inline">Backup</span>
                                <span className="xs:hidden">💾</span>
                            </TabsTrigger>
                        )}
                        {isSuperAdmin && (
                            <TabsTrigger
                                value="audit"
                                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-[11px] font-bold py-2.5 px-1 gap-1.5 transition-all"
                            >
                                <Activity className="w-3.5 h-3.5 text-red-500" />
                                <span className="hidden xs:inline">Audit</span>
                                <span className="xs:hidden">🔍</span>
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* ── Business Settings ── */}
                    {isSuperAdmin && (
                        <TabsContent value="business" className="mt-3">
                            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-emerald-500/5 to-transparent">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-emerald-500/15">
                                            <DollarSign className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Default Price</h3>
                                            <p className="text-[10px] text-muted-foreground">Price per KG for ledger calculations</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 flex items-center gap-2.5">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">$</div>
                                        <Input
                                            type="number"
                                            value={pricePerKg}
                                            onChange={(e) => setPricePerKg(e.target.value)}
                                            className="pl-7 h-11 text-xl font-black bg-background/50 border-border/60 rounded-xl text-center"
                                            step="1"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSavePrice}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-md shadow-emerald-600/15 active:scale-95 transition-all px-5 shrink-0"
                                    >
                                        <Save className="w-4 h-4 mr-1.5" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {/* ── Users Management ── */}
                    <TabsContent value="users" className="mt-3">
                        <div className="space-y-3">
                            {/* Search + Add */}
                            <div className="flex gap-2 px-0.5">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchUser}
                                        onChange={e => setSearchUser(e.target.value)}
                                        className="pl-9 bg-background/50 border-border/50 rounded-xl h-11 text-sm"
                                    />
                                </div>
                                {isSuperAdmin && (
                                    <Button
                                        onClick={handleOpenCreateDialog}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 shrink-0 h-11 rounded-xl px-3 active:scale-95 transition-all"
                                    >
                                        <UserPlus className="w-4 h-4 mr-1.5" />
                                        <span className="hidden sm:inline">Add User</span>
                                        <span className="sm:hidden">Add</span>
                                    </Button>
                                )}
                            </div>

                            {/* User Cards */}
                            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                <div className="px-4 py-2.5 border-b border-border/40 bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-bold text-foreground">Team Members</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {filteredUsers.length}
                                    </span>
                                </div>

                                {usersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-14 px-6">
                                        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                            <User className="w-7 h-7 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-foreground font-bold text-sm">No Users Yet</p>
                                        <p className="text-muted-foreground text-xs mt-1 mb-4">Create user accounts for your team</p>
                                        {isSuperAdmin && (
                                            <Button onClick={handleOpenCreateDialog} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-9 active:scale-95">
                                                <Plus className="w-3.5 h-3.5 mr-1.5" /> Create User
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/30">
                                        {filteredUsers.map((user) => {
                                            const hasAvatar = !!user.avatar_url;
                                            const assignedCount = user.assigned_customer_ids?.length || 0;
                                            const isUserAdmin = user.role === 'ADMIN';

                                            return (
                                                <div key={user.id} className="flex items-center gap-3 px-3 py-3 active:bg-muted/20 transition-colors">
                                                    {/* Avatar */}
                                                    <Avatar className="h-11 w-11 border border-border/60 bg-muted shrink-0 shadow-sm">
                                                        {hasAvatar ? (
                                                            <AvatarImage src={user.avatar_url} className="object-cover" />
                                                        ) : null}
                                                        <AvatarFallback className="text-sm font-black bg-primary/10 text-primary uppercase">
                                                            {user.gender === 'Female' ? '👩' : user.gender === 'Male' ? '👨' : user.name?.charAt(0) || '👤'}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-black text-foreground text-xs uppercase truncate">{user.name}</span>
                                                            <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-wider uppercase ${isUserAdmin ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold text-muted-foreground">@{user.username}</span>
                                                            {user.phone && (
                                                                <span className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                                    <Phone className="w-2.5 h-2.5" /> {user.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Priority stars */}
                                                        {assignedCount > 0 && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">{assignedCount} Priority</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    {isSuperAdmin && (
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                onClick={() => handleOpenEditDialog(user)}
                                                                className="p-2 rounded-xl border border-border/50 hover:bg-muted/50 active:scale-90 transition-all"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                                            </button>
                                                            {user.username !== 'admin' && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                                    className="p-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 active:scale-90 transition-all"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Appearance ── */}
                    <TabsContent value="appearance" className="mt-3">
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
                    </TabsContent>

                    {/* ── Backup ── */}
                    {isAnyAdmin && (
                        <TabsContent value="backup" className="mt-3">
                            <div className="space-y-3">
                                {/* ★ OneDrive Backup — NEW */}
                                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-blue-500/5 to-transparent">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-blue-500/15">
                                                <HardDrive className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">☁️ Save to OneDrive</h3>
                                                <p className="text-[10px] text-muted-foreground">Buuga Maqalka + Buuga Maalinlaha — saved to your OneDrive folder</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                                            <p className="font-bold">📁 Files saved to:</p>
                                            <p className="font-mono text-[10px] opacity-80">OneDrive/Desktop/dadcare app/Backups/</p>
                                            <p>Each backup includes:</p>
                                            <ul className="list-disc list-inside text-[11px] space-y-0.5 ml-1 opacity-90">
                                                <li><strong>Buuga Maqalka</strong> — Full ledger history for every customer</li>
                                                <li><strong>Buuga Maalinlaha</strong> — Complete daily book record</li>
                                                <li><strong>Beautiful HTML</strong> — Open in any browser to print</li>
                                                <li><strong>Text files</strong> — Readable on any device forever</li>
                                            </ul>
                                        </div>
                                        <Button
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    const res = await fetch('/api/backup', { method: 'POST' });
                                                    const data = await res.json();
                                                    if (res.ok && data.success) {
                                                        toast.success(`✅ Backup saved! ${data.stats.filesGenerated} files saved to OneDrive`);
                                                    } else {
                                                        toast.error('Backup failed: ' + (data.error || 'Unknown error'));
                                                    }
                                                } catch (e) {
                                                    toast.error('Network error during backup');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating backup...
                                                </>
                                            ) : (
                                                <>
                                                    <HardDrive className="w-4 h-4 mr-2" />
                                                    ☁️ Generate OneDrive Backup Now
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Export PDF Card (existing) */}
                                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-amber-500/5 to-transparent">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-amber-500/15">
                                                <Download className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">PDF Download</h3>
                                                <p className="text-[10px] text-muted-foreground">Download a PDF receipt backup to your device</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <Button
                                            onClick={handleExportPDF}
                                            disabled={loading}
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Exporting...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download PDF Backup
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Security Info */}
                                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border/40">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/15">
                                                <Shield className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground">Security Info</h3>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {[
                                            { title: 'Cloud Database', desc: 'All data stored in Supabase (99.9% uptime) — never lost.' },
                                            { title: 'OneDrive Sync', desc: 'Backups auto-sync to Microsoft cloud via OneDrive.' },
                                            { title: 'Proof of Record', desc: 'Every transaction logged with timestamp & ID.' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-3 items-start">
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-black text-emerald-500">{i + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">{item.title}</p>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {/* ── Audit Logs ── */}
                    {isSuperAdmin && (
                        <TabsContent value="audit" className="mt-3">
                            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-red-500/5 to-transparent flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-red-500/15">
                                            <Activity className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Audit Logs</h3>
                                            <p className="text-[10px] text-muted-foreground">Track all system activities</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={loadAuditLogs} className="h-8 rounded-xl text-xs active:scale-95">Refresh</Button>
                                </div>
                                <div className="p-0">
                                    {auditLoading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    ) : auditLogs.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground text-sm">No activities logged yet.</div>
                                    ) : (
                                        <div className="divide-y divide-border/30 max-h-[60vh] overflow-y-auto">
                                            {auditLogs.map((log) => (
                                                <div key={log.id} className="p-4 hover:bg-muted/10 transition-colors flex gap-4 items-start">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-primary">{log.username.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className="text-sm font-bold text-foreground truncate">@{log.username}</p>
                                                            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                                                                {new Date(log.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded shrink-0">{log.action}</span>
                                                            <span className="text-[11px] text-muted-foreground font-medium">{log.role}</span>
                                                        </div>
                                                        <p className="text-xs text-foreground mt-1.5 bg-muted/30 p-2 rounded-lg border border-border/40 inline-block">{log.details}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* ── Create/Edit User Dialog ── */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="bg-card border-border/50 max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-0">
                    {/* Dialog Header */}
                    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/40 px-4 py-3 rounded-t-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground text-sm">
                                {selectedUser ? <UserCheck className="w-4 h-4 text-primary" /> : <UserPlus className="w-4 h-4 text-primary" />}
                                {selectedUser ? 'Edit User' : 'New User'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-[10px]">
                                Set credentials, profile & priority customers.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-4 pb-4 pt-2 space-y-4">
                        {/* Avatar */}
                        <div className="flex flex-col items-center py-3 bg-muted/20 border border-dashed border-border/60 rounded-2xl">
                            <Avatar className="h-16 w-16 border-2 border-primary/30 bg-background shadow-inner">
                                {userForm.avatar_url ? (
                                    <AvatarImage src={userForm.avatar_url} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="text-xl font-black text-primary bg-primary/5 uppercase">
                                    {userForm.gender === 'Female' ? '👩' : userForm.gender === 'Male' ? '👨' : userForm.name?.charAt(0) || '👤'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mt-2 flex items-center gap-2">
                                <Label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1 active:scale-95"
                                >
                                    <ImageIcon className="w-3 h-3" />
                                    Upload
                                </Label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {userForm.avatar_url && (
                                    <button
                                        onClick={() => setUserForm(p => ({ ...p, avatar_url: '' }))}
                                        className="text-destructive text-[10px] font-bold px-2 py-1.5 rounded-lg hover:bg-destructive/10 active:scale-95 transition-all"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Form Fields - 2 column grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-foreground text-[10px] font-bold uppercase tracking-wider">Username *</Label>
                                <Input
                                    value={userForm.username}
                                    onChange={e => setUserForm({ ...userForm, username: e.target.value.toLowerCase().trim() })}
                                    placeholder="username"
                                    disabled={selectedUser !== null}
                                    className="bg-background/50 border-border/50 text-sm h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-foreground text-[10px] font-bold uppercase tracking-wider">Password *</Label>
                                <Input
                                    type="password"
                                    value={userForm.password}
                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    placeholder="••••••"
                                    className="bg-background/50 border-border/50 text-sm h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-foreground text-[10px] font-bold uppercase tracking-wider">Full Name *</Label>
                                <Input
                                    value={userForm.name}
                                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                    placeholder="Full name"
                                    className="bg-background/50 border-border/50 text-sm h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-foreground text-[10px] font-bold uppercase tracking-wider">Phone</Label>
                                <Input
                                    value={userForm.phone}
                                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                                    placeholder="Phone"
                                    type="tel"
                                    className="bg-background/50 border-border/50 text-sm h-10 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                            <Label className="text-foreground text-[10px] font-bold uppercase tracking-wider">Gender</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Male', 'Female'].map((g) => {
                                    const isSelected = userForm.gender === g;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setUserForm({ ...userForm, gender: g })}
                                            className={`py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${isSelected
                                                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                : 'border-border/50 hover:border-primary/20 text-muted-foreground bg-background/50'
                                                }`}
                                        >
                                            {g === 'Male' ? '👨 Male' : '👩 Female'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Customer Assignment */}
                        <div className="space-y-2 border-t border-border/40 pt-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    Priority Customers ({userForm.assigned_customer_ids.length})
                                </Label>
                            </div>
                            <p className="text-[9px] text-muted-foreground -mt-1">These customers appear first in their lists with a ★ star badge</p>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50" />
                                <Input
                                    placeholder="Search customers..."
                                    value={searchCustomer}
                                    onChange={e => setSearchCustomer(e.target.value)}
                                    className="pl-7 bg-background/50 border-border/40 h-8 text-[11px] rounded-xl"
                                />
                            </div>

                            <div className="border border-border/40 rounded-xl p-2 max-h-36 overflow-y-auto grid grid-cols-1 gap-1 bg-background/30 shadow-inner">
                                {filteredCustomers.length === 0 ? (
                                    <div className="py-4 text-center text-[10px] text-muted-foreground">
                                        No customers found
                                    </div>
                                ) : (
                                    filteredCustomers.map(customer => {
                                        const isAssigned = userForm.assigned_customer_ids.includes(customer.id);
                                        return (
                                            <button
                                                key={customer.id}
                                                type="button"
                                                onClick={() => handleToggleCustomerAssignment(customer.id)}
                                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left border transition-all active:scale-[0.97] ${isAssigned
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-foreground'
                                                    : 'border-transparent hover:bg-muted/30 text-foreground'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${isAssigned ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/30 bg-background'
                                                    }`}>
                                                    {isAssigned && <Star className="w-2.5 h-2.5 text-white fill-white" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] truncate uppercase leading-tight font-bold">{customer.name}</p>
                                                    <p className="text-[9px] text-muted-foreground leading-none mt-0.5">#{customer.customer_code}</p>
                                                </div>
                                                {isAssigned && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsUserDialogOpen(false)}
                                className="border-border/50 rounded-xl font-bold h-11 active:scale-95 transition-all"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveUser}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl h-11 shadow-md shadow-primary/10 active:scale-95 transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
