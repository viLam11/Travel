// src/pages/ServiceProvider/Services/components/TicketsTab.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Textarea } from '@/components/ui/admin/textarea';
import { Label } from '@/components/ui/admin/label';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Badge } from '@/components/ui/admin/badge';
import { Plus, Edit, Trash2, X, Ticket as TicketIcon, Loader2, Bed } from 'lucide-react';
import { ticketApi } from '@/api/ticketApi';
import { roomApi } from '@/api/roomApi';
import { toast } from 'react-hot-toast';

interface TicketsTabProps {
    serviceId: string | number;
    serviceType: 'hotel' | 'place' | 'RESTAURANT' | 'TICKET_VENUE' | 'ALL' | string;
}

interface CommonData {
    id: string;
    name: string;
    price: number;
    description: string;
    type?: string; // For rooms
    quantity?: number; // For rooms
    image?: string;
}

const TicketsTab = ({ serviceId, serviceType }: TicketsTabProps) => {
    const isHotel = serviceType.toLowerCase().includes('hotel');
    const [items, setItems] = useState<CommonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: 'SINGLE', // For rooms
        quantity: '1', // For rooms
        photos: [] as File[],
    });

    const fetchData = async () => {
        if (!serviceId) return;
        setIsLoading(true);
        try {
            if (isHotel) {
                const response: any = await roomApi.getRoomsByHotelId(serviceId.toString());
                const roomData = response?.result || response?.data || response;
                console.log('Raw room data from API:', roomData);
                const roomItems = Array.isArray(roomData) ? roomData : (roomData?.roomList || roomData?.content || []);

                // Map RoomResponseDTO to CommonData
                setItems(roomItems.map((r: any) => ({
                    id: r.id,
                    name: r.name || '',
                    price: r.price || 0,
                    description: r.description || '',
                    type: r.type || 'SINGLE',
                    quantity: r.quantity || 0,
                    image: r.roomImgUrl || r.images?.[0] || r.imageList?.[0]
                })));
            } else {
                const response: any = await ticketApi.getTicketsByService(serviceId.toString());
                const data = response?.result || response?.data || response;
                const items = Array.isArray(data) ? data : (data?.content || []);

                // Map TicketResponse to CommonData
                setItems(items.map((t: any) => ({
                    id: t.id,
                    name: t.name || '',
                    price: t.price || 0,
                    description: t.term || '',
                    image: t.imageUrl || t.thumbnailUrl
                })));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(`Không thể tải danh sách ${isHotel ? 'phòng' : 'vé'}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [serviceId, isHotel]);

    const handleSave = async () => {
        console.log('Attempting to save:', { 
            editingId, 
            name: formData.name, 
            price: formData.price,
            allData: formData 
        });
        
        if (!formData.name) {
            console.warn('Validation failed: name is missing');
            toast.error('Vui lòng nhập tên gọi');
            return;
        }
        if (!formData.price) {
            console.warn('Validation failed: price is missing');
            toast.error('Vui lòng nhập giá niêm yết');
            return;
        }

        setIsSaving(true);
        try {
            if (isHotel) {
                const roomData = {
                    name: formData.name,
                    price: Number(formData.price),
                    description: formData.description,
                    type: formData.type,
                    quantity: Number(formData.quantity),
                    photos: formData.photos
                };
                if (editingId) {
                    await roomApi.updateRoom(editingId, roomData);
                    toast.success('Cập nhật phòng thành công');
                } else {
                    await roomApi.createRoom(serviceId, roomData);
                    toast.success('Thêm phòng mới thành công');
                }
            } else {
                const ticketData = {
                    name: formData.name,
                    price: Number(formData.price),
                    term: formData.description || '',
                    photos: formData.photos
                };
                if (editingId) {
                    await ticketApi.updateTicket(editingId, ticketData);
                    toast.success('Cập nhật vé thành công');
                } else {
                    await ticketApi.createTicket(serviceId.toString(), ticketData);
                    toast.success('Thêm vé mới thành công');
                }
            }

            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', price: '', description: '', type: 'SINGLE', quantity: '1', photos: [] });
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            toast.error('Lỗi khi lưu thông tin');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(`Bạn có chắc muốn xóa ${isHotel ? 'loại phòng' : 'loại vé'} này?`)) return;

        try {
            if (isHotel) {
                await roomApi.deleteRoom(id);
            } else {
                await ticketApi.deleteTicket(id);
            }
            toast.success('Đã xóa thành công');
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Không thể xóa');
        }
    };

    const formatPrice = (price: number) => {
        const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        return isHotel ? `${formatted} / đêm` : formatted;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {isHotel ? 'Quản lý phòng khách sạn' : 'Các loại vé tham quan'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Thiết lập các tùy chọn dịch vụ cho khách hàng
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ name: '', price: '', description: '', type: 'SINGLE', quantity: '1', photos: [] });
                    }}
                    className="bg-orange-500 hover:bg-orange-600 shadow-sm transition-all hover:shadow-md"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm {isHotel ? 'loại phòng' : 'loại vé'}
                </Button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h4 className="text-xl font-bold text-gray-900">
                                    {editingId ? 'Chỉnh sửa' : 'Thêm mới'} {isHotel ? 'phòng' : 'vé'}
                                </h4>
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
                                    <X className="w-5 h-5 text-gray-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Tên gọi <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="border-gray-300"
                                        placeholder={isHotel ? "VD: Phòng Deluxe hướng biển" : "VD: Vé Người Lớn"}
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giá niêm yết (VND) <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>

                                {isHotel && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-medium">Loại phòng</Label>
                                            <select
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="SINGLE">Phòng Đơn</option>
                                                <option value="DOUBLE">Phòng Đôi</option>
                                                <option value="SUITE">Phòng Suite</option>
                                                <option value="DELUXE">Phòng Deluxe</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-medium">Số lượng phòng hiện có</Label>
                                            <Input
                                                type="number"
                                                className="border-gray-300"
                                                value={formData.quantity || ''}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-gray-700 font-medium">Mô tả / Tiện ích</Label>
                                    <Textarea
                                        className="border-gray-300 min-h-[100px]"
                                        placeholder="Thông tin chi tiết..."
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-gray-700 font-medium">Hình ảnh {isHotel ? 'phòng' : 'vé'}</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative group w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:border-orange-300 transition-colors">
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const newFiles = Array.from(e.target.files);
                                                        setFormData(prev => ({ 
                                                            ...prev, 
                                                            photos: [...prev.photos, ...newFiles] 
                                                        }));
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                <Plus className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] font-medium">Tải ảnh lên</span>
                                            </div>
                                        </div>
                                        {formData.photos.length > 0 && (
                                            <div className="flex gap-2">
                                                {formData.photos.map((file, idx) => (
                                                    <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-100">
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                        <button 
                                                            onClick={() => setFormData({...formData, photos: formData.photos.filter((_, i) => i !== idx)})}
                                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setIsAdding(false)}>Hủy bỏ</Button>
                                <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? 'Cập nhật' : 'Thêm mới')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <Card key={item.id} className="group overflow-hidden border border-gray-200/60 hover:border-orange-400/50 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white">
                            <div className="flex relative">
                                {/* Left accent bar */}
                                <div className={`absolute top-0 left-0 w-1 h-full z-10 rounded-l-2xl ${isHotel ? 'bg-gradient-to-b from-orange-400 to-amber-500' : 'bg-gradient-to-b from-orange-400 to-red-500'}`}></div>
                                
                                {/* Room Image */}
                                {item.image && (
                                    <div className="w-36 h-auto shrink-0 overflow-hidden relative ml-1">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        />
                                    </div>
                                )}

                                {/* Main Content */}
                                <div className="flex-1 flex flex-col sm:flex-row items-stretch min-w-0 ml-1">
                                    {/* Info section */}
                                    <div className="flex-1 p-5 space-y-3 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl shrink-0 ${isHotel ? 'bg-orange-50 text-orange-500' : 'bg-orange-50 text-orange-500'}`}>
                                                {isHotel ? <Bed className="w-5 h-5" /> : <TicketIcon className="w-5 h-5" />}
                                            </div>
                                            <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                                {item.name || (isHotel
                                                    ? (item.type === 'SINGLE' ? 'Phòng Đơn' :
                                                       item.type === 'DOUBLE' ? 'Phòng Đôi' :
                                                       item.type === 'SUITE' ? 'Suite' :
                                                       item.type === 'DELUXE' ? 'Phòng Deluxe' : 'Phòng')
                                                    : 'Vé tham quan')}
                                            </h4>
                                        </div>

                                        {isHotel && (
                                            <div className="flex flex-wrap gap-1.5">
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`px-2 py-0.5 text-[11px] font-semibold border ${
                                                        item.type === 'SINGLE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        item.type === 'DOUBLE' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        item.type === 'SUITE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        item.type === 'DELUXE' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                        'bg-slate-50 text-slate-700 border-slate-200'
                                                    }`}
                                                >
                                                    {item.type === 'SINGLE' ? 'Phòng Đơn' : 
                                                     item.type === 'DOUBLE' ? 'Phòng Đôi' : 
                                                     item.type === 'SUITE' ? 'Suite' : 
                                                     item.type === 'DELUXE' ? 'Deluxe' : 
                                                     item.type}
                                                </Badge>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 text-[11px] font-semibold">
                                                    Còn {item.quantity} phòng
                                                </Badge>
                                            </div>
                                        )}

                                        {item.description && (
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price + Actions */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 px-5 py-4 sm:border-l border-t sm:border-t-0 border-gray-100 sm:min-w-[160px]">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Giá niêm yết</p>
                                            <p className="text-xl font-black text-orange-500 tabular-nums leading-tight">
                                                {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => {
                                                    setFormData({
                                                        name: item.name,
                                                        price: item.price.toString(),
                                                        description: item.description || '',
                                                        type: item.type || 'SINGLE',
                                                        quantity: (item.quantity || 1).toString(),
                                                        photos: []
                                                    });
                                                    setEditingId(item.id);
                                                    setIsAdding(true);
                                                }} 
                                                className="h-9 w-9 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => handleDelete(item.id)} 
                                                className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-6">Chưa có {isHotel ? 'loại phòng' : 'loại vé'} nào được thiết lập.</p>
                        <Button onClick={() => setIsAdding(true)} className="bg-orange-500 hover:bg-orange-600">
                            <Plus className="w-4 h-4 mr-2" /> Thêm {isHotel ? 'loại phòng' : 'loại vé'} đầu tiên
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketsTab;
