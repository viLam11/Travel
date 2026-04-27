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
import { toast } from 'sonner';

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
    });

    const fetchData = async () => {
        if (!serviceId) return;
        setIsLoading(true);
        try {
            let data;
            if (isHotel) {
                const response: any = await roomApi.getRoomsByHotelId(serviceId.toString());
                const data = response?.result || response?.data || response;
                const items = Array.isArray(data) ? data : (data?.roomList || data?.content || []);
                
                // Map RoomResponseDTO to CommonData
                setItems(items.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    price: r.price,
                    description: r.description,
                    type: r.type,
                    quantity: r.quantity
                })));
            } else {
                const response: any = await ticketApi.getTicketsByService(serviceId.toString());
                const data = response?.result || response?.data || response;
                const items = Array.isArray(data) ? data : (data?.content || []);
                
                // Map TicketResponse to CommonData
                setItems(items.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    price: t.price,
                    description: t.term
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
        if (!formData.name || !formData.price) {
            toast.warning('Vui lòng nhập đầy đủ thông tin bắt buộc');
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
                    quantity: Number(formData.quantity)
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
                    term: formData.description,
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
            setFormData({ name: '', price: '', description: '', type: 'SINGLE', quantity: '1' });
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
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
                        setFormData({ name: '', price: '', description: '', type: 'SINGLE', quantity: '1' });
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
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giá niêm yết (VND) <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300"
                                        value={formData.price}
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
                                                value={formData.quantity}
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
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
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
                        <Card key={item.id} className="group overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
                            <div className="flex flex-col md:flex-row">
                                <div className={`hidden md:block w-2 transition-colors ${isHotel ? 'bg-blue-100 group-hover:bg-blue-400' : 'bg-orange-100 group-hover:bg-orange-400'}`}></div>
                                <CardContent className="flex-1 p-5 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isHotel ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {isHotel ? <Bed className="w-5 h-5" /> : <TicketIcon className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                        {item.name}
                                                    </h4>
                                                    {isHotel && (
                                                        <div className="flex gap-2 mt-1">
                                                            <Badge variant="secondary" className="font-normal text-[10px]">{item.type}</Badge>
                                                            <Badge variant="outline" className="font-normal text-[10px]">Còn {item.quantity} phòng</Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 pl-1 whitespace-pre-wrap">{item.description}</div>
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 md:pl-6 md:border-l border-gray-100 min-w-[140px]">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Giá niêm yết</p>
                                                <p className="text-xl md:text-2xl font-bold text-orange-600">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    setFormData({
                                                        name: item.name,
                                                        price: item.price.toString(),
                                                        description: item.description || '',
                                                        type: item.type || 'SINGLE',
                                                        quantity: (item.quantity || 1).toString(),
                                                    });
                                                    setEditingId(item.id);
                                                    setIsAdding(true);
                                                }} className="h-8 w-8 p-0">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 hover:border-red-500 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
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
