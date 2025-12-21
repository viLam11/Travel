// src/pages/ServiceProvider/Rooms/RoomManagementPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/admin/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin/table';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/admin/dialog';
import { Label } from '@/components/ui/admin/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/admin/select';
import { Calendar } from '@/components/ui/admin/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/admin/popover';
import {
  Filter,
  Plus,
  Eye,
  Edit,
  Wifi,
  Tv,
  Coffee,
  Bath,
  CalendarIcon,
  Search,
  MoreHorizontal,
  Users,
  Settings,
  Power,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- Interfaces Mới (Đơn giản hóa trạng thái) ---

interface RoomCategory {
  id: string;
  name: string;
  totalRooms: number;
  // Trạng thái hiển thị sản phẩm: Đang bán hoặc Tạm ẩn
  status: 'active' | 'stopped'; 
  price: string;
  amenities: string[];
}

interface Booking {
  id: string;
  guest: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  source: string;
}

// --- Components ---

// Card hiển thị Loại phòng (Đã cập nhật logic)
function RoomCategoryCard({ category }: { category: RoomCategory }) {
  // Cấu hình trạng thái đơn giản
  const statusConfig = {
    active: { 
      color: 'bg-green-500', 
      badge: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      label: 'Đang hoạt động',
      icon: CheckCircle2
    },
    stopped: { 
      color: 'bg-gray-400', 
      badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      label: 'Ngừng cung cấp',
      icon: Ban
    },
  };

  const config = statusConfig[category.status];
  const StatusIcon = config.icon;

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'TV': Tv,
    'Coffee': Coffee,
    'Bath': Bath,
  };

  return (
    <Card className={`shadow-sm hover:shadow-md transition-all duration-200 border-sidebar-border bg-card ${category.status === 'stopped' ? 'opacity-75' : ''}`}>
      <CardContent className="p-5">
        {/* Header: Tên và Menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.color} shadow-sm`} />
            <div>
              <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
              <p className="text-sm text-muted-foreground">Tổng: {category.totalRooms} phòng</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-sidebar-accent">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Trạng thái hiển thị</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-green-600 focus:text-green-700">
                <Power className="w-4 h-4 mr-2" />
                Mở bán lại
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <Ban className="w-4 h-4 mr-2" />
                Ngừng cung cấp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Thông tin chính */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent/50 border border-sidebar-border/50">
             <div className="flex items-center gap-2">
                <Badge className={`${config.badge} font-medium border`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {config.label}
                </Badge>
             </div>
             <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium uppercase">Giá niêm yết</p>
                <p className="font-bold text-lg text-primary">{category.price}</p>
             </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Users className="w-4 h-4" />
             <span>Sức chứa tiêu chuẩn: 2 người lớn</span>
          </div>

          <div className="flex gap-2 pt-1">
            {category.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity];
              return Icon ? (
                <div 
                  key={amenity} 
                  className="p-2 bg-sidebar-accent rounded-md text-sidebar-accent-foreground" 
                  title={amenity}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-sidebar-border">
          <Button variant="outline" size="sm" className="flex-1 hover:bg-sidebar-accent border-sidebar-border">
            <Eye className="w-4 h-4 mr-1.5" />
            Chi tiết
          </Button>
          <Button variant="default" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-1.5" />
            Sửa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Dialog tạo đặt phòng mới (Giữ nguyên logic)
function NewBookingDialog() {
  const [date, setDate] = useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Tạo đặt phòng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-popover border-sidebar-border">
        <DialogHeader>
          <DialogTitle>Tạo đặt phòng mới</DialogTitle>
          <DialogDescription>
            Tạo booking thủ công cho khách vãng lai hoặc đặt qua điện thoại.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="guest-name">Tên khách hàng</Label>
            <Input id="guest-name" placeholder="Nguyễn Văn A" className="bg-input border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room-type">Loại phòng</Label>
            <Select>
              <SelectTrigger id="room-type" className="bg-input border-border">
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="std">Standard</SelectItem>
                <SelectItem value="dlx">Deluxe</SelectItem>
                <SelectItem value="ste">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nhận phòng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start border-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Trả phòng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start border-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Chọn ngày
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Xác nhận đặt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Page
export default function RoomManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Dữ liệu mẫu Hạng phòng (Chỉ còn active/stopped)
  const roomCategories: RoomCategory[] = [
    {
      id: '1',
      name: 'Standard Room',
      totalRooms: 20,
      status: 'active', // Đang hiển thị cho khách đặt
      price: '1.200.000₫',
      amenities: ['WiFi', 'TV', 'Coffee'],
    },
    {
      id: '2',
      name: 'Deluxe Room',
      totalRooms: 10,
      status: 'active',
      price: '2.500.000₫',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '3',
      name: 'Executive Suite',
      totalRooms: 5,
      status: 'stopped', // Chủ nhà tắt loại phòng này (ví dụ đang sửa chữa cả tầng)
      price: '4.500.000₫',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '4',
      name: 'Family Bungalow',
      totalRooms: 3,
      status: 'active',
      price: '3.200.000₫',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
  ];

  const bookings: Booking[] = [
    { id: 'BK001', guest: 'Trần Văn Bảo', roomType: 'Standard Room', checkIn: '20/01/2025', checkOut: '23/01/2025', guests: 2, amount: '3.600.000₫', status: 'confirmed', source: 'Trực tiếp' },
    { id: 'BK002', guest: 'Nguyễn Thị Mai', roomType: 'Deluxe Room', checkIn: '22/01/2025', checkOut: '25/01/2025', guests: 1, amount: '7.500.000₫', status: 'pending', source: 'Booking.com' },
  ];

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý hạng phòng</h1>
            <p className="text-muted-foreground mt-1.5">
              Thiết lập thông tin các loại phòng và trạng thái mở bán
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-sidebar-border hover:bg-sidebar-accent">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </Button>
            <NewBookingDialog />
          </div>
        </div>
      </div>

      <Tabs defaultValue="room-status" className="w-full">
        <TabsList className="bg-muted border border-sidebar-border">
          <TabsTrigger value="room-status">Danh sách hạng phòng</TabsTrigger>
          <TabsTrigger value="bookings">Đơn đặt phòng</TabsTrigger>
          <TabsTrigger value="calendar">Lịch biểu</TabsTrigger>
        </TabsList>

        {/* Tab Danh sách hạng phòng */}
        <TabsContent value="room-status" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm loại phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {roomCategories.map((category) => (
              <RoomCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </TabsContent>

        {/* Tab Bookings */}
        <TabsContent value="bookings" className="space-y-4 mt-6">
          <Card className="shadow-sm border-sidebar-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <h3 className="text-xl font-semibold">Đơn đặt gần đây</h3>
                <p className="text-sm text-muted-foreground mt-1">Quản lý booking từ các nguồn</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-sidebar-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-b border-sidebar-border">
                      <TableHead>Mã Đặt</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Loại phòng</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="border-b border-sidebar-border">
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.guest}</TableCell>
                        <TableCell>{booking.roomType}</TableCell>
                        <TableCell className="text-muted-foreground">{booking.checkIn}</TableCell>
                        <TableCell>
                          <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <Card className="shadow-sm border-sidebar-border bg-card">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">Quản lý tồn kho theo ngày</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Tại đây bạn sẽ xem được chi tiết ngày nào "Hết phòng" (Full Slot) dựa trên các đơn đặt thực tế của từng loại phòng.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}