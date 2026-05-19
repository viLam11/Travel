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
import { Plus, Edit, Trash2, X, Tag, Percent, Calendar, Check, Loader2, Info } from 'lucide-react';
import { discountApi, type DiscountResponse, type DiscountRequest } from '@/api/discountApi';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmContext';

interface PromotionsTabProps {
    serviceId: string | number;
    placeCode?: string; // province code của dịch vụ, dùng cho filter
}

const PromotionsTab = ({ serviceId, placeCode }: PromotionsTabProps) => {
    const [promotions, setPromotions] = useState<DiscountResponse[]>([]);
    const { confirm } = useConfirm();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        discountType: 'Percentage' as 'Percentage' | 'Fixed',
        discountValue: '',
        maxDiscountAmount: '',
        minSpend: '0',
        quantity: '100',
        startDate: '',
        endDate: '',
    });

    const fetchPromotions = async () => {
        if (!serviceId) return;
        setIsLoading(true);
        try {
            const data = await discountApi.getDiscountsByService(String(serviceId));
            setPromotions(data);
        } catch (err) {
            console.error('Failed to load promotions', err);
            toast.error('Không thể tải danh sách ưu đãi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [serviceId]);

    const resetForm = () => setFormData({
        name: '',
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        maxDiscountAmount: '',
        minSpend: '0',
        quantity: '100',
        startDate: '',
        endDate: '',
    });

    const handleSave = async () => {
        if (!formData.name || !formData.code || !formData.discountValue || !formData.startDate || !formData.endDate) {
            toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSaving(true);
        try {
            const request: DiscountRequest = {
                name: formData.name,
                code: formData.code.toUpperCase(),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                quantity: Number(formData.quantity) || 100,
                minSpend: Number(formData.minSpend) || 0,
                applyType: 'SERVICE',
                serviceList: [String(serviceId)],
                discountType: formData.discountType,
                fixedPrice: formData.discountType === 'Fixed' ? Number(formData.discountValue) : 0,
                percentage: formData.discountType === 'Percentage' ? Number(formData.discountValue) : 0,
                maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
            };

            if (editingId) {
                await discountApi.updateDiscountWithPermission(editingId, request);
                toast.success('Cập nhật ưu đãi thành công');
            } else {
                await discountApi.createDiscount(request);
                toast.success('Thêm ưu đãi mới thành công');
            }
            setIsAdding(false);
            setEditingId(null);
            fetchPromotions();
        } catch (err) {
            console.error('Failed to save promotion', err);
            toast.error('Lỗi khi lưu ưu đãi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: 'Xóa chương trình ưu đãi',
            message: 'Bạn có chắc muốn xóa chương trình ưu đãi này vĩnh viễn?',
            variant: 'danger',
            confirmText: 'Xóa ngay',
            cancelText: 'Hủy'
        });
        if (!isConfirmed) return;
        try {
            await discountApi.deleteDiscountWithPermission(id);
            toast.success('Đã xóa ưu đãi');
            fetchPromotions();
        } catch (err) {
            console.error('Failed to delete promotion', err);
            toast.error('Không thể xóa ưu đãi');
        }
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Ưu đãi & Khuyến mãi</h3>
                    <p className="text-sm text-gray-500 mt-1">Tạo các mã giảm giá để thu hút khách hàng</p>
                </div>
                <Button onClick={() => { resetForm(); setEditingId(null); setIsAdding(true); }} className="bg-orange-500 hover:bg-orange-600 shadow-sm transition-all hover:shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ưu đãi
                </Button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h4 className="text-xl font-bold text-gray-900">
                                    {editingId ? 'Chỉnh sửa' : 'Thêm'} chương trình ưu đãi
                                </h4>
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
                                    <X className="w-5 h-5 text-gray-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-gray-700 font-medium">Tên chương trình <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="VD: Khuyến mãi chào Hè"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Mã code <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200 font-mono uppercase"
                                        placeholder="VD: HE2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Loại giảm giá</Label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={(value: 'Percentage' | 'Fixed') => setFormData({ ...formData, discountType: value })}
                                    >
                                        <SelectTrigger className="border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Percentage">Theo phần trăm (%)</SelectItem>
                                            <SelectItem value="Fixed">Số tiền cố định (VNĐ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giá trị giảm <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder={formData.discountType === 'Percentage' ? "10" : "50000"}
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Giảm tối đa (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="0 (Không giới hạn)"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Đơn tối thiểu (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        placeholder="0"
                                        value={formData.minSpend}
                                        onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Số lượng mã</Label>
                                    <Input
                                        type="number"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Ngày bắt đầu</Label>
                                    <Input
                                        type="date"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Ngày kết thúc</Label>
                                    <Input
                                        type="date"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p>Đang tải ưu đãi...</p>
                    </div>
                ) : promotions.length > 0 ? (
                    promotions.map((promo) => (
                        <div key={promo.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all duration-300 flex flex-col md:flex-row">
                            {/* Voucher Left Side */}
                            <div className="w-full md:w-[160px] bg-orange-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-dashed border-gray-300 relative group-hover:bg-orange-100 transition-colors">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 z-10 hidden md:block"></div>
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border border-gray-200 z-10 hidden md:block"></div>

                                <div className="text-3xl font-black text-orange-500 leading-none mb-1">
                                    {promo.discountType === 'Percentage' ? `${promo.percentage}%` : `${promo.fixedPrice / 1000}k`}
                                </div>
                                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">OFF</div>
                            </div>

                            {/* Voucher Right Side */}
                            <div className="flex-1 p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{promo.name}</h4>
                                            {promo.isSystem && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent text-[9px] h-4">Hệ thống</Badge>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="w-3 h-3 text-orange-400" />
                                                <span className="font-mono font-bold text-gray-700">{promo.code}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <span>{new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Info className="w-3 h-3 text-gray-400" />
                                                <span>Đơn từ {formatPrice(promo.minSpend)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Check className="w-3 h-3 text-green-500" />
                                                <span>Số lượng: {promo.quantity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {!promo.isSystem && (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setFormData({
                                                    name: promo.name || '',
                                                    code: promo.code || '',
                                                    discountType: promo.discountType,
                                                    discountValue: ((promo.discountType === 'Percentage' ? promo.percentage : promo.fixedPrice) ?? 0).toString(),
                                                    maxDiscountAmount: (promo.maxDiscountAmount ?? 0).toString(),
                                                    minSpend: (promo.minSpend ?? 0).toString(),
                                                    quantity: (promo.quantity ?? 100).toString(),
                                                    startDate: promo.startDate?.split('T')[0] ?? '',
                                                    endDate: promo.endDate?.split('T')[0] ?? ''
                                                });
                                                setEditingId(promo.id);
                                                setIsAdding(true);
                                            }} className="h-8 w-8 p-0 text-gray-400 hover:text-orange-600">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(promo.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Percent className="w-6 h-6 text-gray-300" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">Chưa có chương trình ưu đãi</h3>
                        <p className="text-sm text-gray-500 mb-6">Tạo khuyến mãi để kích cầu người dùng đặt dịch vụ</p>
                        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-orange-500 hover:bg-orange-600">
                            Tạo ưu đãi ngay
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionsTab;
