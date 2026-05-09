// src/pages/Admin/Services/AdminServiceList.tsx
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
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
    Eye, 
    Edit, 
    Check, 
    X, 
    Trash2, 
    Hotel, 
    MapPin, 
    Layers, 
    Activity, 
    Clock, 
    FileText, 
    Star, 
    MoreHorizontal,
    Map,
    Loader2,
    XCircle,
    CheckCircle,
    Ban,
    Building2
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import apiClient from '@/services/apiClient';

// --- Stats Card Component ---
function StatsCard({ title, value, icon: Icon, color, bg, trend }: any) {
    return (
        <Card className="bg-card border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs font-bold text-green-600">
                                {trend}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">vs tháng trước</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

const AdminServiceList = () => {
    const { success, info } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [dialogType, setDialogType] = useState<'view' | 'edit' | 'delete' | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.services.getAll();
                const data = Array.isArray(res) ? res : [];
                const mapped = data.map((s: any) => ({
                    id: s.id,
                    name: s.serviceName || 'Unnamed',
                    location: s.address || s.province?.name || 'Chưa rõ',
                    provider: { 
                        name: s.provider?.fullname || s.provider?.username || 'Chưa rõ',
                        email: s.provider?.email 
                    },
                    type: s.serviceType?.toLowerCase() || 'hotel',
                    status: s.status?.toLowerCase() || 'pending',
                    price: s.averagePrice || 0,
                    totalBookings: 0,
                    rating: s.rating || 0,
                    image: s.thumbnailUrl
                }));
                setServices(mapped);
            } catch (error) {
                console.error(error);
                setServices([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter and search services
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch =
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.provider.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === 'all' || service.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchQuery, typeFilter, statusFilter, services]);

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Stats
    const stats = useMemo(() => ({
        total: services.length,
        active: services.filter(s => s.status === 'approved' || s.status === 'active').length,
        pending: services.filter(s => s.status === 'pending').length,
        hotels: services.filter(s => s.type === 'hotel').length,
        tours: services.filter(s => s.type === 'tour').length,
    }), [services]);

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string; className: string; icon: any }> = {
            pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700', icon: Clock },
            active: { label: 'Hoạt động', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            approved: { label: 'Hoạt động', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            rejected: { label: 'Từ chối', className: 'bg-rose-100 text-rose-700', icon: XCircle },
            inactive: { label: 'Ngưng', className: 'bg-gray-100 text-gray-700', icon: Ban },
        };
        const config = (configs as any)[status] || configs.pending;
        const Icon = config.icon;
        return (
            <Badge className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border-none flex items-center gap-1 w-fit ${config.className}`}>
                <Icon className="w-3 h-3" /> {config.label}
            </Badge>
        );
    };

    const handleApprove = async (service: any) => {
        setIsActionLoading(true);
        try {
            await apiClient.post(`/users/${service.id}/handleServiceStatus`, "APPROVED", { headers: { 'Content-Type': 'application/json' }});
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: 'approved' } : s));
            success(`Đã duyệt dịch vụ: ${service.name}`);
        } catch(e) {
            console.error(e);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (service: any) => {
        setIsActionLoading(true);
        try {
            await apiClient.post(`/users/${service.id}/handleServiceStatus`, "REJECTED", { headers: { 'Content-Type': 'application/json' }});
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: 'rejected' } : s));
            info(`Đã từ chối dịch vụ: ${service.name}`);
        } catch(e) {
            console.error(e);
        } finally {
            setIsActionLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedService) return;
        setIsActionLoading(true);
        try {
            await apiClient.services.delete(selectedService.id);
            setServices(prev => prev.filter(s => s.id !== selectedService.id));
            success(`Đã xóa dịch vụ: ${selectedService.name}`);
            setDialogType(null);
        } catch(e) {
            console.error(e);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Danh mục dịch vụ</h1>
                    <p className="text-sm text-muted-foreground mt-1">Quản lý và kiểm soát toàn bộ dịch vụ (Khách sạn, Tour, Điểm đến) trên nền tảng.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-sm h-9">
                        <FileText className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[120px] bg-muted/40 border border-border/40 animate-pulse rounded-xl p-5 flex flex-col justify-between">
                            <div className="w-24 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                            <div className="w-16 h-6 bg-muted-foreground/30 rounded animate-pulse" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatsCard 
                            title="Tổng dịch vụ" 
                            value={stats.total} 
                            icon={Layers} 
                            color="text-blue-600" 
                            bg="bg-blue-100" 
                            trend="+5.2%"
                        />
                        <StatsCard 
                            title="Đang hoạt động" 
                            value={stats.active} 
                            icon={Activity} 
                            color="text-emerald-600" 
                            bg="bg-emerald-100" 
                            trend="+12%"
                        />
                        <StatsCard 
                            title="Chờ kiểm duyệt" 
                            value={stats.pending} 
                            icon={Clock} 
                            color="text-amber-600" 
                            bg="bg-amber-100" 
                        />
                        <StatsCard 
                            title="Khách sạn & Tour" 
                            value={`${stats.hotels} | ${stats.tours}`} 
                            icon={Map} 
                            color="text-indigo-600" 
                            bg="bg-indigo-100" 
                        />
                    </>
                )}
            </div>

            <Card className="shadow-sm overflow-hidden border-border/40">
                <CardHeader className="bg-muted/20 border-b border-border/40 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                             <h2 className="text-lg font-bold text-foreground">Danh sách dịch vụ</h2>
                             <Badge variant="secondary" className="rounded-full">{filteredServices.length}</Badge>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Tìm tên, địa điểm, provider..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 w-full md:w-64 rounded-lg bg-background border-border"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 w-full md:w-[160px] rounded-lg bg-background border-border cursor-pointer">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Mọi trạng thái</SelectItem>
                                    <SelectItem value="approved">Hoạt động</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Dịch vụ</th>
                                    <th className="px-6 py-4">Loại hình</th>
                                    <th className="px-6 py-4">Nhà cung cấp</th>
                                    <th className="px-6 py-4">Địa điểm</th>
                                    <th className="px-6 py-4">Giá niêm yết</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4"><div className="h-8 bg-muted rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : paginatedServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <Layers className="w-12 h-12 text-muted-foreground" />
                                                <p className="text-lg font-medium text-muted-foreground">Không tìm thấy dịch vụ nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedServices.map((service) => (
                                        <tr key={service.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground">{service.name}</div>
                                                    <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                        <span>{service.rating} ({service.totalBookings} lượt đặt)</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="px-2 py-0.5 rounded text-[10px] font-medium border-border">
                                                    {service.type === 'hotel' ? 'Khách sạn' : 'Tour'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-muted-foreground">{service.provider.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {service.location}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-sm">
                                                {service.price.toLocaleString('vi-VN')} ₫
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(service.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Tùy chọn</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => { setSelectedService(service); setDialogType('view'); }}>
                                                            <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setSelectedService(service); setDialogType('edit'); }}>
                                                            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        
                                                        {(service.status === 'pending' || service.status === 'inactive') && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-green-600 focus:text-green-600" onClick={() => handleApprove(service)}>
                                                                    <Check className="w-4 h-4 mr-2" /> Duyệt dịch vụ
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-amber-600 focus:text-amber-600" onClick={() => handleReject(service)}>
                                                                    <X className="w-4 h-4 mr-2" /> Từ chối
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => { setSelectedService(service); setDialogType('delete'); }}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Xóa dịch vụ
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                         <span className="text-xs text-muted-foreground">Hiển thị {paginatedServices.length} / {filteredServices.length} dịch vụ</span>
                         <div className="flex gap-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >Trước</Button>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >Tiếp theo</Button>
                         </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal Dialogs */}
            <Dialog open={!!dialogType} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogContent className="max-w-lg">
                    {dialogType === 'delete' ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Xác nhận xóa</DialogTitle>
                                <DialogDescription>
                                    Bạn có chắc chắn muốn xóa dịch vụ <span className="font-semibold text-foreground">"{selectedService?.name}"</span>?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setDialogType(null)}>Hủy</Button>
                                <Button variant="destructive" onClick={confirmDelete} disabled={isActionLoading}>
                                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận xóa'}
                                </Button>
                            </div>
                        </>
                    ) : dialogType === 'view' ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">{selectedService?.name}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <p className="text-[10px] uppercase text-muted-foreground mb-1">Giá trung bình</p>
                                        <p className="text-lg font-bold">{selectedService?.price.toLocaleString('vi-VN')} ₫</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <p className="text-[10px] uppercase text-muted-foreground mb-1">Đánh giá</p>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <p className="text-lg font-bold">{selectedService?.rating}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Provider: <span className="text-foreground font-semibold">{selectedService?.provider.name}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Địa điểm: <span className="text-foreground font-semibold">{selectedService?.location}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Tổng lượt đặt: <span className="text-foreground font-semibold">{selectedService?.totalBookings}</span>
                                    </p>
                                </div>
                            </div>
                            <Button onClick={() => setDialogType(null)} className="w-full mt-2">Đóng</Button>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Chỉnh sửa dịch vụ</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-muted-foreground ml-1">Tên dịch vụ</label>
                                    <Input defaultValue={selectedService?.name} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-muted-foreground ml-1">Địa điểm</label>
                                    <Input defaultValue={selectedService?.location} />
                                </div>
                                </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <Button variant="outline" onClick={() => setDialogType(null)}>Hủy</Button>
                                <Button onClick={() => { success('Đã lưu thay đổi!'); setDialogType(null); }}>Lưu thay đổi</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminServiceList;
