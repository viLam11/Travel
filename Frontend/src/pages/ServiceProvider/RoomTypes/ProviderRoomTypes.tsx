// src/pages/ServiceProvider/RoomTypes/ProviderRoomTypes.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import { Textarea } from '@/components/ui/admin/textarea';
import { Badge } from '@/components/ui/admin/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/admin/dialog';
import { CheckCircle2, BedDouble, DoorOpen, Search, Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { type MockRoomType } from '@/mocks/roomTypes';
import { roomApi } from '@/api/roomApi';
import { useToast } from '@/contexts/ToastContext';

const ProviderRoomTypes = () => {
    // Mock: Get current provider's hotel ID (in real app, from auth context)
    const currentHotelId = 1; // Grand Hotel Saigon
    const hotelName = "Grand Hotel Saigon";
    const { toast } = useToast();

    const [roomTypes, setRoomTypes] = useState<MockRoomType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await roomApi.getRoomsByHotelId(currentHotelId);
                setRoomTypes(data);
            } catch (error) {
                console.error("Failed to load rooms", error);
                toast("Lỗi tải danh sách phòng", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, [currentHotelId, toast]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<MockRoomType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        description: '',
        amenities: [] as string[],
        images: [] as string[],
    });

    const amenitiesList = [
        'WiFi', 'TV', 'Mini Bar', 'Điều hòa',
        'Dịch vụ phòng', 'Bồn tắm', 'Quản gia', 'Bếp', 'Máy giặt'
    ];

    const handleOpenDialog = (room?: MockRoomType) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                name: room.name,
                price: room.price.toString(),
                quantity: room.quantity.toString(),
                description: room.description,
                amenities: room.amenities,
                images: room.images,
            });
        } else {
            setEditingRoom(null);
            setFormData({
                name: '',
                price: '',
                quantity: '',
                description: '',
                amenities: [],
                images: [],
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingRoom(null);
    };

    const handleSave = async () => {
        try {
            if (editingRoom) {
                // Update existing room
                const updateData = {
                    name: formData.name,
                    price: parseInt(formData.price),
                    quantity: parseInt(formData.quantity),
                    description: formData.description,
                    amenities: formData.amenities,
                    images: formData.images,
                };
                await roomApi.updateRoom(editingRoom.id, updateData);
                
                setRoomTypes(prev => prev.map(room =>
                    room.id === editingRoom.id
                        ? { ...room, ...updateData }
                        : room
                ));
                toast(`Đã cập nhật: ${formData.name}`, "success");
            } else {
                // Add new room
                const newData = {
                    hotelName: hotelName,
                    name: formData.name,
                    price: parseInt(formData.price),
                    quantity: parseInt(formData.quantity),
                    available: parseInt(formData.quantity),
                    description: formData.description,
                    amenities: formData.amenities,
                    images: formData.images,
                };
                const newRoom = await roomApi.createRoom(currentHotelId, newData);
                setRoomTypes(prev => [...prev, newRoom]);
                toast(`Tạo mới thành công: ${formData.name}`, "success");
            }
            handleCloseDialog();
        } catch (error) {
            console.error("Save failed", error);
            toast("Thao tác thất bại", "error");
        }
    };

    const handleDelete = async (room: MockRoomType) => {
        if (confirm(`Bạn có chắc chắn muốn xóa "${room.name}"?`)) {
            try {
                await roomApi.deleteRoom(room.id);
                setRoomTypes(prev => prev.filter(r => r.id !== room.id));
                toast(`Đã xóa: ${room.name}`, "success");
            } catch (error) {
                console.error("Delete failed", error);
                toast("Xóa thất bại", "error");
            }
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleAddImage = () => {
        const mockImage = `https://images.unsplash.com/photo-${Date.now()}`;
        setFormData(prev => ({ ...prev, images: [...prev.images, mockImage] }));
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý loại phòng</h1>
                    <p className="text-muted-foreground mt-1 text-base">
                        Quản lý các loại phòng và tình trạng phòng cho {hotelName}
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground">
                    <Plus className="w-5 h-5" />
                    <span className="text-base">Thêm loại phòng</span>
                </Button>
            </div>

            {/* Stats Cards - Modern Style */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        title: 'Tổng số loại phòng',
                        value: roomTypes.length,
                        badge: 'Đang hoạt động',
                        badgeColor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
                        iconBg: 'bg-blue-100 dark:bg-blue-500/20',
                        iconColor: 'text-blue-600 dark:text-blue-400',
                        icon: BedDouble
                    },
                    {
                        title: 'Tổng số phòng',
                        value: roomTypes.reduce((sum, room) => sum + room.quantity, 0),
                        badge: 'Tổng sức chứa',
                        badgeColor: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
                        iconBg: 'bg-purple-100 dark:bg-purple-500/20',
                        iconColor: 'text-purple-600 dark:text-purple-400',
                        icon: DoorOpen
                    },
                    {
                        title: 'Phòng trống',
                        value: roomTypes.reduce((sum, room) => sum + room.available, 0),
                        badge: 'Sẵn sàng đặt',
                        badgeColor: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
                        iconBg: 'bg-green-100 dark:bg-green-500/20',
                        iconColor: 'text-green-600 dark:text-green-400',
                        icon: CheckCircle2
                    },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    const valueLength = stat.value.toString().length;
                    let fontSizeClass = 'text-3xl';
                    if (valueLength > 15) {
                        fontSizeClass = 'text-xl';
                    } else if (valueLength > 10) {
                        fontSizeClass = 'text-2xl';
                    }

                    return (
                        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card rounded-xl overflow-hidden">
                            <CardContent className="p-6 flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <div className={`${fontSizeClass} font-bold text-foreground mt-2 break-words leading-tight`}>{stat.value}</div>
                                    <div className="mt-4 flex items-center">
                                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${stat.badgeColor}`}>
                                            {stat.badge}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-3 ${stat.iconBg} rounded-2xl`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Room Types Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Danh sách phòng</h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Tìm kiếm phòng..." className="pl-10 h-11 text-base bg-background border-input" />
                    </div>
                </div>

                <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-base text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border text-base">
                                <tr>
                                    <th className="px-6 py-5">Loại phòng</th>
                                    <th className="px-6 py-5">Giá / Đêm</th>
                                    <th className="px-6 py-5">Tình trạng</th>
                                    <th className="px-6 py-5">Tiện nghi</th>
                                    <th className="px-6 py-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-muted-foreground text-lg">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : roomTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-muted-foreground text-lg">
                                            Không tìm thấy loại phòng nào.
                                        </td>
                                    </tr>
                                ) : (
                                    roomTypes.map((room) => (
                                    <tr key={room.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                                                    <img
                                                        src={room.images[0]}
                                                        alt={room.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground text-lg">{room.name}</p>
                                                    <p className="text-muted-foreground text-sm truncate max-w-[240px] mt-1.5">
                                                        {room.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-semibold text-foreground text-lg">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2 align-start">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    <span className="text-foreground font-bold text-base">{room.available}</span> / {room.quantity} trống
                                                </span>
                                                {room.available > 5 ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 border-emerald-200 dark:border-emerald-800 w-fit text-sm px-3 py-1">
                                                        Còn phòng
                                                    </Badge>
                                                ) : room.available > 0 ? (
                                                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 border-amber-200 dark:border-amber-800 w-fit text-sm px-3 py-1">
                                                        Sắp hết
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="w-fit text-sm px-3 py-1">Hết phòng</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                {room.amenities.slice(0, 2).map((amenity, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-sm font-normal py-1 px-3">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                                {room.amenities.length > 2 && (
                                                    <Badge variant="outline" className="text-sm text-muted-foreground py-1 px-3">
                                                        +{room.amenities.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                                    onClick={() => handleOpenDialog(room)}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDelete(room)}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
                    {/* Header */}
                    <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 bg-muted/40 rounded-t-lg">
                        <DialogTitle>{editingRoom ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}</DialogTitle>
                        <DialogDescription>
                            {editingRoom ? 'Cập nhật thông tin cho loại phòng này.' : 'Điền thông tin chi tiết cho loại phòng mới.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1 px-6 py-5">
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên loại phòng</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="ví dụ: Phòng Deluxe hướng biển"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Giá gốc (VND)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="ví dụ: 1500000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Số lượng phòng</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="ví dụ: 10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả chi tiết về tiện nghi và đặc điểm của phòng..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tiện ích phòng</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                    {amenitiesList.map((amenity) => (
                                        <div
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`cursor-pointer text-sm p-2 rounded-md border transition-all flex items-center gap-2 ${formData.amenities.includes(amenity)
                                                ? 'bg-primary/10 border-primary text-primary font-medium dark:bg-primary/20'
                                                : 'hover:bg-accent border-border text-muted-foreground'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.amenities.includes(amenity) ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                                                }`}>
                                                {formData.amenities.includes(amenity) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Hình ảnh</Label>
                                <div className="grid grid-cols-4 gap-4 mt-2">
                                    <button
                                        onClick={handleAddImage}
                                        className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-muted/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                    >
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Thêm ảnh</span>
                                    </button>
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-white/90 dark:bg-black/80 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="flex-shrink-0 gap-2 px-6 py-4 bg-muted/40 rounded-b-lg">
                        <Button variant="outline" onClick={handleCloseDialog}>Hủy</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {editingRoom ? 'Lưu thay đổi' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProviderRoomTypes;
