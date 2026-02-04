// src/pages/ServiceProvider/Services/ServiceListPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
    Briefcase,
    Eye,
    Edit,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    Download,
    ToggleLeft,
    ToggleRight,
    Star,
    MapPin,
} from 'lucide-react';
import { serviceApi } from '@/api/serviceApi';
import type { Service, ServiceStatus, ServiceType } from '@/types/service.types';
import toast from 'react-hot-toast';
import ServiceDeleteModal from './components/ServiceDeleteModal';

// Utility: Format currency VND
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Services Table Component
function ServicesTable({
    data,
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
}: {
    data: Service[];
    onView: (service: Service) => void;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
    onToggleStatus: (service: Service) => void;
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');

    const columns: ColumnDef<Service>[] = [
        {
            accessorKey: "thumbnailUrl",
            header: "Ảnh",
            cell: ({ row }) => (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {row.getValue("thumbnailUrl") ? (
                        <img
                            src={row.getValue("thumbnailUrl")}
                            alt={row.original.serviceName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-muted-foreground" />
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "serviceName",
            header: ({ column }) => (
                <button
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center gap-2 hover:text-foreground font-semibold"
                >
                    Tên dịch vụ
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.getValue("serviceName")}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{row.original.province.fullName}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Loại hình",
            cell: ({ row }) => {
                const type = row.getValue("type") as ServiceType;
                return (
                    <Badge className={type === "hotel" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                        {type === "hotel" ? "Khách sạn" : "Vé tham quan"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "averagePrice",
            header: "Giá trung bình",
            cell: ({ row }) => (
                <span className="font-medium">{formatCurrency(row.getValue("averagePrice"))}</span>
            ),
        },
        {
            accessorKey: "rating",
            header: "Đánh giá",
            cell: ({ row }) => {
                const rating = row.getValue("rating") as number | undefined;
                const reviewCount = row.original.reviewCount;
                return (
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">({reviewCount})</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "bookingCount",
            header: "Lượt đặt",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("bookingCount")}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as ServiceStatus;
                const statusConfig = {
                    active: { bg: "bg-green-100", text: "text-green-700", label: "Hoạt động" },
                    inactive: { bg: "bg-muted", text: "text-muted-foreground", label: "Tạm dừng" },
                    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" },
                    rejected: { bg: "bg-red-100", text: "text-red-700", label: "Từ chối" },
                };
                const config = statusConfig[status];

                return (
                    <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Xem chi tiết"
                        onClick={() => onView(row.original)}
                    >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Sửa dịch vụ"
                        onClick={() => onEdit(row.original)}
                    >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={row.original.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        onClick={() => onToggleStatus(row.original)}
                    >
                        {row.original.status === 'active' ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                    </button>
                    <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Xóa dịch vụ"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            ),
        },
    ];

    const filteredData = data.filter(service => {
        if (typeFilter !== 'all' && service.type !== typeFilter) return false;
        if (statusFilter !== 'all' && service.status !== statusFilter) return false;
        return true;
    });

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as ServiceType | 'all')}
                        className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Tất cả loại hình</option>
                        <option value="hotel">Khách sạn</option>
                        <option value="place">Vé tham quan</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | 'all')}
                        className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Hiển thị {table.getRowModel().rows.length} trên tổng số {filteredData.length} dịch vụ
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-muted">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b border-border">
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="text-left p-4 font-semibold text-sm">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-border hover:bg-muted/50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-4 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center p-8 text-muted-foreground">
                                        Không tìm thấy dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount()}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Trước
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Tiếp
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Main Component
export default function ServiceListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    // Fetch services
    const { data: servicesData, isLoading } = useQuery({
        queryKey: ['provider-services'],
        queryFn: () => serviceApi.getProviderServices(),
    });

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: ({ serviceId, status }: { serviceId: string; status: 'active' | 'inactive' }) =>
            serviceApi.toggleServiceStatus(serviceId, status),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái thành công!');
            queryClient.invalidateQueries({ queryKey: ['provider-services'] });
            queryClient.invalidateQueries({ queryKey: ['service-stats'] });
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        },
    });

    const handleView = (service: Service) => {
        // Navigate to service detail page (user view)
        const slug = `${service.id}-${service.serviceName.toLowerCase().replace(/\s+/g, '-')}`;
        navigate(`/destinations/${service.province.fullName}/${service.type}/${slug}`);
    };

    const handleEdit = (service: Service) => {
        navigate(`/admin/services/edit/${service.id}`);
    };

    const handleDelete = (service: Service) => {
        setSelectedService(service);
        setShowDeleteModal(true);
    };

    const handleToggleStatus = (service: Service) => {
        const newStatus = service.status === 'active' ? 'inactive' : 'active';
        toggleStatusMutation.mutate({ serviceId: service.id, status: newStatus });
    };



    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý dịch vụ</h1>
                    <p className="text-muted-foreground mt-1">
                        Tìm kiếm, lọc và quản lý tất cả dịch vụ của bạn • {servicesData?.total || 0} dịch vụ
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </Button>
                    <Button onClick={() => navigate('/admin/services/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm dịch vụ
                    </Button>
                </div>
            </div>

            {/* Services Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
                    <div>
                        <CardTitle className="text-xl font-semibold">Danh sách dịch vụ</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tổng số {servicesData?.total || 0} dịch vụ
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <ServicesTable
                        data={servicesData?.services || []}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                    />
                </CardContent>
            </Card>

            {/* Delete Modal */}
            {selectedService && (
                <ServiceDeleteModal
                    service={selectedService}
                    open={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedService(null);
                    }}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['provider-services'] });
                        queryClient.invalidateQueries({ queryKey: ['service-stats'] });
                        setShowDeleteModal(false);
                        setSelectedService(null);
                    }}
                />
            )}
        </div>
    );
}
