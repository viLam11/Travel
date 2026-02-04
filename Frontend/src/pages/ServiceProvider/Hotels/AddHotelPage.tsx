import React, { useState } from 'react';
import { Upload, X, ChevronRight, ChevronLeft, Plus, Trash2, MapPin, Star, Wifi, Coffee, Dumbbell, Car, UtensilsCrossed, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { Button } from '@/components/ui/admin/button';
import { Input } from '@/components/ui/admin/input';
import { Textarea } from '@/components/ui/admin/textarea';
import { Label } from '@/components/ui/admin/label';
import { Badge } from '@/components/ui/admin/badge';

// Types
interface Amenity {
    name: string;
    icon: string;
    available: boolean;
}

interface HotelFormData {
    name: string;
    description: string;
    location: string;
    address: string;
    contactNumber: string;
    starRating: number;
    checkInTime: string;
    checkOutTime: string;
    minPrice: number;
    thumbnailImage: string | null;
    additionalImages: string[];
    amenities: Amenity[];
    tags: string[];
}

const AVAILABLE_AMENITIES = [
    { name: 'WiFi miễn phí', icon: 'wifi' },
    { name: 'Bể bơi', icon: 'pool' },
    { name: 'Phòng gym', icon: 'gym' },
    { name: 'Nhà hàng', icon: 'restaurant' },
    { name: 'Bãi đậu xe', icon: 'parking' },
    { name: 'Spa', icon: 'spa' },
    { name: 'Quầy bar', icon: 'bar' },
    { name: 'Dịch vụ phòng 24/7', icon: 'service' },
];

const AdminAddHotelPage: React.FC = () => {
    const [step, setStep] = useState<'form' | 'review'>('form');

    // Form state
    const [formData, setFormData] = useState<HotelFormData>({
        name: '',
        description: '',
        location: '',
        address: '',
        contactNumber: '',
        starRating: 3,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        minPrice: 0,
        thumbnailImage: null,
        additionalImages: [],
        amenities: AVAILABLE_AMENITIES.map(a => ({ ...a, available: false })),
        tags: [],
    });

    const [newTag, setNewTag] = useState('');

    // Image handlers
    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, thumbnailImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: string[] = [];
            const readFile = (index: number) => {
                if (index >= files.length) {
                    setFormData(prev => ({
                        ...prev,
                        additionalImages: [...prev.additionalImages, ...newImages]
                    }));
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push(reader.result as string);
                    readFile(index + 1);
                };
                reader.readAsDataURL(files[index]);
            };
            readFile(0);
        }
    };

    const removeAdditionalImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            additionalImages: prev.additionalImages.filter((_, i) => i !== index)
        }));
    };

    // Amenity handlers
    const toggleAmenity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.map((amenity, i) =>
                i === index ? { ...amenity, available: !amenity.available } : amenity
            )
        }));
    };

    // Tag handlers
    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    // Navigation
    const proceedToReview = () => {
        setStep('review');
    };

    const backToForm = () => {
        setStep('form');
    };

    const handleSubmit = async () => {
        console.log('Submitting hotel:', formData);
        // TODO: API call to create hotel
        alert('Hotel created successfully! (Mock)');
    };

    const getAmenityIcon = (iconName: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            wifi: <Wifi className="w-5 h-5" />,
            gym: <Dumbbell className="w-5 h-5" />,
            restaurant: <UtensilsCrossed className="w-5 h-5" />,
            parking: <Car className="w-5 h-5" />,
            pool: <Coffee className="w-5 h-5" />,
            spa: <Star className="w-5 h-5" />,
            bar: <Coffee className="w-5 h-5" />,
            service: <Star className="w-5 h-5" />,
        };
        return icons[iconName] || <Star className="w-5 h-5" />;
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Thêm Khách Sạn Mới</h1>
                    <p className="text-muted-foreground mt-1">Điền thông tin chi tiết cho khách sạn của bạn</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 text-sm font-medium">
                    <div className={`px-3 py-1 rounded-full ${step === 'form' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        1. Thông tin
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <div className={`px-3 py-1 rounded-full ${step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        2. Xác nhận
                    </div>
                </div>
            </div>

            {/* Form Step */}
            {step === 'form' && (
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className="shadow-sm border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border">
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Tên khách sạn <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="VD: Khách sạn Majestic Sài Gòn"
                                    className="bg-input border-border"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Mô tả về khách sạn của bạn..."
                                    rows={4}
                                    className="bg-input border-border"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Tỉnh/Thành phố <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="VD: Hồ Chí Minh"
                                        className="bg-input border-border"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="contactNumber">Số điện thoại <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                                        placeholder="VD: 0901234567"
                                        className="bg-input border-border"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Địa chỉ chi tiết <span className="text-destructive">*</span></Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="VD: 123 đường ABC, Quận 1"
                                    className="bg-input border-border"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Hạng sao <span className="text-destructive">*</span></Label>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, starRating: star }))}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= formData.starRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted stroke-muted-foreground'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="checkInTime">Giờ nhận phòng</Label>
                                    <Input
                                        id="checkInTime"
                                        type="time"
                                        value={formData.checkInTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                                        className="bg-input border-border"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="checkOutTime">Giờ trả phòng</Label>
                                    <Input
                                        id="checkOutTime"
                                        type="time"
                                        value={formData.checkOutTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                                        className="bg-input border-border"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="minPrice">Giá phòng thấp nhất (VNĐ) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="minPrice"
                                    type="number"
                                    value={formData.minPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                                    placeholder="VD: 500000"
                                    className="bg-input border-border"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card className="shadow-sm border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border">
                            <CardTitle>Hình ảnh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            {/* Thumbnail */}
                            <div className="grid gap-2">
                                <Label>Ảnh đại diện <span className="text-destructive">*</span></Label>
                                <div className="mt-2">
                                    {formData.thumbnailImage ? (
                                        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border group">
                                            <img src={formData.thumbnailImage} alt="Thumbnail" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbnailImage: null }))}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa ảnh
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click để tải ảnh lên</span> hoặc kéo thả</p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x400px)</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Additional Images */}
                            <div className="grid gap-2">
                                <Label>Ảnh bổ sung (Gallery)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {formData.additionalImages.map((img, index) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                                            <img src={img} alt={`Additional ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeAdditionalImage(index)}
                                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-video border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                                        <Plus className="w-8 h-8 mb-1" />
                                        <span className="text-xs">Thêm ảnh</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleAdditionalImagesUpload} />
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    <Card className="shadow-sm border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border">
                            <CardTitle>Tiện nghi nổi bật</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        onClick={() => toggleAmenity(index)}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 text-center hover:shadow-sm ${amenity.available
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'
                                            }`}
                                    >
                                        {getAmenityIcon(amenity.icon)}
                                        <span className="text-sm font-medium">{amenity.name}</span>
                                        {amenity.available && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card className="shadow-sm border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border">
                            <CardTitle>Tags (Gắn thẻ)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="VD: Gần biển, Trung tâm thành phố..."
                                    className="bg-input border-border"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button type="button" onClick={addTag} variant="secondary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {formData.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => removeTag(index)} className="hover:text-destructive transition-colors ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {formData.tags.length === 0 && <span className="text-sm text-muted-foreground italic flex items-center">Chưa có tag nào</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={proceedToReview} size="lg" className="w-full sm:w-auto">
                            Tiếp theo: Xem lại
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
                <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
                    <Card className="shadow-sm border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border">
                            <CardTitle>Xác nhận thông tin</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-6">
                            {/* Basic Info Review */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Thông tin chung
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm p-4 bg-muted/30 rounded-lg border border-border">
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Tên khách sạn:</span>
                                        <p className="font-medium text-base">{formData.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Hạng sao:</span>
                                        <div className="flex gap-1">
                                            {Array.from({ length: formData.starRating }).map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-muted-foreground block mb-1">Địa chỉ:</span>
                                        <p className="font-medium flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            {formData.address}, {formData.location}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Số điện thoại:</span>
                                        <p className="font-medium">{formData.contactNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Giá từ:</span>
                                        <p className="font-medium text-primary">{formData.minPrice.toLocaleString('vi-VN')} VNĐ/đêm</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Check-in / Check-out:</span>
                                        <p className="font-mono bg-muted px-2 py-1 rounded inline-block">{formData.checkInTime} / {formData.checkOutTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {formData.description && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Mô tả</h3>
                                    <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                                </div>
                            )}

                            {/* Images Review */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Hình ảnh ({formData.additionalImages.length + (formData.thumbnailImage ? 1 : 0)})</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.thumbnailImage && (
                                        <div className="col-span-2 row-span-2 relative group rounded-lg overflow-hidden border border-border shadow-sm">
                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Ảnh đại diện</div>
                                            <img src={formData.thumbnailImage} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    {formData.additionalImages.map((img, index) => (
                                        <img key={index} src={img} alt={`Additional ${index}`} className="w-full aspect-video object-cover rounded-lg border border-border shadow-sm" />
                                    ))}
                                </div>
                            </div>

                            {/* Amenities Review */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Tiện nghi đã chọn</h3>
                                <div className="flex flex-wrap gap-3">
                                    {formData.amenities.filter(a => a.available).length > 0 ? (
                                        formData.amenities.filter(a => a.available).map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md border border-primary/20">
                                                {getAmenityIcon(amenity.icon)}
                                                <span className="text-sm font-medium">{amenity.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground italic">Chưa chọn tiện nghi nào</span>
                                    )}
                                </div>
                            </div>

                            {/* Tags Review */}
                            {formData.tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="px-3 py-1">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={backToForm} size="lg">
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Quay lại chỉnh sửa
                        </Button>
                        <Button onClick={handleSubmit} size="lg" className="px-8">
                            Xác nhận & Tạo Khách Sạn
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAddHotelPage;
