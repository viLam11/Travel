// src/pages/Admin/Users/AdminUsers.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Badge } from '@/components/ui/admin/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/admin/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/admin/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/admin/dropdown-menu';
import { Search, MoreVertical, Shield, ShieldAlert, User, Trash2, Ban, CheckCircle } from 'lucide-react';
import { MOCK_USERS_DATA, type MockUser } from '@/mocks/users';

const AdminUsers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter users
    const filteredUsers = useMemo(() => {
        return MOCK_USERS_DATA.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [searchQuery, roleFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: MOCK_USERS_DATA.length,
        admins: MOCK_USERS_DATA.filter(u => u.role === 'admin').length,
        providers: MOCK_USERS_DATA.filter(u => u.role === 'provider').length,
        users: MOCK_USERS_DATA.filter(u => u.role === 'user').length,
        active: MOCK_USERS_DATA.filter(u => u.status === 'active').length,
        blocked: MOCK_USERS_DATA.filter(u => u.status === 'blocked').length,
    }), []);

    const getRoleBadge = (role: string, type?: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-purple-600">Admin</Badge>;
            case 'provider':
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1">
                        {type === 'hotel' ? '🏨' : '🗺️'} Provider
                    </Badge>
                );
            default:
                return <Badge variant="secondary">User</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-600">Active</Badge>
        ) : (
            <Badge variant="destructive">Blocked</Badge>
        );
    };

    const handleBlockUser = (user: MockUser) => {
        const action = user.status === 'active' ? 'block' : 'unblock';
        if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            console.log(`${action} user:`, user.id);
            alert(`User ${user.name} has been ${action}ed.`);
        }
    };

    const handleDeleteUser = (user: MockUser) => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            console.log('Delete user:', user.id);
            alert(`User ${user.name} has been deleted.`);
        }
    };

    const handlePromoteUser = (user: MockUser) => {
        alert(`Promote/Demote functionality mock for ${user.name}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                <p className="text-muted-foreground mt-1">
                    Manage system users, roles, and permissions
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <User className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.active} active accounts
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Providers</CardTitle>
                        <Shield className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.providers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Partners
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <User className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Regular users
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blocked</CardTitle>
                        <Ban className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Restricted access
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="provider">Provider</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(user.role, user.providerType)}</TableCell>
                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(user.lastLogin).toLocaleString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.role !== 'admin' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2" onClick={() => handlePromoteUser(user)}>
                                                            <ShieldAlert className="w-4 h-4" />
                                                            Change Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`gap-2 ${user.status === 'active' ? 'text-orange-600' : 'text-green-600'}`}
                                                            onClick={() => handleBlockUser(user)}
                                                        >
                                                            {user.status === 'active' ? (
                                                                <>
                                                                    <Ban className="w-4 h-4" />
                                                                    Block Access
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Unblock
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="gap-2 text-destructive"
                                                            onClick={() => handleDeleteUser(user)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete Account
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {MOCK_USERS_DATA.length} users
            </div>
        </div>
    );
};

export default AdminUsers;
