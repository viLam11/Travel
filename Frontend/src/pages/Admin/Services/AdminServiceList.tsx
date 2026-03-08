// src/pages/Admin/Services/AdminServiceList.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Badge } from '@/components/ui/admin/badge';
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
import { Search, MoreVertical, Eye, Edit, Check, X, Trash2, Hotel, MapPin } from 'lucide-react';
import { MOCK_SERVICES, type MockService } from '@/mocks/services';

const AdminServiceList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter and search services
    const filteredServices = useMemo(() => {
        return MOCK_SERVICES.filter(service => {
            const matchesSearch =
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.provider.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === 'all' || service.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchQuery, typeFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: MOCK_SERVICES.length,
        active: MOCK_SERVICES.filter(s => s.status === 'active').length,
        pending: MOCK_SERVICES.filter(s => s.status === 'pending').length,
        draft: MOCK_SERVICES.filter(s => s.status === 'draft').length,
        hotels: MOCK_SERVICES.filter(s => s.type === 'hotel').length,
        tours: MOCK_SERVICES.filter(s => s.type === 'tour').length,
    }), []);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            active: { variant: 'default', label: 'Hoạt động' },
            pending: { variant: 'secondary', label: 'Chờ xử lý' },
            inactive: { variant: 'outline', label: 'Không hoạt động' },
            draft: { variant: 'secondary', label: 'Nháp', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
        };
        const config = variants[status] || variants.active;
        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        return type === 'hotel' ? (
            <Badge variant="outline" className="gap-1">
                <Hotel className="w-3 h-3" />
                Hotel
            </Badge>
        ) : (
            <Badge variant="outline" className="gap-1">
                <MapPin className="w-3 h-3" />
                Tour
            </Badge>
        );
    };

    const handleApprove = (service: MockService) => {
        console.log('Approve service:', service.id);
        // TODO: Update service status in mock data
        alert(`Approved: ${service.name}`);
    };

    const handleReject = (service: MockService) => {
        console.log('Reject service:', service.id);
        alert(`Rejected: ${service.name}`);
    };

    const handleDelete = (service: MockService) => {
        if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
            console.log('Delete service:', service.id);
            alert(`Deleted: ${service.name}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý Dịch vụ</h1>
                <p className="text-muted-foreground mt-1">
                    Xem xét và quản lý các dịch vụ do nhà cung cấp tạo
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Dịch vụ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nháp</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Khách sạn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.hotels}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tours}</div>
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
                                placeholder="Tìm kiếm theo tên, địa điểm, hoặc nhà cung cấp..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Loại Dịch vụ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại</SelectItem>
                                <SelectItem value="hotel">Khách sạn</SelectItem>
                                <SelectItem value="tour">Tour</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="inactive">Không hoạt động</SelectItem>
                                <SelectItem value="draft">Nháp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Services Table */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dịch vụ</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead>Địa điểm</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Đặt chỗ</TableHead>
                                <TableHead>Đánh giá</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No services found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredServices.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">{service.name}</TableCell>
                                        <TableCell>{getTypeBadge(service.type)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {service.provider.name}
                                        </TableCell>
                                        <TableCell className="text-sm">{service.location}</TableCell>
                                        <TableCell className="font-medium">
                                            {service.price.toLocaleString('vi-VN')} ₫
                                        </TableCell>
                                        <TableCell>{getStatusBadge(service.status)}</TableCell>
                                        <TableCell>{service.totalBookings}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span>{service.rating}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2">
                                                        <Edit className="w-4 h-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    {service.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="gap-2 text-green-600"
                                                                onClick={() => handleApprove(service)}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Duyệt
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 text-yellow-600"
                                                                onClick={() => handleReject(service)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Từ chối
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive"
                                                        onClick={() => handleDelete(service)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                Showing {filteredServices.length} of {MOCK_SERVICES.length} services
            </div>
        </div>
    );
};

export default AdminServiceList;
