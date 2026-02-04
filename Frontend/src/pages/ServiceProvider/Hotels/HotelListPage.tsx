import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/admin/dropdown-menu';
import {
    Building2, MapPin, Star, Plus, Search,
    Edit, Trash2, Eye, MoreHorizontal, Filter
} from 'lucide-react';

// Format currency VND
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Mock Data
const MOCK_HOTELS = [
    {
        id: 1,
        name: 'Khách sạn Majestic Sài Gòn',
        location: 'Hồ Chí Minh',
        address: '1 Đồng Khởi, Bến Nghé, Quận 1',
        rating: 4.8,
        starRating: 5,
        minPrice: 2500000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        rooms: 175,
        bookings: 1240
    },
    {
        id: 2,
        name: 'Rex Hotel Saigon',
        location: 'Hồ Chí Minh',
        address: '141 Nguyễn Huệ, Quận 1',
        rating: 4.5,
        starRating: 5,
        minPrice: 2100000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        rooms: 286,
        bookings: 890
    },
    {
        id: 3,
        name: 'Pullman Saigon Centre',
        location: 'Hồ Chí Minh',
        address: '148 Trần Hưng Đạo, Quận 1',
        rating: 4.7,
        starRating: 5,
        minPrice: 2800000,
        status: 'maintenance',
        thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        rooms: 306,
        bookings: 560
    }
];

export default function HotelListPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter logic
    const filteredHotels = MOCK_HOTELS.filter(hotel => {
        const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || hotel.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này không?')) {
            alert(`Đã xóa khách sạn ID: ${id} (Mock)`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Hoạt động</Badge>;
            case 'inactive':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Tạm dừng</Badge>;
            case 'maintenance':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Bảo trì</Badge>;
            default:
                return <Badge variant="secondary">Không xác định</Badge>;
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Danh sách khách sạn</h1>
                    <p className="text-muted-foreground mt-1">Quản lý và theo dõi hiệu suất các khách sạn của bạn</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-sidebar-border hover:bg-sidebar-accent">
                        <Filter className="w-4 h-4 mr-2" />
                        Bộ lọc
                    </Button>
                    <Button onClick={() => navigate('/admin/hotels/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm khách sạn
                    </Button>
                </div>
            </div>

            {/* Filters & Table */}
            <Card className="shadow-sm border-sidebar-border bg-card">
                <CardHeader className="p-4 border-b border-sidebar-border">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm khách sạn..."
                                className="pl-9 bg-input border-border"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <select
                                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Tạm dừng</option>
                                <option value="maintenance">Bảo trì</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 border-b border-sidebar-border">
                                    <TableHead className="w-[300px]">Khách sạn</TableHead>
                                    <TableHead>Hạng sao</TableHead>
                                    <TableHead>Giá từ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thống kê</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHotels.length > 0 ? (
                                    filteredHotels.map((hotel) => (
                                        <TableRow key={hotel.id} className="border-b border-sidebar-border hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex gap-3">
                                                    <img
                                                        src={hotel.thumbnail}
                                                        alt={hotel.name}
                                                        className="w-16 h-16 rounded-md object-cover bg-muted"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-foreground">{hotel.name}</p>
                                                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            {hotel.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex">
                                                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{hotel.rating}/5 từ {hotel.bookings} reviews</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                                {formatCurrency(hotel.minPrice)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(hotel.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-muted-foreground">
                                                    <span>{hotel.rooms} phòng</span>
                                                    <span>{hotel.bookings} lượt đặt</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/hotels/rooms`)}> {/* Demo link to rooms */}
                                                            <Building2 className="mr-2 h-4 w-4" />
                                                            Quản lý phòng
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/hotels/edit/${hotel.id}`)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { }} className="text-destructive focus:text-destructive" onSelect={() => handleDelete(hotel.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Xóa khách sạn
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Không tìm thấy khách sạn nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
