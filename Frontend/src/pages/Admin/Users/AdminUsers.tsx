// src/pages/Admin/Users/AdminUsers.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/admin/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/admin/avatar';
import { Badge } from '@/components/ui/admin/badge';
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
import { 
    Search, 
    Trash2, 
    Ban, 
    CheckCircle, 
    Users, 
    Building2, 
    UserCheck, 
    UserX, 
    Shield, 
    Hotel, 
    Map, 
    User, 
    Mail, 
    Calendar, 
    MoreHorizontal,
    Loader2,
    XCircle,
    Check
} from 'lucide-react';
import { type MockUser } from '@/mocks/users';
import { userApi } from '@/api/userApi';
import { useToast } from '@/contexts/ToastContext';

// --- Stats Card Component ---
function StatsCard({ title, value, subValue, icon: Icon, color, bg }: any) {
    return (
        <Card className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    {subValue && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

const AdminUsers = () => {
    const { success, error: toastError } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog state
    const [actionUser, setActionUser] = useState<MockUser | null>(null);
    const [dialogType, setDialogType] = useState<'block' | 'unblock' | 'delete' | 'promote' | 'approve' | 'reject' | null>(null);
    const [selectedNewRole, setSelectedNewRole] = useState<string>('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const data = await userApi.getAllUsers();
            return data.map((u: any) => ({
                id: u.userID !== undefined && u.userID !== null ? u.userID : u.id,
                name: u.fullname || u.username || 'Anonymous',
                email: u.email,
                avatar: u.avatarUrl,
                role: (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? 'admin' : (u.role?.includes('PROVIDER') ? 'provider' : 'user')) as 'admin' | 'provider' | 'user',
                status: (u.active ? 'active' : 'blocked') as "active" | "pending" | "blocked",
                joinDate: u.createdAt || new Date().toISOString(),
                lastLogin: u.lastLoginAt || new Date().toISOString(),
                phone: u.phone,
                providerType: (u.role === 'PROVIDER_HOTEL' ? 'hotel' : u.role === 'PROVIDER_VENUE' ? 'tour' : undefined) as "hotel" | "tour" | undefined
            }));
        },
        staleTime: 0, // Luôn hiển thị cache ngay lập tức, sau đó chạy ngầm API lấy dữ liệu mới nhất
    });

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
        providers: users.filter(u => u.role === 'provider').length,
        users: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.status === 'active').length,
        blocked: users.filter(u => u.status === 'blocked').length,
        pending: users.filter(u => u.status === 'pending').length,
    }), [users]);

    const getRoleBadge = (role: string, type?: string) => {
        const r = role.toLowerCase();
        if (r === 'admin') {
            return (
                <Badge className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700 border-none">
                    <Shield className="w-3 h-3 mr-1" /> Quản trị
                </Badge>
            );
        } else if (r.includes('provider')) {
            const isVenue = r.includes('venue') || type === 'tour' || type === 'venue';
            return (
                <Badge className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700 border-none">
                    {isVenue ? <Map className="w-3 h-3 mr-1" /> : <Hotel className="w-3 h-3 mr-1" />} Đối tác
                </Badge>
            );
        } else {
            return (
                <Badge className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700 border-none">
                    <User className="w-3 h-3 mr-1" /> Khách hàng
                </Badge>
            );
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') {
            return <Badge className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border-none">Hoạt động</Badge>;
        } else if (status === 'pending') {
            return <Badge className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 border-none">Chờ duyệt</Badge>;
        } else {
            return <Badge className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-700 border-none">Đã khóa</Badge>;
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
        setIsActionLoading(false);
    };

    const confirmAction = async () => {
        if (!actionUser) return;
        setIsActionLoading(true);

        try {
            if (dialogType === 'block') {
                await userApi.updateUserStatus(actionUser.id, 'blocked');
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                success(`Tài khoản ${actionUser.name} đã bị khóa.`);
            } else if (dialogType === 'unblock') {
                await userApi.updateUserStatus(actionUser.id, 'active');
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                success(`Tài khoản ${actionUser.name} đã được mở khóa.`);
            } else if (dialogType === 'delete') {
                await userApi.deleteUser(actionUser.id);
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                success(`Tài khoản ${actionUser.name} đã bị xóa vĩnh viễn.`);
            } else if (dialogType === 'promote') {
                let roleEnum = 'USER';
                if (selectedNewRole === 'provider_hotel') roleEnum = 'PROVIDER_HOTEL';
                else if (selectedNewRole === 'provider_tour') roleEnum = 'PROVIDER_VENUE';
                else if (selectedNewRole === 'admin') roleEnum = 'ADMIN';
                
                await userApi.updateUserRole(actionUser.id, roleEnum);
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                success(`Đã thay đổi vai trò của ${actionUser.name} thành công.`);
            } else if (dialogType === 'approve') {
                await userApi.updateUserStatus(actionUser.id, 'active');
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                success(`Đã duyệt tài khoản cho ${actionUser.name}.`);
            } else if (dialogType === 'reject') {
                await userApi.deleteUser(actionUser.id);
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                success(`Đã từ chối đăng ký của ${actionUser.name}.`);
            }
            closeDialog();
        } catch (error) {
            console.error("Action failed", error);
            toastError("Thao tác thất bại. Vui lòng thử lại.");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý người dùng</h1>
                    <p className="text-sm text-muted-foreground mt-1">Tìm kiếm, phân quyền và quản trị tài khoản người dùng trên toàn hệ thống.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-sm h-9">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Xác minh tài khoản
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Tổng người dùng" 
                    value={stats.total} 
                    subValue={`${stats.active} đang hoạt động`}
                    icon={Users} 
                    color="text-blue-600" 
                    bg="bg-blue-100" 
                />
                <StatsCard 
                    title="Chủ dịch vụ" 
                    value={stats.providers} 
                    subValue={`${stats.pending} chờ phê duyệt`}
                    icon={Building2} 
                    color="text-indigo-600" 
                    bg="bg-indigo-100" 
                />
                <StatsCard 
                    title="Khách hàng" 
                    value={stats.users} 
                    subValue="Sử dụng dịch vụ"
                    icon={UserCheck} 
                    color="text-emerald-600" 
                    bg="bg-emerald-100" 
                />
                <StatsCard 
                    title="Tài khoản khóa" 
                    value={stats.blocked} 
                    subValue="Vi phạm chính sách"
                    icon={UserX} 
                    color="text-rose-600" 
                    bg="bg-rose-100" 
                />
            </div>

            <Card className="shadow-sm overflow-hidden border-border/40">
                <CardHeader className="bg-muted/20 border-b border-border/40 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                         <div className="flex bg-gray-100 p-1.5 rounded-xl w-fit">
                            {['all', 'admin', 'provider', 'user'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setRoleFilter(tab)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide cursor-pointer ${
                                        roleFilter === tab
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab === 'all' ? 'Tất cả' : tab === 'admin' ? 'Quản trị' : tab === 'provider' ? 'Đối tác' : 'Khách hàng'}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Tìm tên, email..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-11 w-full md:w-80 rounded-xl bg-white border-gray-200 shadow-sm"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-11 w-full md:w-[160px] rounded-xl bg-white border-gray-200 cursor-pointer">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all" className="cursor-pointer">Mọi trạng thái</SelectItem>
                                    <SelectItem value="active" className="cursor-pointer">Hoạt động</SelectItem>
                                    <SelectItem value="pending" className="cursor-pointer">Chờ duyệt</SelectItem>
                                    <SelectItem value="blocked" className="cursor-pointer">Đã khóa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/30 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Người dùng</th>
                                    <th className="px-8 py-5">Vai trò</th>
                                    <th className="px-8 py-5">Trạng thái</th>
                                    <th className="px-8 py-5">Ngày đăng ký</th>
                                    <th className="px-8 py-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6"><div className="h-12 bg-gray-50 rounded-xl w-full" /></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Users className="w-16 h-16" />
                                                <p className="text-xl font-bold italic">Không tìm thấy người dùng</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-11 h-11 rounded-2xl border-none shadow-sm">
                                                        <AvatarImage src={user.avatar} className="object-cover" />
                                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg rounded-2xl">{user.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</div>
                                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="w-3 h-3" /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {getRoleBadge(user.role, user.providerType)}
                                            </td>
                                            <td className="px-8 py-6">
                                                {getStatusBadge(user.status)}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {user.role !== 'admin' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 cursor-pointer">
                                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-56">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-3 py-2">Thao tác tài khoản</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="bg-gray-50" />
                                                            
                                                            {user.status === 'pending' && user.role === 'provider' ? (
                                                                <>
                                                                    <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5 text-emerald-600 font-bold focus:bg-emerald-50" onClick={() => openDialog(user, 'approve')}>
                                                                        <CheckCircle className="w-4 h-4" /> Duyệt đối tác
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5 text-rose-600 font-bold focus:bg-rose-50" onClick={() => openDialog(user, 'reject')}>
                                                                        <XCircle className="w-4 h-4" /> Từ chối đăng ký
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5 font-bold focus:bg-amber-50 text-amber-600" onClick={() => openDialog(user, 'promote')}>
                                                                        <Shield className="w-4 h-4" /> Thay đổi vai trò
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5 font-bold focus:bg-gray-50 text-gray-700" onClick={() => openDialog(user, user.status === 'active' ? 'block' : 'unblock')}>
                                                                        {user.status === 'active' ? (
                                                                            <><Ban className="w-4 h-4 text-rose-500" /> Khóa truy cập</>
                                                                        ) : (
                                                                            <><Check className="w-4 h-4 text-emerald-500" /> Mở khóa tài khoản</>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            <DropdownMenuSeparator className="bg-gray-50" />
                                                            <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5 font-bold text-rose-600 focus:bg-rose-50" onClick={() => openDialog(user, 'delete')}>
                                                                <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiển thị {filteredUsers.length} / {users.length} tài khoản</span>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold cursor-pointer" disabled>Trước</Button>
                             <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold cursor-pointer">Tiếp theo</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={!!actionUser} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8 overflow-hidden">
                    <DialogHeader className="space-y-4">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2 ${
                            dialogType === 'delete' || dialogType === 'block' || dialogType === 'reject' ? 'bg-rose-100 text-rose-600' : 
                            dialogType === 'promote' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                            {dialogType === 'delete' && <Trash2 className="w-10 h-10" />}
                            {dialogType === 'block' && <Ban className="w-10 h-10" />}
                            {dialogType === 'unblock' && <Check className="w-10 h-10" />}
                            {dialogType === 'promote' && <Shield className="w-10 h-10" />}
                            {dialogType === 'approve' && <CheckCircle className="w-10 h-10" />}
                            {dialogType === 'reject' && <XCircle className="w-10 h-10" />}
                        </div>
                        <DialogTitle className="text-2xl font-black text-center">
                            {dialogType === 'block' && 'Khóa tài khoản'}
                            {dialogType === 'unblock' && 'Mở khóa tài khoản'}
                            {dialogType === 'delete' && 'Xóa tài khoản'}
                            {dialogType === 'promote' && 'Thay đổi vai trò'}
                            {dialogType === 'approve' && 'Phê duyệt đối tác'}
                            {dialogType === 'reject' && 'Từ chối phê duyệt'}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base font-medium">
                            {dialogType === 'block' && `Tài khoản "${actionUser?.name}" sẽ không thể truy cập hệ thống sau khi bị khóa.`}
                            {dialogType === 'unblock' && `Khôi phục quyền truy cập cho tài khoản "${actionUser?.name}".`}
                            {dialogType === 'delete' && `Xác nhận xóa vĩnh viễn tài khoản "${actionUser?.name}"? Hành động này không thể hoàn tác.`}
                            {dialogType === 'promote' && `Cấp quyền hạn mới cho tài khoản "${actionUser?.name}".`}
                            {dialogType === 'approve' && `Xác nhận phê duyệt tài khoản đối tác cho "${actionUser?.name}".`}
                            {dialogType === 'reject' && `Từ chối yêu cầu đăng ký đối tác của "${actionUser?.name}".`}
                        </DialogDescription>
                    </DialogHeader>

                    {dialogType === 'promote' && (
                        <div className="py-6 space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Chọn vai trò mới</label>
                            <Select value={selectedNewRole} onValueChange={setSelectedNewRole}>
                                <SelectTrigger className="h-12 rounded-2xl border-gray-200 bg-gray-50 font-bold cursor-pointer">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                    <SelectItem value="user" className="rounded-xl font-bold py-3 cursor-pointer">Khách hàng Travello</SelectItem>
                                    <SelectItem value="provider_hotel" className="rounded-xl font-bold py-3 cursor-pointer">Chủ khách sạn (Đối tác)</SelectItem>
                                    <SelectItem value="provider_tour" className="rounded-xl font-bold py-3 cursor-pointer">Chủ tour du lịch (Đối tác)</SelectItem>
                                    <SelectItem value="admin" className="rounded-xl font-black py-3 cursor-pointer text-purple-600 focus:bg-purple-50">Quản trị viên hệ thống</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(dialogType === 'approve' || dialogType === 'reject') && actionUser && (
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4 my-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12 rounded-2xl">
                                    <AvatarImage src={actionUser.avatar} />
                                    <AvatarFallback>{actionUser.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{actionUser.name}</p>
                                    <p className="text-xs text-muted-foreground">{actionUser.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                                <span className="text-xs font-bold text-gray-500 uppercase">Phân loại đăng ký</span>
                                {getRoleBadge('provider', actionUser.providerType)}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" onClick={closeDialog} className="flex-1 h-12 rounded-2xl font-bold cursor-pointer">
                            Quay lại
                        </Button>
                        <Button
                            variant={dialogType === 'delete' || dialogType === 'block' || dialogType === 'reject' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                            disabled={isActionLoading}
                            className={`flex-1 h-12 rounded-2xl font-bold shadow-lg cursor-pointer ${
                                dialogType === 'unblock' || dialogType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 
                                dialogType === 'promote' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 
                                'shadow-rose-600/20'
                            }`}
                        >
                            {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận thao tác'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;
