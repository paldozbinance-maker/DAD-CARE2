'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { UserCog, Plus, Shield, User, Trash2, Search, UserPlus } from 'lucide-react';
import { SecurityVerificationDialog } from '@/components/security-verification-dialog';
import { PriorityTracker } from '@/components/priority-tracker';

interface UserData {
    id: string;
    username: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER';
    is_active: boolean;
    created_at: string;
}

export default function UsersPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        name: '',
        password: '123',
        role: 'CUSTOMER' as 'ADMIN' | 'CUSTOMER'
    });
    const [pendingSecurityAction, setPendingSecurityAction] = useState<{ userId: string, username: string } | null>(null);

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setUsers(data);
            }
        } catch (e) {
            console.error('Failed to load users:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {}
        }
        loadUsers();
    }, []);

    const handleCreateUser = async () => {
        if (!newUser.username || !newUser.name) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                toast.success('User created successfully');
                setNewUser({ username: '', name: '', password: '123', role: 'CUSTOMER' });
                setIsDialogOpen(false);
                loadUsers();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to create user');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const handleToggleAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`User ${newRole === 'ADMIN' ? 'promoted to Admin' : 'set as Customer'}`);
                loadUsers();
            } else {
                toast.error('Failed to update user role');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const handleDeleteUser = (userId: string, username: string) => {
        setPendingSecurityAction({ userId, username });
    };

    const executeDeleteUser = async () => {
        if (!pendingSecurityAction) return;
        const { userId } = pendingSecurityAction;
        setPendingSecurityAction(null);

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('User deleted');
                loadUsers();
            } else {
                toast.error('Failed to delete user');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
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

    return (
        <div className="space-y-6 max-w-3xl mx-auto w-full px-1 md:px-0">
            <SecurityVerificationDialog
                isOpen={!!pendingSecurityAction}
                onOpenChange={(open) => {
                    if (!open) setPendingSecurityAction(null);
                }}
                onConfirm={executeDeleteUser}
                title="Delete User"
                description={`Permanently delete user "${pendingSecurityAction?.username}"?`}
            />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
                        Users
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {loading ? 'Loading...' : `${users.length} users registered`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <PriorityTracker />
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Add New User
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">Username *</Label>
                                <Input
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    placeholder="Enter username"
                                    className="bg-background border-input focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Full Name *</Label>
                                <Input
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="bg-background border-input focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Password</Label>
                                <Input
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Default: 123"
                                    className="bg-background border-input focus:border-primary"
                                />
                                <p className="text-xs text-muted-foreground">Leave blank for default password (123)</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <Label className="text-foreground">Admin Role</Label>
                                </div>
                                <Switch
                                    checked={newUser.role === 'ADMIN'}
                                    onCheckedChange={checked => setNewUser({ ...newUser, role: checked ? 'ADMIN' : 'CUSTOMER' })}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1 border-border"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateUser}
                                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Create User
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-input focus:border-primary"
                />
            </div>

            {/* Users Table */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <UserCog className="w-5 h-5 text-primary" />
                        User Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-foreground font-medium">No users found</p>
                            <p className="text-muted-foreground text-sm mt-1">Create a user or add customers to get started</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-muted/50">
                                    <TableHead className="text-muted-foreground font-semibold">Username</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Name</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Role</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Admin</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => (
                                    <TableRow key={user.id} className="border-border hover:bg-muted/30">
                                        <TableCell className="font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                                                    {user.role === 'ADMIN' ? (
                                                        <Shield className="w-4 h-4 text-amber-500" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-primary" />
                                                    )}
                                                </div>
                                                {user.username}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.name || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${user.role === 'ADMIN'
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                : 'bg-primary/10 text-primary border border-primary/20'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={user.role === 'ADMIN'}
                                                onCheckedChange={() => handleToggleAdmin(user.id, user.role)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
