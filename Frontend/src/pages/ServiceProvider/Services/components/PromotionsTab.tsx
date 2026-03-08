// src/pages/ServiceProvider/Services/components/PromotionsTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Textarea } from '@/components/ui/admin/textarea';
import { Label } from '@/components/ui/admin/label';
import { Card, CardContent } from '@/components/ui/admin/card';
import { Badge } from '@/components/ui/admin/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import { Plus, Edit, Trash2, X, Tag, Percent } from 'lucide-react';
import { getPromotionsByService, type Promotion } from '@/mocks/pricing';

interface PromotionsTabProps {
    serviceId: number;
}

const PromotionsTab = ({ serviceId }: PromotionsTabProps) => {
    const [promotions, setPromotions] = useState<Promotion[]>(getPromotionsByService(serviceId));
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newPromotion, setNewPromotion] = useState({
        name: '',
        description: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: '',
        conditions: '',
        startDate: '',
        endDate: '',
    });

    const openAddModal = () => {
        setEditingId(null);
        setNewPromotion({ name: '', description: '', discountType: 'percentage', discountValue: '', conditions: '', startDate: '', endDate: '' });
        setIsAdding(true);
    };

    const openEditModal = (promo: Promotion) => {
        setEditingId(promo.id);
        setNewPromotion({
            name: promo.name,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue.toString(),
            conditions: promo.conditions.join('\n'),
            startDate: promo.startDate,
            endDate: promo.endDate,
        });
        setIsAdding(true);
    };

    const handleSavePromotion = () => {
        if (!newPromotion.name || !newPromotion.discountValue) return;

        if (editingId !== null) {
            // Cập nhật ưu đãi đã có
            setPromotions(prev => prev.map(p => p.id === editingId ? {
                ...p,
                name: newPromotion.name,
                description: newPromotion.description,
                discountType: newPromotion.discountType,
                discountValue: parseInt(newPromotion.discountValue),
                conditions: newPromotion.conditions.split('\n').filter(c => c.trim()),
                startDate: newPromotion.startDate,
                endDate: newPromotion.endDate,
            } : p));
        } else {
            // Thêm mới
            const promotion: Promotion = {
                id: Math.max(...promotions.map(p => p.id), 0) + 1,
                serviceId,
                name: newPromotion.name,
                description: newPromotion.description,
                discountType: newPromotion.discountType,
                discountValue: parseInt(newPromotion.discountValue),
                conditions: newPromotion.conditions.split('\n').filter(c => c.trim()),
                startDate: newPromotion.startDate,
                endDate: newPromotion.endDate,
                isActive: true,
            };
            setPromotions(prev => [...prev, promotion]);
        }

        setIsAdding(false);
        setEditingId(null);
    };

    const handleDeletePromotion = (id: number) => {
        if (confirm('Bạn có chắc muốn xóa ưu đãi này?')) {
            setPromotions(promotions.filter(p => p.id !== id));
        }
    };

    const togglePromotionStatus = (id: number) => {
        setPromotions(promotions.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Ưu đãi & Khuyến mãi</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Tạo các chương trình ưu đãi để thu hút khách hàng
                    </p>
                </div>
                <Button onClick={openAddModal} className="bg-orange-500 hover:bg-orange-600 shadow-sm transition-all hover:shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ưu đãi
                </Button>
            </div>

            {/* Add/Edit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h4 className="text-xl font-bold text-gray-900">
                                    {editingId !== null ? 'Chỉnh sửa khuyến mãi' : 'Thêm chương trình khuyến mãi'}
                                </h4>
                                <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setEditingId(null); }} className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
                                    <X className="w-5 h-5 text-gray-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Tên chương trình <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="VD: Giảm giá mùa hè"
                                        value={newPromotion.name}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Loại giảm giá</Label>
                                    <Select
                                        value={newPromotion.discountType}
                                        onValueChange={(value: 'percentage' | 'fixed') => setNewPromotion({ ...newPromotion, discountType: value })}
                                    >
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Theo phần trăm (%)</SelectItem>
                                            <SelectItem value="fixed">Số tiền cố định (VND)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giá trị giảm <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder={newPromotion.discountType === 'percentage' ? "10" : "50000"}
                                        value={newPromotion.discountValue}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, discountValue: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-gray-700 font-medium">Mô tả</Label>
                                    <Input
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="Mô tả ngắn về chương trình..."
                                        value={newPromotion.description}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Ngày bắt đầu</Label>
                                    <Input
                                        type="date"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        value={newPromotion.startDate}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Ngày kết thúc</Label>
                                    <Input
                                        type="date"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        value={newPromotion.endDate}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-gray-700 font-medium">Điều kiện áp dụng</Label>
                                    <Textarea
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200 min-h-[80px]"
                                        placeholder="Mỗi điều kiện một dòng..."
                                        value={newPromotion.conditions}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, conditions: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setIsAdding(false)} className="hover:bg-gray-50 border-gray-300">
                                    Hủy bỏ
                                </Button>
                                <Button onClick={handleSavePromotion} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm px-6">
                                    {editingId !== null ? 'Lưu thay đổi' : 'Thêm khuyến mãi'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Promotions List - Voucher Style */}
            <div className="grid grid-cols-1 gap-4">
                {promotions.map((promo) => (
                    <div key={promo.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all duration-300 flex flex-col md:flex-row min-h-[140px]">
                        {/* Custom visual element for 'Voucher' look */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 z-10 hidden md:block"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 z-10 hidden md:block"></div>

                        {/* Left Side: Discount Value */}
                        <div className="w-full md:w-[180px] bg-orange-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-dashed border-gray-300 relative group-hover:bg-orange-100 transition-colors">
                            {promo.discountType === 'percentage' ? (
                                <div className="text-4xl font-black text-orange-500 flex items-start leading-none mb-2">
                                    <span>{promo.discountValue}</span>
                                    <span className="text-2xl mt-1">%</span>
                                </div>
                            ) : (
                                <div className="text-2xl font-black text-orange-500 mb-2 text-center">
                                    {promo.discountValue.toLocaleString()}đ
                                </div>
                            )}
                            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">GIẢM GIÁ</div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {promo.name}
                                        </h4>
                                        <Badge className={`${promo.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600'} border-transparent font-normal`}>
                                            {promo.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{promo.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            <span>Mã: PROMO{promo.id}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>Hạn: {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conditions & Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2 border-t border-gray-50 pt-3">
                                <div className="space-y-1 w-full md:w-auto">
                                    {promo.conditions && promo.conditions.map((condition, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                                            <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                                            <span className="line-clamp-1">{condition.trim()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePromotionStatus(promo.id)}
                                        className={`h-8 text-xs ${promo.isActive ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-gray-500'}`}
                                    >
                                        {promo.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(promo)}>
                                        <Edit className="w-3.5 h-3.5 text-gray-500 hover:text-blue-500" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeletePromotion(promo.id)}>
                                        <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-200 transition-colors">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Percent className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chương trình ưu đãi</h3>
                        <p className="text-gray-500 px-6 max-w-sm mx-auto mb-6">
                            Tạo mã giảm giá để thu hút khách hàng đặt dịch vụ của bạn
                        </p>
                        <Button onClick={() => setIsAdding(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo ưu đãi ngay
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionsTab;
