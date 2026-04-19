// src/pages/Admin/Users/AdminUsers.tsx
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/admin/dialog';
import { Search, MoreVertical, ShieldAlert, Trash2, Ban, CheckCircle, Users, Building2, UserCheck, UserX, Shield, Hotel, Map, User } from 'lucide-react';
import { type MockUser } from '@/mocks/users';
import { userApi } from '@/api/userApi';
import { useToast } from '@/contexts/ToastContext';

const AdminUsers = () => {
    const { success } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog state
    const [actionUser, setActionUser] = useState<MockUser | null>(null);
    const [dialogType, setDialogType] = useState<'block' | 'unblock' | 'delete' | 'promote' | 'approve' | 'reject' | null>(null);
    const [selectedNewRole, setSelectedNewRole] = useState<string>('');

    const [users, setUsers] = useState<MockUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userApi.getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to load users", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filter users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        providers: users.filter(u => u.role === 'provider').length,
        users: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.status === 'active').length,
        blocked: users.filter(u => u.status === 'blocked').length,
        pending: users.filter(u => u.status === 'pending').length,
    }), [users]);

    const getRoleBadge = (role: string, type?: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">
                        <Shield className="w-3.5 h-3.5" /> Quản trị viên
                    </span>
                );
            case 'provider':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                        {type === 'hotel' ? <Hotel className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />} Chủ dịch vụ
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5" /> Người dùng
                    </span>
                );
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') {
            return <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-green-500 dark:bg-green-600/20 text-white dark:text-green-500 border border-transparent dark:border-green-600/30">Hoạt động</span>;
        } else if (status === 'pending') {
            return <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">Chờ duyệt</span>;
        } else {
            return <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400">Bị khóa</span>;
        }
    };

    const openDialog = (user: MockUser, type: 'block' | 'unblock' | 'delete' | 'promote' | 'approve' | 'reject') => {
        setActionUser(user);
        setDialogType(type);
        if (type === 'promote') {
            setSelectedNewRole(user.role === 'provider' ? `provider_${user.providerType || 'hotel'}` : user.role);
        }
    };

    const closeDialog = () => {
        setActionUser(null);
        setDialogType(null);
    };

    const confirmAction = async () => {
        if (!actionUser) return;

        try {
            if (dialogType === 'block') {
                await userApi.updateUserStatus(actionUser.id, 'blocked');
                setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'blocked' } : u));
                success(`Tài khoản ${actionUser.name} đã bị khóa.`);
            } else if (dialogType === 'unblock') {
                await userApi.updateUserStatus(actionUser.id, 'active');
                setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'active' } : u));
                success(`Tài khoản ${actionUser.name} đã được mở khóa.`);
            } else if (dialogType === 'delete') {
                await userApi.deleteUser(actionUser.id);
                setUsers(prev => prev.filter(u => u.id !== actionUser.id));
                success(`Tài khoản ${actionUser.name} đã bị xóa vĩnh viễn.`);
            } else if (dialogType === 'promote') {
                let roleName = 'Khách hàng';
                let roleEnum: 'admin' | 'provider' | 'user' = 'user';
                if (selectedNewRole === 'provider_hotel' || selectedNewRole === 'provider_tour') {
                    roleEnum = 'provider';
                    roleName = selectedNewRole === 'provider_hotel' ? 'Chủ dịch vụ (Khách sạn)' : 'Chủ dịch vụ (Tour)';
                } else if (selectedNewRole === 'admin') {
                    roleEnum = 'admin';
                    roleName = 'Quản trị viên';
                }
                await userApi.updateUserRole(actionUser.id, roleEnum);
                setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, role: roleEnum, providerType: selectedNewRole === 'provider_hotel' ? 'hotel' : selectedNewRole === 'provider_tour' ? 'tour' : undefined } : u));
                success(`Đã thay đổi vai trò của ${actionUser.name} thành ${roleName}.`);
            } else if (dialogType === 'approve') {
                await userApi.updateUserStatus(actionUser.id, 'active');
                setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'active' } : u));
                success(`Đã duyệt tài khoản Chủ dịch vụ cho ${actionUser.name}.`);
            } else if (dialogType === 'reject') {
                await userApi.deleteUser(actionUser.id); // Or block? We'll delete for reject
                setUsers(prev => prev.filter(u => u.id !== actionUser.id));
                success(`Đã từ chối yêu cầu đăng ký Chủ dịch vụ của ${actionUser.name}.`);
            }
            closeDialog();
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    // const handleRoleChange = (userId: number, newRoleValue: string) => {
    //     const user = MOCK_USERS_DATA.find(u => u.id === userId);
    //     if (!user) return;

    //     let roleName = 'Khách hàng';
    //     if (newRoleValue === 'provider_hotel') roleName = 'Chủ dịch vụ (Khách sạn)';
    //     if (newRoleValue === 'provider_tour') roleName = 'Chủ dịch vụ (Tour)';
    //     if (newRoleValue === 'admin') roleName = 'Quản trị viên';

    //     // Optional: Can add a standard browser confirm here if needed
    //     // if (!window.confirm(`Bạn có chắc muốn đổi vai trò của ${user.name} thành ${roleName}?`)) return;

    //     success(`Đã cập nhật vai trò của ${user.name} thành ${roleName} thành công.`);
    //     // In a real app, this would trigger an API call and then update the local state/re-fetch
    // };

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý tài khoản, vai trò và quyền truy cập trong hệ thống
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-full flex-shrink-0">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Tổng người dùng</span>
                        <div className="text-2xl font-bold leading-tight mt-1">{stats.total}</div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">{stats.active} hoạt động</p>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3.5 rounded-full flex-shrink-0">
                        <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Chủ dịch vụ</span>
                        <div className="text-2xl font-bold leading-tight mt-1">{stats.providers}</div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{stats.pending} đang chờ duyệt</p>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-teal-100 dark:bg-teal-900/30 p-3.5 rounded-full flex-shrink-0">
                        <UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Người dùng cá nhân</span>
                        <div className="text-2xl font-bold leading-tight mt-1">{stats.users}</div>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">Khách hàng đặt vé</p>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3.5 rounded-full flex-shrink-0">
                        <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Bị khóa</span>
                        <div className="text-2xl font-bold leading-tight mt-1">{stats.blocked}</div>
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">Từ chối truy cập</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-[160px] cursor-pointer">
                                <SelectValue placeholder="Tất cả vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="cursor-pointer">Tất cả vai trò</SelectItem>
                                <SelectItem value="admin" className="cursor-pointer">Quản trị viên</SelectItem>
                                <SelectItem value="provider" className="cursor-pointer">Chủ dịch vụ</SelectItem>
                                <SelectItem value="user" className="cursor-pointer">Người dùng</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[160px] cursor-pointer">
                                <SelectValue placeholder="Tất cả trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="cursor-pointer">Tất cả trạng thái</SelectItem>
                                <SelectItem value="active" className="cursor-pointer">Hoạt động</SelectItem>
                                <SelectItem value="pending" className="cursor-pointer">Chờ duyệt</SelectItem>
                                <SelectItem value="blocked" className="cursor-pointer">Bị khóa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap pl-6">Người dùng</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">Vai trò</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">Trạng thái</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">Đăng ký</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap text-center">Đăng nhập cuối</TableHead>
                                <TableHead className="text-right font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Không tìm thấy người dùng phù hợp
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-700">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            {/* Render simple badge if current user is admin to prevent self-demotion, otherwise render interactive inline Select
                                            {user.role === 'admin' ? (
                                                getRoleBadge(user.role, user.providerType)
                                            ) : (
                                                <Select
                                                    defaultValue={user.role === 'provider' ? `provider_${user.providerType || 'hotel'}` : user.role}
                                                    onValueChange={(val) => handleRoleChange(user.id, val)}
                                                >
                                                    <SelectTrigger className="w-fit border-none shadow-none bg-transparent hover:bg-gray-50 focus:ring-0 mx-auto px-2 py-1 h-auto cursor-pointer flex gap-1 items-center justify-center min-w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent align="center">
                                                        <SelectItem value="user" className="cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-gray-500" /> Người dùng
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="provider_hotel" className="cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <Hotel className="w-4 h-4 text-blue-500" /> Chủ Khách sạn
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="provider_tour" className="cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <Map className="w-4 h-4 text-blue-500" /> Chủ Tour
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="admin" className="cursor-pointer text-purple-600 font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4" /> Quản trị viên
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )} */}
                                            {getRoleBadge(user.role, user.providerType)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {getStatusBadge(user.status)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                                            {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                                            {new Date(user.lastLogin).toLocaleString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {user.role !== 'admin' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="cursor-pointer">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        {user.status === 'pending' && user.role === 'provider' ? (
                                                            <>
                                                                <DropdownMenuItem className="gap-2 cursor-pointer transition-colors hover:bg-green-50 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/40" onClick={() => openDialog(user, 'approve')}>
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Duyệt tài khoản
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2 cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/40" onClick={() => openDialog(user, 'reject')}>
                                                                    <Ban className="w-4 h-4" />
                                                                    Từ chối duyệt
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Removed 'Đổi Vai Trò' from dropdown as it is now inline */}
                                                                <DropdownMenuItem
                                                                    className={`gap-2 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${user.status === 'active' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
                                                                    onClick={() => openDialog(user, user.status === 'active' ? 'block' : 'unblock')}
                                                                >
                                                                    {user.status === 'active' ? (
                                                                        <>
                                                                            <Ban className="w-4 h-4" />
                                                                            Khóa tài khoản
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="w-4 h-4" />
                                                                            Mở khóa tài khoản
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                            </>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="gap-2 text-destructive cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-red-900/40 focus:bg-red-50 dark:focus:bg-red-900/40 dark:text-red-400"
                                                            onClick={() => openDialog(user, 'delete')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Xóa tài khoản
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
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground font-medium">
                Hiển thị {filteredUsers.length} / {users.length} tài khoản
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={!!actionUser} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'block' && 'Khóa tài khoản'}
                            {dialogType === 'unblock' && 'Mở khóa tài khoản'}
                            {dialogType === 'delete' && 'Xóa tài khoản'}
                            {dialogType === 'promote' && 'Thay đổi vai trò'}
                            {dialogType === 'approve' && 'Duyệt Chủ dịch vụ'}
                            {dialogType === 'reject' && 'Từ chối Chủ dịch vụ'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogType === 'block' && `Bạn có chắc chắn muốn khóa tài khoản "${actionUser?.name}"? Người dùng này sẽ không thể đăng nhập vào hệ thống.`}
                            {dialogType === 'unblock' && `Bạn có muốn mở khóa cho tài khoản "${actionUser?.name}"?`}
                            {dialogType === 'delete' && `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${actionUser?.name}"? Hành động này không thể hoàn tác.`}
                            {dialogType === 'promote' && `Vui lòng chọn vai trò mới mà bạn muốn cấp cho tài khoản "${actionUser?.name}".`}
                            {dialogType === 'approve' && `Bạn đang duyệt cho tài khoản "${actionUser?.name}" làm Chủ dịch vụ.`}
                            {dialogType === 'reject' && `Bạn có chắc chắn muốn từ chối yêu cầu làm Chủ dịch vụ của "${actionUser?.name}" không?`}
                        </DialogDescription>
                    </DialogHeader>

                    {dialogType === 'promote' && (
                        <div className="py-2 space-y-2">
                            <label className="text-sm font-medium text-foreground">Vai trò / Quyền hạn:</label>
                            <Select value={selectedNewRole} onValueChange={setSelectedNewRole}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user" className="cursor-pointer">Khách hàng</SelectItem>
                                    <SelectItem value="provider_hotel" className="cursor-pointer">Chủ dịch vụ (Khách sạn)</SelectItem>
                                    <SelectItem value="provider_tour" className="cursor-pointer">Chủ dịch vụ (Tour)</SelectItem>
                                    <SelectItem value="admin" className="cursor-pointer font-medium text-purple-600">Quản trị viên hệ thống</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Detailed Provider Info Section for Approval */}
                    {(dialogType === 'approve' || dialogType === 'reject') && actionUser && (
                        <div className="bg-muted p-4 rounded-lg border border-border text-sm space-y-3 mb-2 mt-4">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground font-medium">Họ và tên:</span>
                                <span className="col-span-2 font-semibold">{actionUser.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground font-medium">Email:</span>
                                <span className="col-span-2">{actionUser.email}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground font-medium">SĐT:</span>
                                <span className="col-span-2">{(actionUser as any).phone || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground font-medium">Loại dịch vụ:</span>
                                <span className="col-span-2">
                                    {getRoleBadge('provider', actionUser.providerType)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={closeDialog} className="cursor-pointer">
                            Hủy bỏ
                        </Button>
                        <Button
                            variant={dialogType === 'delete' || dialogType === 'block' || dialogType === 'reject' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                            className={`cursor-pointer ${dialogType === 'unblock' || dialogType === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : ''} ${dialogType === 'promote' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
                        >
                            Xác nhận
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;
