// src/pages/Admin/Services/AdminServiceList.tsx
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
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
import { Search, MoreVertical, Eye, Edit, Check, X, Trash2, Hotel, MapPin, Layers, Activity, Clock, FileText } from 'lucide-react';
import { MOCK_SERVICES, type MockService } from '@/mocks/services';
import { useToast } from '@/contexts/ToastContext';

const AdminServiceList = () => {
    const { success, info } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedService, setSelectedService] = useState<MockService | null>(null);
    const [dialogType, setDialogType] = useState<'view' | 'edit' | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Stats
    const stats = useMemo(() => ({
        total: MOCK_SERVICES.length,
        active: MOCK_SERVICES.filter(s => s.status === 'active').length,
        pending: MOCK_SERVICES.filter(s => s.status === 'pending').length,
        draft: MOCK_SERVICES.filter(s => s.status === 'draft').length,
        hotels: MOCK_SERVICES.filter(s => s.type === 'hotel').length,
        tours: MOCK_SERVICES.filter(s => s.type === 'tour').length,
    }), []);

    // Helper functions (removed badges as they are styled inline now)

    const handleApprove = (service: MockService) => {
        // TODO: Update service status in mock data
        success(`Đã duyệt dịch vụ: ${service.name}`);
    };

    const handleReject = (service: MockService) => {
        info(`Đã từ chối dịch vụ: ${service.name}`);
    };

    const handleDelete = (service: MockService) => {
        setSelectedService(service);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (selectedService) {
            success(`Đã xóa dịch vụ: ${selectedService.name}`);
            setIsDeleteOpen(false);
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Dịch vụ</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Xem xét và quản lý các dịch vụ do nhà cung cấp tạo
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tổng Dịch vụ</span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                            <Layers className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2 relative z-10">{stats.total}</span>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full opacity-0 group-hover:opacity-50 pointer-events-none group-hover:scale-150 transition-all duration-500 ease-out"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hoạt động</span>
                        <div className="p-2 bg-green-50 dark:bg-green-900/40 rounded-lg text-green-600 dark:text-green-400">
                            <Activity className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2 relative z-10">{stats.active}</span>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full opacity-0 group-hover:opacity-50 pointer-events-none group-hover:scale-150 transition-all duration-500 ease-out"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Chờ xử lý</span>
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/40 rounded-lg text-orange-600 dark:text-orange-400">
                            <Clock className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2 relative z-10">{stats.pending}</span>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full opacity-0 group-hover:opacity-50 pointer-events-none group-hover:scale-150 transition-all duration-500 ease-out"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nháp</span>
                        <div className="p-2 bg-red-50 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2 relative z-10">{stats.draft}</span>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-50 pointer-events-none group-hover:scale-150 transition-all duration-500 ease-out"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Khách sạn</span>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Hotel className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2 relative z-10">{stats.hotels}</span>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full opacity-0 group-hover:opacity-50 pointer-events-none group-hover:scale-150 transition-all duration-500 ease-out"></div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tour</span>
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/40 rounded-lg text-teal-600 dark:text-teal-400">
                            <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2 relative z-10">{stats.tours}</span>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-50 dark:bg-teal-900/20 rounded-full opacity-0 group-hover:opacity-50 pointer-events-none group-hover:scale-150 transition-all duration-500 ease-out"></div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <Input
                            placeholder="Tìm kiếm theo tên, địa điểm, hoặc nhà cung cấp..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors dark:text-white"
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full md:w-[150px] bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 dark:text-white">
                                <SelectValue placeholder="Tất cả loại" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                <SelectItem value="all" className="dark:text-gray-200 dark:focus:bg-gray-700">Tất cả loại</SelectItem>
                                <SelectItem value="hotel" className="dark:text-gray-200 dark:focus:bg-gray-700">Khách sạn</SelectItem>
                                <SelectItem value="tour" className="dark:text-gray-200 dark:focus:bg-gray-700">Tour</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full md:w-[160px] bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 dark:text-white">
                                <SelectValue placeholder="Tất cả trạng thái" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                <SelectItem value="all" className="dark:text-gray-200 dark:focus:bg-gray-700">Tất cả trạng thái</SelectItem>
                                <SelectItem value="active" className="dark:text-gray-200 dark:focus:bg-gray-700">Hoạt động</SelectItem>
                                <SelectItem value="pending" className="dark:text-gray-200 dark:focus:bg-gray-700">Chờ xử lý</SelectItem>
                                <SelectItem value="inactive" className="dark:text-gray-200 dark:focus:bg-gray-700">Không hoạt động</SelectItem>
                                <SelectItem value="draft" className="dark:text-gray-200 dark:focus:bg-gray-700">Nháp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Services Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Dịch vụ</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Loại</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Nhà cung cấp</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Địa điểm</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Giá</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Trạng thái</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Đặt chỗ</TableHead>
                                <TableHead className="font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Đánh giá</TableHead>
                                <TableHead className="text-right font-semibold text-gray-800 dark:text-gray-300 whitespace-nowrap">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground dark:text-gray-400">
                                        Không tìm thấy dịch vụ nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedServices.map((service) => (
                                    <TableRow key={service.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">{service.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm text-gray-700 dark:text-gray-300">
                                                {service.type === 'hotel' ? <Hotel className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                {service.type === 'hotel' ? 'Hotel' : 'Tour'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {service.provider.name}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">{service.location}</TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {service.price.toLocaleString('vi-VN')} ₫
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${service.status === 'active' ? 'bg-[#3b82f6] text-white dark:bg-blue-600' :
                                                service.status === 'pending' ? 'bg-[#1e293b] text-white dark:bg-slate-700' :
                                                    service.status === 'inactive' ? 'bg-white border dark:bg-transparent dark:border-gray-600 text-gray-600 dark:text-gray-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                }`}>
                                                {service.status === 'active' ? 'Hoạt động' :
                                                    service.status === 'pending' ? 'Chờ xử lý' :
                                                        service.status === 'inactive' ? 'Không hoạt động' : 'Nháp'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 font-medium">{service.totalBookings}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-yellow-400 text-sm">★</span>
                                                <span className="mt-0.5">{service.rating}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="dark:hover:bg-gray-700 cursor-pointer">
                                                        <MoreVertical className="w-4 h-4 dark:text-gray-300" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                    <DropdownMenuLabel className="font-semibold text-gray-800 dark:text-gray-200">Hành động</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                    <DropdownMenuItem
                                                        className="gap-2 focus:bg-gray-100 dark:focus:bg-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
                                                        onClick={() => { setSelectedService(service); setDialogType('view'); }}>
                                                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="gap-2 focus:bg-gray-100 dark:focus:bg-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
                                                        onClick={() => { setSelectedService(service); setDialogType('edit'); }}>
                                                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    {service.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                            <DropdownMenuItem
                                                                className="gap-2 text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-900/20 dark:text-green-500 cursor-pointer transition-colors"
                                                                onClick={() => handleApprove(service)}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Duyệt
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 text-yellow-600 focus:text-yellow-700 focus:bg-yellow-50 dark:focus:bg-yellow-900/20 dark:text-yellow-500 cursor-pointer transition-colors"
                                                                onClick={() => handleReject(service)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Từ chối
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 dark:text-red-500 cursor-pointer transition-colors"
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
                </div>

                {filteredServices.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị <span className="font-medium text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredServices.length)}</span> trong <span className="font-medium text-gray-900 dark:text-white">{filteredServices.length}</span> kết quả
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="h-8 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white border-gray-200 dark:border-gray-700 cursor-pointer disabled:cursor-not-allowed"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Trang trước
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white border-gray-200 dark:border-gray-700 cursor-pointer disabled:cursor-not-allowed"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Trang sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                hiển thị {filteredServices.length} trên {MOCK_SERVICES.length} dịch vụ
            </div>

            {/* Modal Dialog */}
            <Dialog open={!!dialogType} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">
                            {dialogType === 'view' ? 'Chi tiết Dịch vụ' : 'Chỉnh sửa Dịch vụ'}
                        </DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            {selectedService?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {dialogType === 'view' && selectedService && (
                        <div className="space-y-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong className="font-semibold text-gray-900 dark:text-gray-100">Nhà cung cấp:</strong> {selectedService.provider.name}</p>
                            <p><strong className="font-semibold text-gray-900 dark:text-gray-100">Loại hình:</strong> {selectedService.type === 'hotel' ? 'Khách sạn' : 'Tour'}</p>
                            <p><strong className="font-semibold text-gray-900 dark:text-gray-100">Địa điểm:</strong> {selectedService.location}</p>
                            <p><strong className="font-semibold text-gray-900 dark:text-gray-100">Trạng thái:</strong> {selectedService.status === 'active' ? 'Hoạt động' : selectedService.status === 'pending' ? 'Chờ xử lý' : 'Ngưng hoạt động'}</p>
                            <p><strong className="font-semibold text-gray-900 dark:text-gray-100">Đánh giá chung:</strong> {selectedService.rating} Sao</p>
                            <p><strong className="font-semibold text-gray-900 dark:text-gray-100">Số lượt đặt:</strong> {selectedService.totalBookings}</p>
                        </div>
                    )}
                    {dialogType === 'edit' && selectedService && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên dịch vụ</label>
                                <Input defaultValue={selectedService.name} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa điểm</label>
                                <Input defaultValue={selectedService.location} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => setDialogType(null)}>Hủy</Button>
                                <Button className="cursor-pointer" onClick={() => { success('Đã lưu các thay đổi!'); setDialogType(null); }}>Lưu thay đổi</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Modal Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Xóa Dịch Vụ</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Bạn có chắc chắn muốn xóa dịch vụ <strong className="text-gray-900 dark:text-white">{selectedService?.name}</strong> không?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" className="cursor-pointer" onClick={confirmDelete}>
                            Xóa ngay
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminServiceList;
