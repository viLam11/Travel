// src/pages/ServiceProvider/Rooms/RoomManagementPage.tsx
import { useState } from 'react';
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
  CheckCircle2,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- Interfaces Mới (Đơn giản hóa trạng thái) ---

interface Hotel {
  id: string;
  name: string;
  location: string;
}

interface RoomCategory {
  id: string;
  hotelId: string; // NEW: link to hotel
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
      color: 'bg-muted-foreground',
      badge: 'bg-muted text-muted-foreground border-border',
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
  // const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHotelId, setSelectedHotelId] = useState<string>('hotel-1');

  // Mock Hotels Data
  const hotels: Hotel[] = [
    { id: 'hotel-1', name: 'Khách sạn Majestic Sài Gòn', location: 'Hồ Chí Minh' },
    { id: 'hotel-2', name: 'Rex Hotel Saigon', location: 'Hồ Chí Minh' },
    { id: 'hotel-3', name: 'Pullman Saigon Centre', location: 'Hồ Chí Minh' },
  ];

  // Dữ liệu mẫu Hạng phòng (Chỉ còn active/stopped)
  const roomCategories: RoomCategory[] = [
    {
      id: '1',
      hotelId: 'hotel-1',
      name: 'Standard Room',
      totalRooms: 20,
      status: 'active',
      price: '1.200.000₫',
      amenities: ['WiFi', 'TV', 'Coffee'],
    },
    {
      id: '2',
      hotelId: 'hotel-1',
      name: 'Deluxe Room',
      totalRooms: 10,
      status: 'active',
      price: '2.500.000₫',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '3',
      hotelId: 'hotel-1',
      name: 'Executive Suite',
      totalRooms: 5,
      status: 'stopped',
      price: '4.500.000₫',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '4',
      hotelId: 'hotel-2',
      name: 'Superior Room',
      totalRooms: 15,
      status: 'active',
      price: '1.800.000₫',
      amenities: ['WiFi', 'TV', 'Coffee'],
    },
    {
      id: '5',
      hotelId: 'hotel-2',
      name: 'Premium Suite',
      totalRooms: 8,
      status: 'active',
      price: '3.500.000₫',
      amenities: ['WiFi', 'TV', 'Coffee', 'Bath'],
    },
    {
      id: '6',
      hotelId: 'hotel-3',
      name: 'Business Room',
      totalRooms: 25,
      status: 'active',
      price: '2.200.000₫',
      amenities: ['WiFi', 'TV', 'Coffee'],
    },
  ];

  // Filter rooms by selected hotel
  const filteredRoomCategories = roomCategories.filter(
    category => category.hotelId === selectedHotelId
  );

  const bookings: Booking[] = [
    { id: 'BK001', guest: 'Trần Văn Bảo', roomType: 'Standard Room', checkIn: '20/01/2025', checkOut: '23/01/2025', guests: 2, amount: '3.600.000₫', status: 'confirmed', source: 'Trực tiếp' },
    { id: 'BK002', guest: 'Nguyễn Thị Mai', roomType: 'Deluxe Room', checkIn: '22/01/2025', checkOut: '25/01/2025', guests: 1, amount: '7.500.000₫', status: 'pending', source: 'Booking.com' },
  ];

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);

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

        {/* Hotel Selector */}
        <Card className="shadow-sm border-sidebar-border">
          <CardContent className="p-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-6 mb-6">
              {/* Left: Hotel Selection */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Khách sạn đang quản lý</h3>
                    <p className="text-xs text-muted-foreground">Chọn khách sạn để xem chi tiết</p>
                  </div>
                </div>

                <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn khách sạn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{hotel.name}</span>
                          <span className="text-xs text-muted-foreground">{hotel.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedHotel && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="font-medium">Đang hoạt động</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      <span>{selectedHotel.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Quick Stats */}
              {selectedHotel && (
                <div className="flex gap-3">
                  {/* Total Rooms */}
                  <div className="text-center px-4 py-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 min-w-[100px]">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {filteredRoomCategories.reduce((sum, cat) => sum + cat.totalRooms, 0)}
                    </div>
                    <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">
                      Tổng phòng
                    </div>
                  </div>

                  {/* Active Categories */}
                  <div className="text-center px-4 py-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200/50 dark:border-green-800/50 min-w-[100px]">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {filteredRoomCategories.filter(cat => cat.status === 'active').length}
                    </div>
                    <div className="text-xs font-medium text-green-700 dark:text-green-300 mt-1">
                      Đang bán
                    </div>
                  </div>

                  {/* Bookings */}
                  <div className="text-center px-4 py-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/50 min-w-[100px]">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {bookings.filter((b: Booking) => b.status === 'confirmed').length}
                    </div>
                    <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mt-1">
                      Đơn đặt
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Bar - Only show when hotel selected */}
            {selectedHotel && (
              <div className="pt-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">{filteredRoomCategories.length}</span>
                      <span>loại phòng</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {filteredRoomCategories.reduce((sum, cat) => sum + cat.totalRooms, 0)}
                      </span>
                      <span>phòng tổng cộng</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
            {filteredRoomCategories.length > 0 ? (
              filteredRoomCategories.map((category) => (
                <RoomCategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Chưa có loại phòng nào cho khách sạn này</p>
              </div>
            )}
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