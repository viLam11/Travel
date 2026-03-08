// src/pages/ServiceProvider/Services/components/TicketsTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Textarea } from '@/components/ui/admin/textarea';
import { Label } from '@/components/ui/admin/label';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Badge } from '@/components/ui/admin/badge';
import { Plus, Edit, Trash2, Check, X, Ticket } from 'lucide-react';
import { getTicketsByTour, type MockTicket } from '@/mocks/tickets';

interface TicketsTabProps {
    serviceId: number;
    serviceType: 'hotel' | 'place';
}

const TicketsTab = ({ serviceId, serviceType }: TicketsTabProps) => {
    const [tickets, setTickets] = useState<MockTicket[]>(getTicketsByTour(serviceId));
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newTicket, setNewTicket] = useState({
        name: '',
        price: '',
        description: '',
        content: '',
        maxQuantity: '',
    });

    const handleAddTicket = () => {
        if (!newTicket.name || !newTicket.price) return;

        const ticket: MockTicket = {
            id: Math.max(...tickets.map(t => t.id), 0) + 1,
            tourId: serviceId,
            tourName: serviceType === 'hotel' ? 'Hotel Room' : 'Tour Package',
            name: newTicket.name,
            price: parseInt(newTicket.price),
            description: newTicket.description,
            content: newTicket.content,
            maxQuantity: parseInt(newTicket.maxQuantity) || 100,
            available: parseInt(newTicket.maxQuantity) || 100,
        };

        setTickets([...tickets, ticket]);
        setNewTicket({ name: '', price: '', description: '', content: '', maxQuantity: '' });
        setIsAdding(false);
    };

    const handleDeleteTicket = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa loại vé này?')) {
            setTickets(tickets.filter(t => t.id !== id));
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {serviceType === 'hotel' ? 'Các loại phòng' : 'Các loại vé tham quan'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Lựa chọn loại vé phù hợp với nhu cầu của bạn
                    </p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="bg-orange-500 hover:bg-orange-600 shadow-sm transition-all hover:shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm {serviceType === 'hotel' ? 'loại phòng' : 'loại vé'}
                </Button>
            </div>

            {/* Add/Edit Modal (Overlay) */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h4 className="text-xl font-bold text-gray-900">
                                    {editingId ? 'Chỉnh sửa' : 'Thêm mới'} {serviceType === 'hotel' ? 'loại phòng' : 'loại vé'}
                                </h4>
                                <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setEditingId(null); }} className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
                                    <X className="w-5 h-5 text-gray-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Tên {serviceType === 'hotel' ? 'phòng' : 'vé'} <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder={serviceType === 'hotel' ? 'VD: Phòng Deluxe' : 'VD: Vé Người Lớn'}
                                        value={newTicket.name}
                                        onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giá {serviceType === 'hotel' ? '(VND/đêm)' : '(VND/vé)'} <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="pl-3 pr-12 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                            placeholder="2500000"
                                            value={newTicket.price}
                                            onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">VND</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-gray-700 font-medium">Mô tả ngắn</Label>
                                    <Input
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder={serviceType === 'hotel' ? 'Phòng cao cấp với view đẹp' : 'Vé vào cổng tham quan toàn khu vực'}
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-gray-700 font-medium">Tiện ích bao gồm (ngăn cách bằng dấu phẩy)</Label>
                                    <Textarea
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200 min-h-[100px]"
                                        placeholder="VD: Bao gồm vé vào cổng, Buffet trưa, Nước uống..."
                                        value={newTicket.content}
                                        onChange={(e) => setNewTicket({ ...newTicket, content: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">Mỗi tiện ích cách nhau bởi dấu phẩy (,)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Số lượng tối đa</Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="100"
                                        value={newTicket.maxQuantity}
                                        onChange={(e) => setNewTicket({ ...newTicket, maxQuantity: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <Button variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }} className="hover:bg-gray-50 border-gray-300">
                                    Hủy bỏ
                                </Button>
                                <Button onClick={handleAddTicket} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm px-6">
                                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tickets List - User UI Style */}
            <div className="space-y-4">
                {tickets.map((ticket) => (
                    <Card key={ticket.id} className="group overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white">
                        <div className="flex flex-col md:flex-row">
                            {/* Left decoration bar */}
                            <div className="hidden md:block w-2 bg-orange-100 group-hover:bg-orange-400 transition-colors"></div>

                            <CardContent className="flex-1 p-5 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Ticket Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                    {ticket.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal text-xs">
                                                        {ticket.available}/{ticket.maxQuantity} vé
                                                    </Badge>
                                                    {ticket.available === 0 && (
                                                        <Badge variant="destructive" className="text-xs">Hết vé</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 pl-1">{ticket.description}</p>

                                        {/* Features List with Check Icons */}
                                        {ticket.content && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 mt-3 pt-3 border-t border-dashed border-gray-100">
                                                {ticket.content.split(',').map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="line-clamp-1">{item.trim()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 md:pl-6 md:border-l border-gray-100 min-w-[140px]">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Giá vé</p>
                                            <p className="text-xl md:text-2xl font-bold text-orange-600">{formatPrice(ticket.price)}</p>
                                        </div>

                                        <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setNewTicket({
                                                    name: ticket.name,
                                                    price: ticket.price.toString(),
                                                    description: ticket.description,
                                                    content: ticket.content,
                                                    maxQuantity: ticket.maxQuantity.toString()
                                                });
                                                setEditingId(ticket.id);
                                                setIsAdding(true);
                                            }} className="h-8 w-8 p-0 border-gray-200 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteTicket(ticket.id)}
                                                className="h-8 w-8 p-0 border-gray-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                ))}

                {tickets.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-200 transition-colors">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Ticket className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có loại vé nào</h3>
                        <p className="text-gray-500 px-6 max-w-sm mx-auto mb-6">
                            Tạo các loại vé khác nhau để khách hàng có nhiều lựa chọn (VD: Vé người lớn, Vé trẻ em, Combo...)
                        </p>
                        <Button onClick={() => setIsAdding(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm loại vé đầu tiên
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketsTab;
