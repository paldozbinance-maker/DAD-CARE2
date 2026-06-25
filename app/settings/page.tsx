'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
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
    Wifi,
    WifiOff,
    Clock,
    LogIn,
    LogOut,
    AlertTriangle,
    Filter,
    RefreshCw,
    Eye,
    ChevronDown,
    Zap,
    Crown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';

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
    const [auditTotal, setAuditTotal] = useState(0);
    const [auditUserStats, setAuditUserStats] = useState<any[]>([]);
    const [auditActions, setAuditActions] = useState<string[]>([]);
    const [auditFilterUser, setAuditFilterUser] = useState('');
    const [auditFilterAction, setAuditFilterAction] = useState('');
    const [onlineSessions, setOnlineSessions] = useState<any[]>([]);
    const [allSessions, setAllSessions] = useState<any[]>([]);

    const auditFiltersRef = useRef({ user: auditFilterUser, action: auditFilterAction });
    useEffect(() => {
        auditFiltersRef.current = { user: auditFilterUser, action: auditFilterAction };
    }, [auditFilterUser, auditFilterAction]);

    // Active tab state to keep across reloads
    const [activeTab, setActiveTab] = useState<string>('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (currentUser) {
            if (tab && (tab !== 'users' || currentUser.role === 'SUPER_ADMIN')) {
                setActiveTab(tab);
            } else {
                setActiveTab(currentUser.role === 'SUPER_ADMIN' ? 'business' : 'appearance');
            }
        }
    }, [currentUser]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', val);
        window.history.replaceState({}, '', url.toString());
    };

    // Clear Ledger History Dialog and state
    const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
    const [clearHistoryStep, setClearHistoryStep] = useState(1); // 1 = questions, 2 = warning/confirm
    const [motherNameVal, setMotherNameVal] = useState('');
    const [phoneVal, setPhoneVal] = useState('');
    const [birthYearVal, setBirthYearVal] = useState('');
    const [isClearingHistory, setIsClearingHistory] = useState(false);

    // Admin Detail Dialog state
    const [adminDetailOpen, setAdminDetailOpen] = useState(false);
    const [adminDetailUser, setAdminDetailUser] = useState<any>(null);
    const [adminDetailLogs, setAdminDetailLogs] = useState<any[]>([]);
    const [adminDetailLoading, setAdminDetailLoading] = useState(false);
    const [adminDetailStats, setAdminDetailStats] = useState<any>(null);

    // Helper to format relative time for inactive users
    const formatRelativeTime = (date?: Date): string => {
        if (!date) return 'Never active';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        if (diffMs < 0) return 'Just now'; // Handle clock skew
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) return 'Active just now';
        if (diffMins < 60) return `Active ${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Active ${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Active yesterday';
        return `Active ${diffDays}d ago`;
    };

    // Calculate admin online status and last seen times
    const adminStatusList = useMemo(() => {
        const adminsMap = new Map<string, { username: string; name: string; role: string; avatarUrl?: string; lastSeen?: Date; isOnline: boolean }>();

        // 1. Do NOT seed the hardcoded 'admin' fallback — only real admins with actual activity show

        // 2. Load admins from registered users table
        users.forEach(u => {
            if (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.username === 'admin') {
                adminsMap.set(u.username, {
                    username: u.username,
                    name: u.name,
                    role: u.role,
                    avatarUrl: u.avatar_url,
                    isOnline: false,
                });
            }
        });

        // 3. Update from database audit trail stats (to get last active times)
        auditUserStats.forEach(stat => {
            const existing = adminsMap.get(stat.username);
            const lastActiveDate = stat.last_activity ? new Date(stat.last_activity) : undefined;
            if (existing) {
                if (lastActiveDate) {
                    existing.lastSeen = lastActiveDate;
                }
                if (stat.avatar_url) existing.avatarUrl = stat.avatar_url;
                if (stat.name) existing.name = stat.name;
                if (stat.role) existing.role = stat.role;
            }
        });

        // 4. Update from active online sessions (real-time heartbeat validation)
        onlineSessions.forEach(session => {
            const existing = adminsMap.get(session.username);
            if (existing) {
                existing.isOnline = true;
                existing.lastSeen = new Date();
                if (session.avatarUrl) existing.avatarUrl = session.avatarUrl;
                if (session.name) existing.name = session.name;
            }
        });

        // Show all admins regardless of activity history
        const list = Array.from(adminsMap.values());

        // Sort: Online first, then by last active time (latest first), then alphabetical
        return list.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;

            if (a.lastSeen && b.lastSeen) {
                return b.lastSeen.getTime() - a.lastSeen.getTime();
            }
            if (a.lastSeen) return -1;
            if (b.lastSeen) return 1;
            return a.username.localeCompare(b.username);
        });
    }, [users, auditUserStats, onlineSessions]);

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
        const token = localStorage.getItem('dadwork_session_token');
        if (!storedUser || !token) {
            window.location.href = '/login';
            return;
        }

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);

            // Always load users + customers for all admin roles
            loadUsers();
            loadCustomers();

            if (parsedUser.role === 'SUPER_ADMIN') {
                loadAuditLogs();
                loadOnlineSessions();

                // ── Heartbeat every 30s to stay marked ONLINE in the DB ──
                const heartbeat = setInterval(async () => {
                    const token = localStorage.getItem('dadwork_session_token') || '';
                    if (token) {
                        fetch('/api/admin-sessions', {
                            method: 'POST',
                            headers: { 'x-session-token': token }
                        }).catch(() => {});
                    }
                }, 30_000);

                // ── Auto-refresh "Who's Online" and "Audit Logs" every 2.5s (fallback) ──
                const refresh = setInterval(() => {
                    loadOnlineSessions();
                    loadAuditLogs(auditFiltersRef.current.user, auditFiltersRef.current.action, true);
                }, 2500);

                // ── Supabase Realtime for INSTANT updates ──
                const supabase = createClient();
                const channel = supabase
                    .channel('audit_log_changes')
                    .on(
                        'postgres_changes',
                        { event: 'INSERT', schema: 'public', table: 'AuditLog' },
                        () => {
                            // Instant silent reload when an action happens
                            loadOnlineSessions();
                            loadAuditLogs(auditFiltersRef.current.user, auditFiltersRef.current.action, true);
                        }
                    )
                    .subscribe();

                return () => {
                    clearInterval(heartbeat);
                    clearInterval(refresh);
                    supabase.removeChannel(channel);
                };
            }
        }
    }, []);

    const loadAuditLogs = async (userFilter = auditFilterUser, actionFilter = auditFilterAction, silent = false) => {
        if (!silent) setAuditLoading(true);
        try {
            const token = localStorage.getItem('dadwork_session_token') || '';
            const params = new URLSearchParams({ limit: '200' });
            if (userFilter) params.set('user', userFilter);
            if (actionFilter) params.set('action', actionFilter);
            const res = await fetch(`/api/audit-logs?${params}`, {
                headers: { 'x-session-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data.logs || []);
                setAuditTotal(data.total || 0);
                setAuditUserStats(data.userStats || []);
                setAuditActions(data.actions || []);
            }
        } catch (e) {
            console.error('Failed to load audit logs:', e);
        } finally {
            if (!silent) setAuditLoading(false);
        }
    };

    const loadOnlineSessions = async () => {
        try {
            const token = localStorage.getItem('dadwork_session_token') || '';
            const res = await fetch('/api/admin-sessions', {
                headers: { 'x-session-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setOnlineSessions(data.online || []);
                setAllSessions(data.all || []);
            }
        } catch (e) {
            console.error('Failed to load online sessions:', e);
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
        const userToDelete = users.find(u => u.id === userId);
        const isAdmin = userToDelete?.role === 'ADMIN' || userToDelete?.role === 'SUPER_ADMIN';

        if (isAdmin) {
            const confirmation = prompt(`To delete admin user "${username}", please type PALDOZ in capital letters to confirm:`);
            if (confirmation !== 'PALDOZ') {
                toast.error('Incorrect confirmation code. Deletion cancelled.');
                return;
            }
        } else {
            if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
                return;
            }
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

    const handleVerifyConditions = () => {
        if (motherNameVal.trim().toLowerCase() !== 'nasteexo') {
            toast.error("Incorrect answer for Mother's Name.");
            return;
        }
        if (phoneVal.trim() !== '0618372575') {
            toast.error("Incorrect phone number.");
            return;
        }
        if (birthYearVal.trim() !== '2004') {
            toast.error("Incorrect birth year.");
            return;
        }
        setClearHistoryStep(2);
    };

    const handleClearLedgerHistory = async () => {
        setIsClearingHistory(true);
        try {
            const token = localStorage.getItem('dadwork_session_token') || '';
            const res = await fetch('/api/ledger/clear-all', {
                method: 'DELETE',
                headers: { 'x-session-token': token }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Successfully cleared all customer ledger history (${data.deletedCount} entries deleted)`);
                setIsClearHistoryOpen(false);
                loadCustomers();
            } else {
                toast.error(data.error || 'Failed to clear history');
            }
        } catch (e) {
            toast.error('Network error occurred while clearing history');
        } finally {
            setIsClearingHistory(false);
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

    // Open Admin Detail Dialog
    const openAdminDetail = async (adminInfo: { username: string; name: string; role: string; avatarUrl?: string; isOnline: boolean; lastSeen?: Date }) => {
        setAdminDetailUser(adminInfo);
        setAdminDetailLogs([]);
        setAdminDetailStats(null);
        setAdminDetailOpen(true);
        setAdminDetailLoading(true);
        try {
            const token = localStorage.getItem('dadwork_session_token') || '';
            const params = new URLSearchParams({ user: adminInfo.username, limit: '500' });
            const res = await fetch(`/api/audit-logs?${params}`, {
                headers: { 'x-session-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setAdminDetailLogs(data.logs || []);
                const stat = (data.userStats || []).find((s: any) => s.username === adminInfo.username);
                setAdminDetailStats(stat || null);
            }
        } catch (e) {
            console.error('Failed to load admin detail:', e);
        } finally {
            setAdminDetailLoading(false);
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
                <Tabs value={activeTab || (isSuperAdmin ? "business" : "appearance")} onValueChange={handleTabChange} className="w-full">
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
                        {isSuperAdmin && (
                            <TabsTrigger
                                value="users"
                                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-xl text-[11px] font-bold py-2.5 px-1 gap-1.5 transition-all"
                            >
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                Users
                            </TabsTrigger>
                        )}
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
                    {isSuperAdmin && (
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
                    )}

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
                            <div className="space-y-3">

                                {/* ── Live Online Status Bar ── */}
                                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-emerald-500/8 to-transparent flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/15">
                                                <Wifi className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Who's Online Now</h3>
                                                <p className="text-[10px] text-muted-foreground">Real-time active status for all admins</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await loadOnlineSessions();
                                                await loadUsers();
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-muted/50 transition-all active:scale-90"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        {adminStatusList.length === 0 ? (
                                            <div className="flex items-center gap-2.5 py-2 px-3 bg-muted/20 rounded-xl">
                                                <WifiOff className="w-4 h-4 text-muted-foreground/40" />
                                                <span className="text-xs text-muted-foreground">No admin accounts found</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {adminStatusList.map((s: any, i: number) => {
                                                    const timeString = formatRelativeTime(s.lastSeen);
                                                    return (
                                                        <button key={i} onClick={() => openAdminDetail(s)} className={cn(
                                                            "flex items-center gap-2 border rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 cursor-pointer text-left",
                                                            s.isOnline
                                                                ? "bg-emerald-500/8 border-emerald-500/20 shadow-sm shadow-emerald-500/5 hover:bg-emerald-500/15"
                                                                : "bg-muted/10 border-border/40 hover:bg-muted/30"
                                                        )}>
                                                            <div className="relative">
                                                                {s.avatarUrl ? (
                                                                    <Avatar className={cn("w-7 h-7 shrink-0", s.isOnline ? "border border-emerald-500/20" : "border border-border/50")}>
                                                                        <AvatarImage src={s.avatarUrl} className="object-cover" />
                                                                        <AvatarFallback className="text-[9px] font-black uppercase bg-muted text-muted-foreground">
                                                                            {(s.name || s.username).charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                ) : (
                                                                    <div className={cn(
                                                                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black uppercase",
                                                                        s.isOnline ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground/80"
                                                                    )}>
                                                                        {(s.name || s.username).charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className={cn(
                                                                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
                                                                    s.isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                                                                )} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-foreground leading-tight">{s.name || s.username}</p>
                                                                <p className={cn(
                                                                    "text-[8px] font-black tracking-tight mt-0.5",
                                                                    s.isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70"
                                                                )}>
                                                                    {s.isOnline ? "ONLINE" : (s.lastSeen ? `LAST SEEN: ${s.lastSeen.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}` : timeString.toUpperCase())}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── Per-Admin Activity Cards ── */}
                                {auditUserStats.filter(stat => users.some(u => u.username === stat.username)).length > 0 && (
                                    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                        <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-violet-500/8 to-transparent">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-violet-500/15">
                                                    <Crown className="w-4 h-4 text-violet-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-foreground">Admin Activity Overview</h3>
                                                    <p className="text-[10px] text-muted-foreground">All-time stats per admin</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-border/30">
                                            {auditUserStats.filter(stat => users.some(u => u.username === stat.username)).map((stat: any, i: number) => {
                                                const isOnline = onlineSessions.some((s: any) => s.username === stat.username);
                                                const lastSeen = stat.last_activity ? new Date(stat.last_activity) : null;
                                                const lastLogin = stat.last_login ? new Date(stat.last_login) : null;
                                                const isSelf = stat.username === currentUser?.username;
                                                return (
                                                    <button key={i} onClick={() => openAdminDetail({ username: stat.username, name: stat.name || stat.username, role: stat.role, avatarUrl: stat.avatar_url, isOnline, lastSeen: stat.last_activity ? new Date(stat.last_activity) : undefined })} className="px-4 py-3 flex items-start gap-3 w-full text-left hover:bg-muted/30 active:scale-[0.99] transition-all cursor-pointer">
                                                        <div className="relative shrink-0">
                                                            {stat.avatar_url ? (
                                                                <Avatar className="w-10 h-10 border border-border/50">
                                                                    <AvatarImage src={stat.avatar_url} className="object-cover" />
                                                                    <AvatarFallback className="text-sm font-black bg-muted uppercase">
                                                                        {(stat.name || stat.username).charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black uppercase shadow-sm ${
                                                                    stat.role === 'SUPER_ADMIN'
                                                                        ? 'bg-gradient-to-br from-amber-400/30 to-orange-400/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                                        : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                                }`}>
                                                                    {(stat.name || stat.username).charAt(0)}
                                                                </div>
                                                            )}
                                                            {isOnline && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-xs font-black text-foreground truncate">{stat.name || stat.username}</span>
                                                                {isSelf && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">YOU</span>}
                                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                                                                    stat.role === 'SUPER_ADMIN'
                                                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                                        : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                                                                }`}>{stat.role === 'SUPER_ADMIN' ? '👑 SUPER' : '🛡 ADMIN'}</span>
                                                                {isOnline
                                                                    ? <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">● ONLINE</span>
                                                                    : <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">OFFLINE</span>
                                                                }
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">@{stat.username}</p>
                                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mt-2">
                                                                <div className="bg-muted/40 rounded-lg px-2 py-1.5 text-center">
                                                                    <p className="text-[10px] font-black text-foreground">{stat.login_count}</p>
                                                                    <p className="text-[8px] text-muted-foreground font-bold truncate">Logins</p>
                                                                </div>
                                                                <div className="bg-muted/40 rounded-lg px-2 py-1.5 text-center">
                                                                    <p className="text-[10px] font-black text-foreground">{stat.total_actions}</p>
                                                                    <p className="text-[8px] text-muted-foreground font-bold truncate">Actions</p>
                                                                </div>
                                                                <div className="bg-muted/40 rounded-lg px-2 py-1.5 text-center">
                                                                    <p className="text-[10px] font-black text-foreground">
                                                                        {users.find(u => u.username === stat.username)?.assigned_customer_ids?.length || 0}
                                                                    </p>
                                                                    <p className="text-[8px] text-muted-foreground font-bold truncate">Customers</p>
                                                                </div>
                                                                <div className="bg-muted/40 rounded-lg px-2 py-1.5 text-center">
                                                                    <p className="text-[10px] font-black text-foreground whitespace-nowrap">
                                                                        {(() => {
                                                                            if (!lastLogin) return '-';
                                                                            const end = isOnline ? new Date() : (lastSeen || new Date());
                                                                            const diff = end.getTime() - lastLogin.getTime();
                                                                            if (diff < 0) return '< 1m';
                                                                            const h = Math.floor(diff / 3600000);
                                                                            const m = Math.floor((diff % 3600000) / 60000);
                                                                            return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                                                        })()}
                                                                    </p>
                                                                    <p className="text-[8px] text-muted-foreground font-bold truncate">Time Spent</p>
                                                                </div>
                                                                <div className={`rounded-lg px-2 py-1.5 text-center hidden sm:block ${
                                                                    parseInt(stat.failed_logins) > 0
                                                                        ? 'bg-red-500/10 border border-red-500/20'
                                                                        : 'bg-muted/40'
                                                                }`}>
                                                                    <p className={`text-[10px] font-black ${
                                                                        parseInt(stat.failed_logins) > 0 ? 'text-red-500' : 'text-foreground'
                                                                    }`}>{stat.failed_logins}</p>
                                                                    <p className="text-[8px] text-muted-foreground font-bold truncate">Failed</p>
                                                                </div>
                                                            </div>
                                                            {lastLogin && (
                                                                <div className="flex items-center gap-1 mt-1.5">
                                                                    <Clock className="w-2.5 h-2.5 text-muted-foreground/60" />
                                                                    <span className="text-[9px] text-muted-foreground">
                                                                        Last login: {lastLogin.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {lastSeen && (
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <Eye className="w-2.5 h-2.5 text-muted-foreground/60" />
                                                                    <span className="text-[9px] text-muted-foreground">
                                                                        Last activity: {lastSeen.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Activity Log Feed ── */}
                                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-red-500/5 to-transparent">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-red-500/15">
                                                    <Activity className="w-4 h-4 text-red-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-foreground">Activity Log</h3>
                                                    <p className="text-[10px] text-muted-foreground">{auditTotal} total events recorded forever</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => loadAuditLogs()}
                                                disabled={auditLoading}
                                                className="p-1.5 rounded-lg hover:bg-muted/50 transition-all active:scale-90 disabled:opacity-50"
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${auditLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Filters */}
                                        <div className="flex gap-2 mt-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50" />
                                                <input
                                                    type="text"
                                                    placeholder="Filter by user..."
                                                    value={auditFilterUser}
                                                    onChange={(e) => {
                                                        setAuditFilterUser(e.target.value);
                                                        loadAuditLogs(e.target.value, auditFilterAction);
                                                    }}
                                                    className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-background/50 border border-border/40 rounded-lg outline-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={auditFilterAction}
                                                    onChange={(e) => {
                                                        setAuditFilterAction(e.target.value);
                                                        loadAuditLogs(auditFilterUser, e.target.value);
                                                    }}
                                                    className="pl-3 pr-6 py-1.5 text-[11px] bg-background/50 border border-border/40 rounded-lg outline-none focus:border-primary/50 transition-colors appearance-none"
                                                >
                                                    <option value="">All Actions</option>
                                                    {auditActions.map((a) => (
                                                        <option key={a} value={a}>{a}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-0">
                                        {auditLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading logs...</p>
                                            </div>
                                        ) : auditLogs.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                                                    <Activity className="w-6 h-6 text-muted-foreground/30" />
                                                </div>
                                                <p className="text-sm font-bold text-muted-foreground">No activities logged yet</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">Events will appear here as admins use the system</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border/20 max-h-[55vh] overflow-y-auto">
                                                {auditLogs.map((log: any) => {
                                                    const action = log.action as string;
                                                    const isLogin = action === 'LOGIN';
                                                    const isLogout = action === 'LOGOUT';
                                                    const isFailed = action === 'LOGIN_FAILED';
                                                    const isCreate = action.startsWith('CREATE');
                                                    const isDelete = action.startsWith('DELETE');
                                                    const isUpdate = action.startsWith('UPDATE') || action.startsWith('EDIT');

                                                    const actionColor = isLogin
                                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                        : isLogout
                                                        ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                                                        : isFailed
                                                        ? 'text-red-500 bg-red-500/10 border-red-500/20'
                                                        : isCreate
                                                        ? 'text-violet-500 bg-violet-500/10 border-violet-500/20'
                                                        : isDelete
                                                        ? 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                                                        : isUpdate
                                                        ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                        : 'text-muted-foreground bg-muted border-border/40';

                                                    const ActionIcon = isLogin ? LogIn
                                                        : isLogout ? LogOut
                                                        : isFailed ? AlertTriangle
                                                        : isCreate ? Zap
                                                        : isDelete ? Trash2
                                                        : isUpdate ? Pencil
                                                        : Activity;

                                                    return (
                                                        <div key={log.id} className="px-4 py-3 hover:bg-muted/10 transition-colors flex gap-3 items-start">
                                                            {/* Avatar */}
                                                            {log.avatar_url ? (
                                                                <Avatar className="w-8 h-8 shrink-0 mt-0.5 border border-border/50">
                                                                    <AvatarImage src={log.avatar_url} className="object-cover" />
                                                                    <AvatarFallback className="text-xs font-black uppercase bg-muted">
                                                                        {(log.name || log.username || '?').charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/10">
                                                                    <span className="text-xs font-black text-primary uppercase">
                                                                        {(log.name || log.username || '?').charAt(0)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0">
                                                                {/* Top row */}
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-[11px] font-black text-foreground">
                                                                            {log.name || log.username}
                                                                        </span>
                                                                        {log.role === 'SUPER_ADMIN' && (
                                                                            <Crown className="w-3 h-3 text-amber-500" />
                                                                        )}
                                                                        <span className="text-[9px] text-muted-foreground">@{log.username}</span>
                                                                    </div>
                                                                    <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">
                                                                        {new Date(log.created_at).toLocaleDateString('en-GB', {
                                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                                            hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>

                                                                {/* Action badge + details */}
                                                                <div className="flex items-start gap-2 mt-1.5 flex-wrap">
                                                                    <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md border shrink-0 ${actionColor}`}>
                                                                        <ActionIcon className="w-2.5 h-2.5" />
                                                                        {action.replace(/_/g, ' ')}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground leading-relaxed">{log.details}</span>
                                                                </div>

                                                                {/* IP info */}
                                                                {log.ip_address && log.ip_address !== 'unknown' && (
                                                                    <p className="text-[9px] text-muted-foreground/50 mt-1">📍 {log.ip_address}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {isSuperAdmin && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => {
                            setMotherNameVal('');
                            setPhoneVal('');
                            setBirthYearVal('');
                            setClearHistoryStep(1);
                            setIsClearHistoryOpen(true);
                        }}
                        className="text-[9px] tracking-wide uppercase text-muted-foreground/35 hover:text-red-500 hover:bg-red-500/5 px-2.5 py-1 rounded-md transition-all font-bold border border-transparent hover:border-red-500/10 active:scale-95 duration-200 cursor-pointer animate-fade-in"
                    >
                        Clear All History Customer
                    </button>
                </div>
            )}

            {/* ── Clear Ledger History Dialog ── */}
            <Dialog open={isClearHistoryOpen} onOpenChange={setIsClearHistoryOpen}>
                <DialogContent className="bg-card border-border/50 max-w-[95vw] sm:max-w-md rounded-2xl p-0 overflow-hidden shadow-2xl">
                    <div className="bg-card/95 backdrop-blur-xl border-b border-border/40 px-4 py-3">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground text-sm font-black">
                                <Shield className="w-4 h-4 text-destructive animate-pulse" />
                                Clear Customer Ledger History
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-[10px]">
                                Security verification is required to clear all customer ledger history.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-4 space-y-4">
                        {clearHistoryStep === 1 ? (
                            <div className="space-y-3.5">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">
                                        1. What is your mother's name?
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter mother's name"
                                        value={motherNameVal}
                                        onChange={(e) => setMotherNameVal(e.target.value)}
                                        className="bg-background/50 border-border/50 rounded-xl h-10 text-xs animate-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">
                                        2. Fill in the blank: what is the full phone number matching 06******75?
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="06xxxxxxxx"
                                        value={phoneVal}
                                        onChange={(e) => setPhoneVal(e.target.value)}
                                        className="bg-background/50 border-border/50 rounded-xl h-10 text-xs font-mono animate-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">
                                        3. Which year were you born?
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="YYYY"
                                        value={birthYearVal}
                                        onChange={(e) => setBirthYearVal(e.target.value)}
                                        className="bg-background/50 border-border/50 rounded-xl h-10 text-xs animate-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsClearHistoryOpen(false)}
                                        className="border-border/50 rounded-xl font-bold h-10 text-xs active:scale-95 transition-all"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleVerifyConditions}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold rounded-xl h-10 text-xs active:scale-95 transition-all"
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex flex-col items-center text-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse animate-duration-1000">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-red-500 uppercase tracking-wider">
                                            ⚠️ VERY IMPORTANT & HIGH RISK ⚠️
                                        </p>
                                        <p className="text-[11px] text-foreground font-semibold mt-2 leading-relaxed">
                                            This is a high-risk operation! Deleting all customer ledger history (maqalka ledger) is PERMANENT and CANNOT be undone.
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                                            All customer ledger balances will be reset to $0. Note that Daily Book records (buuga maalinlaha) and customer profiles themselves are safe and will not be affected.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setClearHistoryStep(1)}
                                        className="border-border/50 rounded-xl font-bold h-10 text-xs active:scale-95 transition-all"
                                        disabled={isClearingHistory}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleClearLedgerHistory}
                                        className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl h-10 text-xs flex items-center justify-center shadow-lg shadow-red-600/15 active:scale-95 transition-all"
                                        disabled={isClearingHistory}
                                    >
                                        {isClearingHistory ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                Clearing...
                                            </>
                                        ) : (
                                            "Yes, Clear All History"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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

            {/* ── Admin Detail Dialog ── */}
            <Dialog open={adminDetailOpen} onOpenChange={setAdminDetailOpen}>
                <DialogContent className="max-w-md w-full rounded-2xl p-0 overflow-hidden border border-border/50 bg-card shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Admin Activity Details</DialogTitle>
                        <DialogDescription>Full activity timeline for {adminDetailUser?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="px-5 pt-5 pb-4 border-b border-border/30 bg-gradient-to-br from-violet-500/8 to-transparent shrink-0">
                            <div className="flex items-center gap-3">
                                {adminDetailUser?.avatarUrl ? (
                                    <Avatar className="w-12 h-12 border-2 border-violet-500/30 shadow-md">
                                        <AvatarImage src={adminDetailUser.avatarUrl} className="object-cover" />
                                        <AvatarFallback className="text-base font-black bg-violet-500/20 text-violet-600 dark:text-violet-400 uppercase">
                                            {(adminDetailUser?.name || '?').charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 flex items-center justify-center text-lg font-black text-violet-600 dark:text-violet-400 border border-violet-500/30 shadow-md uppercase">
                                        {(adminDetailUser?.name || '?').charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-black text-foreground text-sm truncate">{adminDetailUser?.name}</span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                                            adminDetailUser?.role === 'SUPER_ADMIN'
                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                                        }`}>{adminDetailUser?.role === 'SUPER_ADMIN' ? '👑 SUPER' : '🛡 ADMIN'}</span>
                                        {adminDetailUser?.isOnline
                                            ? <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">● ONLINE</span>
                                            : <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">OFFLINE</span>
                                        }
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">@{adminDetailUser?.username}</p>
                                    {adminDetailUser?.lastSeen && (
                                        <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                                            Last active: {adminDetailUser.lastSeen.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stats Row */}
                            {adminDetailStats && (
                                <div className="grid grid-cols-5 gap-2 mt-4">
                                    <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/30 flex flex-col justify-center">
                                        <p className="text-sm font-black text-foreground">{adminDetailStats.login_count}</p>
                                        <p className="text-[8px] text-muted-foreground font-bold truncate">Logins</p>
                                    </div>
                                    <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/30 flex flex-col justify-center">
                                        <p className="text-sm font-black text-foreground">{adminDetailStats.total_actions}</p>
                                        <p className="text-[8px] text-muted-foreground font-bold truncate">Actions</p>
                                    </div>
                                    <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/30 flex flex-col justify-center">
                                        <p className="text-sm font-black text-foreground">
                                            {users.find(u => u.username === adminDetailUser?.username)?.assigned_customer_ids?.length || 0}
                                        </p>
                                        <p className="text-[8px] text-muted-foreground font-bold truncate">Customers</p>
                                    </div>
                                    <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/30 flex flex-col justify-center">
                                        <p className="text-sm font-black text-foreground whitespace-nowrap">
                                            {(() => {
                                                const lastLogin = adminDetailStats.last_login ? new Date(adminDetailStats.last_login) : null;
                                                const lastSeen = adminDetailUser?.lastSeen ? new Date(adminDetailUser.lastSeen) : null;
                                                if (!lastLogin) return '-';
                                                const end = adminDetailUser?.isOnline ? new Date() : (lastSeen || new Date());
                                                const diff = end.getTime() - lastLogin.getTime();
                                                if (diff < 0) return '< 1m';
                                                const h = Math.floor(diff / 3600000);
                                                const m = Math.floor((diff % 3600000) / 60000);
                                                return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                            })()}
                                        </p>
                                        <p className="text-[8px] text-muted-foreground font-bold truncate">Time Spent</p>
                                    </div>
                                    <div className={`rounded-xl p-2.5 text-center border flex flex-col justify-center ${
                                        parseInt(adminDetailStats.failed_logins) > 0
                                            ? 'bg-red-500/10 border-red-500/20'
                                            : 'bg-background/60 border-border/30'
                                    }`}>
                                        <p className={`text-sm font-black ${
                                            parseInt(adminDetailStats.failed_logins) > 0 ? 'text-red-500' : 'text-foreground'
                                        }`}>{adminDetailStats.failed_logins}</p>
                                        <p className="text-[8px] text-muted-foreground font-bold truncate">Failed</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Activity Feed */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-4 py-3 border-b border-border/20 sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Activity Timeline</p>
                            </div>

                            {adminDetailLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : adminDetailLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
                                        <Activity className="w-6 h-6 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">No activity yet</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Events will appear here as they use the system</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/20">
                                    {adminDetailLogs.map((log: any) => {
                                        const action = log.action as string;
                                        const isLogin = action === 'LOGIN';
                                        const isLogout = action === 'LOGOUT';
                                        const isFailed = action === 'LOGIN_FAILED';
                                        const logDate = new Date(log.created_at);
                                        return (
                                            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                                    isLogin ? 'bg-emerald-500/15 border border-emerald-500/20'
                                                        : isLogout ? 'bg-slate-500/15 border border-slate-500/20'
                                                        : isFailed ? 'bg-red-500/15 border border-red-500/20'
                                                        : 'bg-violet-500/15 border border-violet-500/20'
                                                }`}>
                                                    {isLogin ? <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                                                        : isLogout ? <LogOut className="w-3.5 h-3.5 text-slate-500" />
                                                        : isFailed ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                        : <Zap className="w-3.5 h-3.5 text-violet-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground">{log.action}</p>
                                                    {log.details && <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed truncate">{log.details}</p>}
                                                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                                                        {logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {logDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                        {log.ip_address && <span className="ml-2 px-1 py-0.5 bg-muted rounded text-[8px]">{log.ip_address}</span>}
                                                        {log.user_agent && <span className="ml-1 px-1 py-0.5 bg-muted rounded text-[8px] truncate max-w-[120px] inline-block align-bottom" title={log.user_agent}>{log.user_agent.split(' ')[0]}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
