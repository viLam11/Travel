import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Calendar, Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/admin/dialog';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { useToast } from '@/contexts/ToastContext';
import { discountApi, type DiscountResponse, type DiscountRequest } from '@/api/discountApi';


export const AdminPromotionsPage: React.FC = () => {
    const { success, error } = useToast();
    const [promotions, setPromotions] = useState<DiscountResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<DiscountResponse | null>(null);

    // Form State for Create/Edit
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        applyTo: 'all',
        discountPercent: '',
        maxDiscountAmount: '',
        quantity: '',
        minSpend: '0',
        startDate: '',
        endDate: '',
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const data = await discountApi.getAllDiscounts();
            setPromotions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const filteredPromotions = promotions.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
    const paginatedPromotions = filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusTextAndStyle = (startDate: string, endDate: string) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (now < start) {
            return { text: 'Sắp tới', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' };
        } else if (now > end) {
            return { text: 'Đã hết hạn', style: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };
        }
        return { text: 'Đang chạy', style: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' };
    };

    const getApplyToText = (applyType: string, selectedCategory?: string) => {
        if (applyType === 'ALL') return 'Tất cả dịch vụ';
        if (applyType === 'CATEGORY') {
            if (selectedCategory === 'HOTEL') return 'Khách sạn';
            if (selectedCategory === 'TOUR') return 'Tours';
            return 'Danh mục';
        }
        return applyType; // for SERVICE and PROVINCE, just print the name
    };

    const openCreateDialog = () => {
        setFormData({
            code: '',
            name: '',
            applyTo: 'all',
            discountPercent: '',
            maxDiscountAmount: '',
            quantity: '',
            minSpend: '0',
            startDate: '',
            endDate: '',
        });
        setIsCreateOpen(true);
    };

    const openEditDialog = (promo: DiscountResponse) => {
        setSelectedPromo(promo);
        let applyToVal = 'all';
        if (promo.applyType === 'CATEGORY') {
            applyToVal = 'tour'; // assuming we had some way to know, fallback default
        }

        setFormData({
            code: promo.code,
            name: promo.name || '',
            applyTo: applyToVal, // Simplified
            discountPercent: promo.percentage?.toString() || '',
            maxDiscountAmount: promo.maxDiscountAmount?.toString() || '',
            quantity: promo.quantity?.toString() || '',
            minSpend: promo.minSpend?.toString() || '0',
            startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
            endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
        });
        setIsEditOpen(true);
    };

    const handleCreate = async () => {
        try {
            let applyType: DiscountRequest['applyType'] = 'ALL';
            let categoryType = undefined;
            if (formData.applyTo === 'hotel') {
                applyType = 'CATEGORY';
                categoryType = 'HOTEL' as const;
            } else if (formData.applyTo === 'ticket') {
                applyType = 'CATEGORY';
                categoryType = 'TICKET_VENUE' as const;
            }

            const requestData: DiscountRequest = {
                code: formData.code,
                name: formData.name,
                startDate: formData.startDate ? formData.startDate + 'T00:00:00' : new Date().toISOString(),
                endDate: formData.endDate ? formData.endDate + 'T23:59:59' : new Date().toISOString(),
                quantity: Number(formData.quantity) || 0,
                minSpend: Number(formData.minSpend) || 0,
                applyType,
                categoryType,
                discountType: 'Percentage',
                percentage: Number(formData.discountPercent) || 0,
                maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
            };

            await discountApi.createDiscount(requestData);
            success('Tạo mã ưu đãi thành công!');
            setIsCreateOpen(false);
            fetchPromotions();
        } catch (err: any) {
            error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo mã');
        }
    };

    const handleEdit = async () => {
        if (!selectedPromo) return;
        try {
            let applyType: DiscountRequest['applyType'] = 'ALL';
            let categoryType = undefined;
            if (formData.applyTo === 'hotel') {
                applyType = 'CATEGORY';
                categoryType = 'HOTEL' as const;
            } else if (formData.applyTo === 'ticket') {
                applyType = 'CATEGORY';
                categoryType = 'TICKET_VENUE' as const;
            }

            const requestData: DiscountRequest = {
                code: formData.code,
                name: formData.name,
                startDate: formData.startDate ? formData.startDate + 'T00:00:00' : selectedPromo.startDate,
                endDate: formData.endDate ? formData.endDate + 'T23:59:59' : selectedPromo.endDate,
                quantity: Number(formData.quantity) || 0,
                minSpend: Number(formData.minSpend) || 0,
                applyType,
                categoryType,
                discountType: 'Percentage',
                percentage: Number(formData.discountPercent) || 0,
                maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
            };

            await discountApi.updateDiscount(selectedPromo.id, requestData);
            success('Cập nhật mã ưu đãi thành công!');
            setIsEditOpen(false);
            fetchPromotions();
        } catch (err: any) {
            error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
        }
    };

    const handleDelete = async () => {
        if (!selectedPromo) return;
        try {
            await discountApi.deleteDiscount(selectedPromo.id);
            success(`Đã xóa ưu đãi ${selectedPromo.code}`);
            setIsDeleteOpen(false);
            fetchPromotions();
        } catch (err: any) {
            error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Ưu đãi hệ thống</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Tạo và quản lý các mã giảm giá áp dụng chung trên toàn hệ thống Travello.</p>
                </div>
                <Button
                    onClick={openCreateDialog}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm">
                    <Plus className="w-5 h-5" />
                    Tạo mã ưu đãi
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo mã giảm giá/tên..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on search
                        }}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                                <th className="p-4 font-semibold">Mã ưu đãi</th>
                                <th className="p-4 font-semibold">Mô tả</th>
                                <th className="p-4 font-semibold">Mức giảm</th>
                                <th className="p-4 font-semibold">Thời gian áp dụng</th>
                                <th className="p-4 font-semibold">Số lượng</th>
                                <th className="p-4 font-semibold">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : paginatedPromotions.length > 0 ? (
                                paginatedPromotions.map(promo => {
                                    const statusObj = getStatusTextAndStyle(promo.startDate, promo.endDate);
                                    return (
                                        <tr key={promo.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-blue-500" />
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block">{promo.code}</span>
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/50 mt-1 inline-block">
                                                            Áp dụng: {getApplyToText(promo.applyType)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{promo.name}</td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{promo.discountType === 'Percentage' ? `${promo.percentage}%` : `${promo.fixedPrice}đ`}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Giảm tối đa: {promo.maxDiscountAmount?.toLocaleString()}đ</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <span>{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : ''} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : ''}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {promo.quantity}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Tối thiểu: {promo.minSpend?.toLocaleString()}đ</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusObj.style}`}>
                                                    {statusObj.text}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditDialog(promo)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedPromo(promo); setIsDeleteOpen(true); }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Không tìm thấy mã ưu đãi nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredPromotions.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPromotions.length)}</span> trong <span className="font-medium">{filteredPromotions.length}</span> kết quả
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="h-8 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Trang trước
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Trang sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Promo Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tạo Mã Ưu Đãi Mới</DialogTitle>
                        <DialogDescription>Điền thông tin để tạo mã giảm giá trên toàn hệ thống.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mã ưu đãi (Code)</label>
                                <Input placeholder="VD: SUMMER2024" className="uppercase" value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Áp dụng cho</label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    value={formData.applyTo} onChange={(e) => setFormData(p => ({ ...p, applyTo: e.target.value }))}>
                                    <option value="all">Tất cả dịch vụ</option>
                                    <option value="hotel">Chỉ Khách sạn</option>
                                    <option value="ticket">Chỉ Vé & Vui chơi</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên chương trình / Mô tả</label>
                            <Input placeholder="Nhập tên chương trình..." value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mức giảm (%)</label>
                                <Input type="number" placeholder="10" value={formData.discountPercent} onChange={(e) => setFormData(p => ({ ...p, discountPercent: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Giảm tối đa (VNĐ)</label>
                                <Input type="number" placeholder="500000" value={formData.maxDiscountAmount} onChange={(e) => setFormData(p => ({ ...p, maxDiscountAmount: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn hàng tối thiểu (VNĐ)</label>
                                <Input type="number" placeholder="VD: 100000" value={formData.minSpend} onChange={(e) => setFormData(p => ({ ...p, minSpend: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng giới hạn</label>
                                <Input type="number" placeholder="VD: 100, 0 nếu không giới hạn" value={formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày bắt đầu</label>
                                <Input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày kết thúc</label>
                                <Input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreate}>Tạo mới</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Promo Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa Ưu Đãi</DialogTitle>
                    </DialogHeader>
                    {selectedPromo && (
                        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mã ưu đãi</label>
                                    <Input value={formData.code} className="uppercase" disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Áp dụng cho</label>
                                    <select
                                        value={formData.applyTo}
                                        onChange={(e) => setFormData(p => ({ ...p, applyTo: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                                        <option value="all">Tất cả dịch vụ</option>
                                        <option value="hotel">Chỉ Khách sạn</option>
                                        <option value="ticket">Chỉ Vé & Vui chơi</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên chương trình / Mô tả</label>
                                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mức giảm (%)</label>
                                    <Input type="number" value={formData.discountPercent} onChange={(e) => setFormData(p => ({ ...p, discountPercent: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Giảm tối đa (VNĐ)</label>
                                    <Input type="number" value={formData.maxDiscountAmount} onChange={(e) => setFormData(p => ({ ...p, maxDiscountAmount: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn hàng tối thiểu (VNĐ)</label>
                                    <Input type="number" value={formData.minSpend} onChange={(e) => setFormData(p => ({ ...p, minSpend: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng giới hạn</label>
                                    <Input type="number" value={formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày bắt đầu</label>
                                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày kết thúc</label>
                                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                        <Button onClick={handleEdit}>Lưu thay đổi</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Promo Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa Mã Ưu Đãi</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa mã <strong className="text-gray-900">{selectedPromo?.code}</strong> không?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Xóa ngay
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPromotionsPage;

