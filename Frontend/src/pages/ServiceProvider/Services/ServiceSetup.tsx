// src/pages/ServiceProvider/Services/ServiceSetup.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Label } from '@/components/ui/admin/label';
import { Textarea } from '@/components/ui/admin/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/admin/select';
import { X, CheckCircle, Hotel, Map, UploadCloud, ImagePlus } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@/services/apiClient';
import { ROUTES } from '@/constants/routes';

interface ServiceSetupProps {
    initialData?: any;
    onCancel?: () => void;
}

import { PROVINCES } from '@/constants/provinces';

const ServiceSetup = ({ initialData, onCancel }: ServiceSetupProps) => {
    const navigate = useNavigate();
    const { currentUser, completeServiceSetup } = useAuthContext();
    const userServiceType = currentUser?.user?.providerType || 'hotel';

    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        provinceCode: initialData?.provinceCode || 'SG',
        address: initialData?.address || '',
        description: initialData?.description || '',
        contactNumber: initialData?.contactNumber || '',
        averagePrice: initialData?.averagePrice?.toString() || '',
        startTime: initialData?.startTime || '14:00',
        endTime: initialData?.endTime || '12:00',
        tags: initialData?.tags || [] as string[],
        images: initialData?.images || [] as string[],
    });

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tagList = userServiceType === 'hotel' 
        ? ['WiFi', 'Hồ bơi', 'Phòng gym', 'Spa', 'Nhà hàng', 'Quầy bar', 'Bãi đỗ xe', 'Dịch vụ phòng', 'Giặt ủi', 'Đưa đón sân bay']
        : ['Phương tiện di chuyển', 'Bữa ăn', 'Hướng dẫn viên', 'Phí vào cửa', 'Bảo hiểm', 'Trang thiết bị', 'Quà lưu niệm', 'Hoạt động dã ngoại'];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleItem = (item: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(item)
                ? prev.tags.filter((i: string) => i !== item)
                : [...prev.tags, item]
        }));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setPhotoFiles(prev => [...prev, ...filesArray]);

            const fakeUrls = filesArray.map(f => URL.createObjectURL(f));
            setFormData(prev => ({ ...prev, images: [...prev.images, ...fakeUrls] }));
        }
    };

    const handleRemoveImage = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!thumbnailFile) {
            alert('Vui lòng tải lên ảnh Thumbnail!');
            return;
        }

        setIsSubmitting(true);
        try {
            const apiClient = new ApiClient();

            const apiParams = {
                serviceName: formData.name,
                description: formData.description,
                provinceCode: formData.provinceCode,
                address: formData.address,
                contactNumber: formData.contactNumber,
                averagePrice: parseInt(formData.averagePrice) || 0,
                tags: formData.tags.join(','),
                serviceType: userServiceType === 'hotel' ? 'HOTEL' : 'TICKET_VENUE',
                start_time: formData.startTime ? formData.startTime + ':00' : '08:00:00',
                end_time: formData.endTime ? formData.endTime + ':00' : '22:00:00',
            };

            await apiClient.services.create(apiParams, thumbnailFile, photoFiles);

            if (completeServiceSetup) {
                completeServiceSetup();
            } else {
                alert(`Dịch vụ "${formData.name}" đã được tạo thành công! Chờ Admin phê duyệt.`);
                navigate(ROUTES.PROVIDER_DASHBOARD);
            }
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Đã có lỗi xảy ra khi tạo dịch vụ!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTags = (items: string[]) => (
        <div className="flex flex-wrap gap-2 mt-2 auto-rows-max">
            {items.map((item) => {
                const selected = formData.tags.includes(item);
                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                            selected
                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground'
                        }`}
                    >
                        {selected && <CheckCircle className="w-3 h-3" />}
                        {item}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-full bg-background py-8">
            <div className="max-w-5xl mx-auto px-4 space-y-5">

                {/* ── Welcome Banner ── */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                    <div className="relative flex items-center gap-5">
                        <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20">
                            {userServiceType === 'hotel'
                                ? <Hotel className="w-7 h-7 text-primary" />
                                : <Map className="w-7 h-7 text-primary" />
                            }
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Chào mừng! Hãy thiết lập dịch vụ của bạn</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Hoàn thành thông tin bên dưới để tạo hồ sơ dịch vụ. {' '}
                                <span className="font-medium text-foreground/80">Sau khi gửi, đội ngũ quản trị sẽ xem xét và phê duyệt.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Main 2-column card ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* LEFT: Basic Info */}
                        <div className="rounded-2xl border border-border bg-background shadow-sm p-6 space-y-5">
                            <div>
                                <p className="text-base font-semibold">Thông tin cơ bản</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Cung cấp thông tin tổng quan về dịch vụ của bạn</p>
                            </div>
                            <div className="h-px bg-border" />

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Tên dịch vụ *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={userServiceType === 'hotel' ? 'Ví dụ: Khách sạn Grand Saigon' : 'Ví dụ: Khu du lịch Suối Tiên'}
                                        className="mt-1.5"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tỉnh / Thành phố *</Label>
                                        <Select value={formData.provinceCode} onValueChange={(v) => handleInputChange('provinceCode', v)}>
                                            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Chọn Tỉnh" /></SelectTrigger>
                                            <SelectContent>
                                                {PROVINCES.map(p => (
                                                    <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Địa chỉ chi tiết *</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Số 123 Đường ABC..."
                                            className="mt-1.5"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="contactNumber" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Số điện thoại *</Label>
                                        <Input
                                            id="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                            placeholder="Ví dụ: 0901234567"
                                            className="mt-1.5"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="averagePrice" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Giá trung bình (VND) *</Label>
                                        <Input
                                            id="averagePrice"
                                            type="number"
                                            value={formData.averagePrice}
                                            onChange={(e) => handleInputChange('averagePrice', e.target.value)}
                                            placeholder="Ví dụ: 1000000"
                                            className="mt-1.5"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mô tả *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Mô tả dịch vụ, điểm nổi bật và điều gì khiến nó đặc biệt..."
                                        rows={5}
                                        className="mt-1.5 resize-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Detail Info */}
                        <div className="rounded-2xl border border-border bg-background shadow-sm p-6 space-y-5">
                            <div>
                                <p className="text-base font-semibold">Đặc điểm & Hình ảnh</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Hoàn thiện thêm các đặc tính và tải lên bộ ảnh minh họa
                                </p>
                            </div>
                            <div className="h-px bg-border" />

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {userServiceType === 'hotel' ? 'Giờ Nhận phòng *' : 'Giờ Mở cửa *'}
                                        </Label>
                                        <Input type="time" value={formData.startTime} onChange={(e) => handleInputChange('startTime', e.target.value)} className="mt-1.5" required />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {userServiceType === 'hotel' ? 'Giờ Trả phòng *' : 'Giờ Đóng cửa *'}
                                        </Label>
                                        <Input type="time" value={formData.endTime} onChange={(e) => handleInputChange('endTime', e.target.value)} className="mt-1.5" required />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {userServiceType === 'hotel' ? 'Tiện ích nổi bật' : 'Hoạt động & Dịch vụ đi kèm'}
                                    </Label>
                                    {renderTags(tagList)}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="h-px bg-border" />
                            <div className="space-y-3">
                                <p className="text-sm font-semibold">Tài liệu hình ảnh</p>

                                {/* Thumbnail Upload */}
                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ảnh Thumbnail (Bắt buộc) *</Label>
                                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                                    <button
                                        type="button"
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="mt-1.5 w-full flex items-center gap-3 px-4 py-2.5 border border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <UploadCloud className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground truncate flex-1 text-left">
                                            {thumbnailFile ? thumbnailFile.name : 'Click để chọn ảnh bìa (thumbnail)'}
                                        </span>
                                        {thumbnailPreview && (
                                            <img src={thumbnailPreview} alt="thumb" className="h-8 w-12 object-cover rounded" />
                                        )}
                                    </button>
                                </div>

                                {/* Gallery Upload */}
                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bộ ảnh minh họa</Label>
                                    <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                        className="mt-1.5 w-full flex items-center gap-3 px-4 py-2.5 border border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <ImagePlus className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground truncate flex-1 text-left">
                                            {photoFiles.length > 0 ? `Đã chọn ${photoFiles.length} tệp` : 'Click để tải lên bộ ảnh giới thiệu chi tiết'}
                                        </span>
                                    </button>
                                </div>

                                {/* Gallery Preview */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {formData.images.map((image: string, index: number) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5"
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

                    {/* ── Submit Bar ── */}
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Sẵn sàng gửi?</p>
                                <p className="text-xs text-muted-foreground">
                                    Vui lòng kiểm tra kỹ thông tin. Hồ sơ sẽ được xử lý trong vòng 24h.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                className="bg-background"
                                onClick={() => onCancel ? onCancel() : navigate(ROUTES.PROVIDER_DASHBOARD)}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" className="px-8" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang gửi...' : 'Gửi để duyệt'}
                            </Button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ServiceSetup;
