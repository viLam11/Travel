// src/pages/ServiceProvider/Dashboard/DashBoardPage.tsx
import React, { useState } from 'react';
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
  Calendar, 
  Banknote, // Đã thay thế DollarSign bằng Banknote
  Users, 
  Eye, 
  Edit,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Briefcase,
} from 'lucide-react';

// Import Chart Components
import RevenueByServiceChart from '@/components/ui/admin/charts/RevenueByServiceChart';
import BookingTrendsChart from '@/components/ui/admin/charts/BookingTrendsChart';
import TopProvidersChart from '@/components/ui/admin/charts/TopProvidersChart';
import BookingStatusChart from '@/components/ui/admin/charts/BookingStatusChart';
import PopularDestinationsChart from '@/components/ui/admin/charts/PopularDestinationsChart';
import MonthlyRevenueChart from '@/components/ui/admin/charts/MonthlyRevenueChart';

// Import Data
import {
  bookingsData,
  revenueByServiceData,
  bookingTrendsData,
  topProvidersData,
  bookingStatusData,
  popularDestinationsData,
  monthlyRevenueData,
  type Booking,
} from '@/data/dashboardData';

// --- Utility: Hàm định dạng tiền tệ VND ---
const formatCurrency = (value: number | string) => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Stats Card Component
function StatsCard({ stat }: { stat: any }) {
  const Icon = stat.icon;
  const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = stat.trend === 'up' ? 'text-chart-2' : 'text-destructive';

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-2xl font-bold mb-2">{stat.value}</p>
            {stat.change && (
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">{stat.change}</span>
                <span className="text-muted-foreground">so với hôm qua</span>
              </div>
            )}
          </div>
          <div className={`${stat.iconBg} p-4 rounded-xl`}>
            <Icon className={`w-6 h-6 ${stat.color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Bookings Table Component
function BookingsTable({ data }: { data: Booking[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 hover:text-foreground font-semibold"
        >
          Mã đặt chỗ
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "guest",
      header: "Tên khách",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-sm font-medium text-accent-foreground">
              {(row.getValue("guest") as string).charAt(0)}
            </span>
          </div>
          <span>{row.getValue("guest")}</span>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: "Dịch vụ",
      cell: ({ row }) => <span className="font-medium">{row.getValue("service")}</span>,
    },
    {
      accessorKey: "serviceType",
      header: "Loại hình",
      cell: ({ row }) => {
        const type = row.getValue("serviceType") as string;
        return (
          <Badge 
            className={type === "hotel" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
          >
            {type === "hotel" ? "Khách sạn" : "Vé tham quan"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "checkIn",
      header: "Ngày nhận/đi",
      cell: ({ row }) => {
        const date = new Date(row.getValue("checkIn"));
        return <span>{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      accessorKey: "checkOut",
      header: "Ngày trả/về",
      cell: ({ row }) => {
        const date = new Date(row.getValue("checkOut"));
        return <span>{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      accessorKey: "guests",
      header: "Số khách",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{row.getValue("guests")}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Tổng tiền",
      cell: ({ row }) => {
        const amount = row.getValue("amount");
        return <span className="font-semibold">{formatCurrency(amount as number)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusConfig = {
          confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Đã xác nhận" },
          pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ xử lý" },
          cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
          completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Hoàn thành" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
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
      cell: () => (
        <div className="flex gap-1">
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Sửa đơn đặt"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
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
        pageSize: 8,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm đơn đặt..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-64"
        />
        <div className="text-sm text-muted-foreground">
          Hiển thị {table.getRowModel().rows.length} trên tổng số {data.length} đơn
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
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

// Main Dashboard Component
export default function TravelServicesDashboard() {
  const stats = [
    {
      title: "Tổng đơn đặt hôm nay",
      value: "143",
      icon: Calendar,
      color: "text-chart-1",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Dịch vụ đang hoạt động",
      value: "68",
      icon: Briefcase,
      color: "text-chart-2",
      iconBg: "bg-green-100 dark:bg-green-950",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Doanh thu hôm nay",
      value: "617.500.000 ₫",
      icon: Banknote, // Sử dụng icon Banknote
      color: "text-chart-3",
      iconBg: "bg-yellow-100 dark:bg-yellow-950",
      change: "+23%",
      trend: "up",
    },
    {
      title: "Nhà cung cấp dịch vụ",
      value: "89",
      icon: Users,
      color: "text-chart-4",
      iconBg: "bg-purple-100 dark:bg-purple-950",
      change: "+8",
      trend: "up",
    },
  ];

  return (
    <div className="w-full space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold"></h1>
          <p className="text-muted-foreground mt-1">Chào mừng trở lại! Dưới đây là tổng quan về nền tảng dịch vụ của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            Tạo đơn mới
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueByServiceChart data={revenueByServiceData} />
        </div>
        <div className="lg:col-span-1">
          <BookingTrendsChart data={bookingTrendsData} />
        </div>
      </div>

      {/* Charts Section - Row 2
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <TopProvidersChart data={topProvidersData} />
        </div>
        <div className="xl:col-span-1">
          <BookingStatusChart data={bookingStatusData} />
        </div>
        <div className="xl:col-span-1">
          <PopularDestinationsChart data={popularDestinationsData} />
        </div>
      </div> */}

      {/* Charts Section - Row 3
      <div className="grid grid-cols-1">
        <MonthlyRevenueChart data={monthlyRevenueData} />
      </div> */}

      {/* Recent Bookings Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Đơn đặt gần đây</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Quản lý và theo dõi tất cả các đơn đặt dịch vụ</p>
          </div>
          <Button variant="outline" size="sm">
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent>
          <BookingsTable data={bookingsData} />
        </CardContent>
      </Card>
    </div>
  );
}