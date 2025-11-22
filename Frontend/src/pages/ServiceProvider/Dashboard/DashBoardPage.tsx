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
  DollarSign, 
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
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            {stat.change && (
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">{stat.change}</span>
                <span className="text-muted-foreground">vs yesterday</span>
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
          Booking ID
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "guest",
      header: "Guest Name",
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
      header: "Service",
      cell: ({ row }) => <span className="font-medium">{row.getValue("service")}</span>,
    },
    {
      accessorKey: "serviceType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("serviceType") as string;
        return (
          <Badge 
            className={type === "hotel" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
          >
            {type === "hotel" ? "Hotel" : "Tour"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "checkIn",
      header: "Check-in",
      cell: ({ row }) => {
        const date = new Date(row.getValue("checkIn"));
        return <span>{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      accessorKey: "checkOut",
      header: "Check-out",
      cell: ({ row }) => {
        const date = new Date(row.getValue("checkOut"));
        return <span>{date.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      accessorKey: "guests",
      header: "Guests",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{row.getValue("guests")}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <span className="font-semibold">{row.getValue("amount")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusConfig = {
          confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
          pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
          cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
          completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Completed" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        
        return (
          <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("source")}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex gap-1">
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit Booking"
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
          placeholder="Search bookings..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-64"
        />
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} bookings
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
                    No bookings found
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
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            Next
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
      title: "Total Bookings Today",
      value: "143",
      icon: Calendar,
      color: "text-chart-1",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Services",
      value: "68",
      icon: Briefcase,
      color: "text-chart-2",
      iconBg: "bg-green-100 dark:bg-green-950",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Revenue Today",
      value: "$24,680",
      icon: DollarSign,
      color: "text-chart-3",
      iconBg: "bg-yellow-100 dark:bg-yellow-950",
      change: "+23%",
      trend: "up",
    },
    {
      title: "Service Providers",
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
          <h1 className="text-3xl font-bold">Hotels & Tours Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your services platform.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Charts Section - Row 2 */}
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
      </div>

      {/* Charts Section - Row 3 */}
      <div className="grid grid-cols-1">
        <MonthlyRevenueChart data={monthlyRevenueData} />
      </div>

      {/* Recent Bookings Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Bookings</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all service bookings</p>
          </div>
          <Button variant="outline" size="sm">
            View All Bookings
          </Button>
        </CardHeader>
        <CardContent>
          <BookingsTable data={bookingsData} />
        </CardContent>
      </Card>
    </div>
  );
}