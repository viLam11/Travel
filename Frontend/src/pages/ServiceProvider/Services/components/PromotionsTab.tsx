// src/pages/ServiceProvider/Services/components/PromotionsTab.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
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


import { discountApi, type DiscountResponse, type DiscountRequest } from '@/api/discountApi';


interface PromotionsTabProps {
    serviceId: string;
}

const PromotionsTab = ({ serviceId }: PromotionsTabProps) => {
    const [promotions, setPromotions] = useState<DiscountResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newPromotion, setNewPromotion] = useState({
        name: '',
        description: '',
        code: '',
        discountType: 'Percentage' as 'Percentage' | 'Fixed',
        discountValue: '',
        maxDiscountAmount: '',
        minSpend: '0',
        startDate: '',
        endDate: '',
    });

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const data = await discountApi.getAllDiscounts();
            // Filter discounts related to this service (if applyType is ALL or SERVICE with this serviceId)
            setPromotions(data.filter((d: DiscountResponse) => d.applyType === 'ALL' || d.applyType === 'SERVICE' || d.applyType === 'PROVINCE' || d.applyType === 'CATEGORY'));

        } catch (err) {
            console.error('Failed to load promotions', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [serviceId]);

    const resetForm = () => setNewPromotion({ name: '', description: '', code: '', discountType: 'Percentage', discountValue: '', maxDiscountAmount: '', minSpend: '0', startDate: '', endDate: '' });

    const openAddModal = () => {
        setEditingId(null);
        resetForm();
        setIsAdding(true);
    };

    const openEditModal = (promo: DiscountResponse) => {
        setEditingId(promo.id);
        setNewPromotion({
            name: promo.name || '',
            description: promo.name || '',
            code: promo.code,
            discountType: promo.discountType,
            discountValue: (promo.discountType === 'Percentage' ? promo.percentage : promo.fixedPrice)?.toString() || '',
            maxDiscountAmount: promo.maxDiscountAmount?.toString() || '',
            minSpend: promo.minSpend?.toString() || '0',
            startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
            endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
        });
        setIsAdding(true);
    };

    const buildRequest = (): DiscountRequest => ({
        name: newPromotion.name,
        code: newPromotion.code || 'SVC-' + serviceId + '-' + Date.now(),
        startDate: newPromotion.startDate ? newPromotion.startDate + 'T00:00:00' : new Date().toISOString(),
        endDate: newPromotion.endDate ? newPromotion.endDate + 'T23:59:59' : new Date().toISOString(),
        quantity: 0,
        minSpend: Number(newPromotion.minSpend) || 0,
        applyType: 'SERVICE',
        serviceList: [String(serviceId)],
        discountType: newPromotion.discountType,
        percentage: newPromotion.discountType === 'Percentage' ? Number(newPromotion.discountValue) : undefined,
        fixedPrice: newPromotion.discountType === 'Fixed' ? Number(newPromotion.discountValue) : undefined,
        maxDiscountAmount: Number(newPromotion.maxDiscountAmount) || undefined,
    });

    const handleSavePromotion = async () => {
        if (!newPromotion.name || !newPromotion.discountValue) return;
        try {
            if (editingId !== null) {
                await discountApi.updateDiscount(editingId, buildRequest());
            } else {
                await discountApi.createDiscount(buildRequest());
            }
            setIsAdding(false);
            setEditingId(null);
            fetchPromotions();
        } catch (err) {
            console.error('Failed to save promotion', err);
        }
    };

    const handleDeletePromotion = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa ưu đãi này?')) {
            try {
                await discountApi.deleteDiscount(id);
                fetchPromotions();
            } catch (err) {
                console.error('Failed to delete promotion', err);
            }
        }
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
                                        onValueChange={(value: 'Percentage' | 'Fixed') => setNewPromotion({ ...newPromotion, discountType: value })}
                                    >
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Percentage">Theo phần trăm (%)</SelectItem>
                                            <SelectItem value="Fixed">Số tiền cố định (VND)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giá trị giảm <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder={newPromotion.discountType === 'Percentage' ? "10" : "50000"}
                                        value={newPromotion.discountValue}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, discountValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giảm tối đa (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="500000"
                                        value={newPromotion.maxDiscountAmount}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, maxDiscountAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Đơn tối thiểu (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="0"
                                        value={newPromotion.minSpend}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, minSpend: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
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
                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Đang tải ưu đãi...</div>
                ) : promotions.map((promo) => (
                    <div key={promo.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all duration-300 flex flex-col md:flex-row min-h-[140px]">
                        {/* Custom visual element for 'Voucher' look */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 z-10 hidden md:block"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 z-10 hidden md:block"></div>

                        {/* Left Side: Discount Value */}
                        <div className="w-full md:w-[180px] bg-orange-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-dashed border-gray-300 relative group-hover:bg-orange-100 transition-colors">
                            {promo.discountType === 'Percentage' ? (
                                <div className="text-4xl font-black text-orange-500 flex items-start leading-none mb-2">
                                    <span>{promo.percentage}</span>
                                    <span className="text-2xl mt-1">%</span>
                                </div>
                            ) : (
                                <div className="text-2xl font-black text-orange-500 mb-2 text-center">
                                    {promo.fixedPrice?.toLocaleString()}đ
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
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-transparent font-normal">
                                            Đang hoạt động
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            <span>Mã: {promo.code}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>Hạn: {promo.startDate ? new Date(promo.startDate).toLocaleDateString('vi-VN') : ''} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : ''}</span>
                                        </div>
                                        {promo.minSpend > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span>Đơn tối thiểu: {promo.minSpend?.toLocaleString()}đ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2 border-t border-gray-50 pt-3">
                                <div></div>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
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
