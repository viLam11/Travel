// src/pages/ServiceProvider/Services/ProviderMyService.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/admin/button';
import { Badge } from '@/components/ui/admin/badge';
import { Input } from '@/components/ui/admin/input';
import { Textarea } from '@/components/ui/admin/textarea';
import { Label } from '@/components/ui/admin/label';
import {
    MapPin,
    Clock,
    Star,
    ChevronLeft,
    ChevronRight,
    Edit,
    CheckCircle,
    X,
    Camera,
    Save,
    Plus,
    Trash2,
    Sun,
    Moon,
    ImagePlus,
    Star as StarIcon
} from 'lucide-react';
import ServiceSetup from './ServiceSetup';
import { Card, CardContent } from '@/components/ui/admin/card';
import { serviceDetailApi } from '@/api/serviceDetailApi';
import TicketsTab from './components/TicketsTab';
import PricingCalendarTab from './components/PricingCalendarTab';
import PromotionsTab from './components/PromotionsTab';

const ProviderMyService = () => {
    const { currentUser } = useAuthContext();
    const { isDark, setTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'info' | 'tickets' | 'pricing' | 'promotions'>('info');
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const hasService = currentUser?.user?.hasService;
    const serviceType = currentUser?.user?.providerType || 'hotel';
    const serviceId = currentUser?.user?.serviceId;

    // Fallback to default if not found
    const initialServiceData = {
        id: serviceId,
        name: "Dịch vụ của tôi",
        type: serviceType,
        location: "",
        address: "",
        description: "",
        status: "active" as const,
        rating: 0,
        reviews: 0,
        price: 0,
        images: [],
        attributes: [],
        policies: {
            cancellation: "",
            notes: ""
        }
    };

    const [serviceData, setServiceData] = useState<any>(initialServiceData);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!serviceId) return;
            setIsLoading(true);
            try {
                // We use '' for destination/type for this provider page
                const data = await serviceDetailApi.getServiceDetail('', '', serviceId.toString());
                if (data) {
                    // Adapt ServiceDetail to the page's structure
                    setServiceData({
                        ...data,
                        status: 'active' as const, // Default for now
                        attributes: data.features || [],
                        images: data.images || [],
                        policies: {
                            cancellation: "Chính sách hủy linh hoạt.",
                            notes: "Nên mang theo giày đi bộ."
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to fetch service detail for provider:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (hasService) {
            fetchServiceData();
        }
    }, [serviceId, hasService]);

    // Handlers for inputs
    const handleInputChange = (field: string, value: any) => {
        setServiceData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handlePolicyChange = (field: string, value: any) => {
        setServiceData((prev: any) => ({ ...prev, policies: { ...prev.policies, [field]: value } }));
    };

    const handleAttributeRemove = (index: number) => {
        setServiceData((prev: any) => ({ ...prev, attributes: prev.attributes.filter((_: any, i: number) => i !== index) }));
    };

    const handleSave = () => {
        console.log("Saving service data:", serviceData);
        alert("Đã lưu thay đổi thành công!");
        setIsEditing(false);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? serviceData.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === serviceData.images.length - 1 ? 0 : prev + 1
        );
    };

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newUrls = Array.from(files).map(file => URL.createObjectURL(file));
        setServiceData((prev: any) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        e.target.value = '';
    };

    const handleDeleteImage = (idx: number) => {
        if (serviceData.images.length <= 1) {
            alert('Phải có ít nhất 1 ảnh!');
            return;
        }
        setServiceData((prev: any) => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== idx) }));
        setCurrentImageIndex(prev => Math.max(0, Math.min(prev, serviceData.images.length - 2)));
    };

    const handleSetThumbnail = (idx: number) => {
        setServiceData((prev: any) => {
            const imgs = [...prev.images];
            const [picked] = imgs.splice(idx, 1);
            imgs.unshift(picked);
            return { ...prev, images: imgs };
        });
        setThumbnailIndex(0);
        setCurrentImageIndex(0);
    };

    // Derived thumbnails from images
    const thumbnails = serviceData?.images || [];

    // If no service yet, show setup form (First time experience)
    if (!hasService || serviceId === undefined) {
        return <ServiceSetup />;
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
                    <p className="text-lg font-medium animate-pulse bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Đang tải thông tin dịch vụ...</p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className?: string }> = {
            active: { variant: 'default', label: 'Hoạt động', className: 'bg-green-500 hover:bg-green-600' },
            draft: { variant: 'secondary', label: 'Nháp', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
            inactive: { variant: 'outline', label: 'Ngưng hoạt động', className: '' },
        };
        const config = variants[status] || variants.active;
        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    };

    return (
        <div className="isolate-light min-h-screen pb-10">

            {/* Dark Mode Warning Banner */}
            {isDark && !bannerDismissed && (
                <div className="w-full animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-4 py-3 shadow-lg">
                        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Moon className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm leading-tight">
                                        Bạn đang ở chế độ tối
                                    </p>
                                    <p className="text-xs text-amber-100 mt-0.5 leading-tight">
                                        Trang này hiển thị giao diện giống với trải nghiệm thực tế của khách hàng. Chuyển sang chế độ sáng để xem đúng nhất.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setTheme('light')}
                                    className="flex items-center gap-1.5 bg-white text-orange-600 hover:bg-orange-50 font-semibold text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 shadow-sm cursor-pointer"
                                >
                                    <Sun className="w-3.5 h-3.5" />
                                    Chuyển sang chế độ sáng
                                </button>
                                <button
                                    onClick={() => setBannerDismissed(true)}
                                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer"
                                    aria-label="Đóng thông báo"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Action Bar - Always visible when scrolled */}
            {isEditing && (
                <div className="sticky top-0 z-50 bg-white border-b shadow-sm p-4 animate-in slide-in-from-top-2">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <span className="font-semibold text-lg flex items-center gap-2">
                            <Edit className="w-5 h-5 text-orange-600" />
                            Đang chỉnh sửa dịch vụ
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {
                                setServiceData(initialServiceData); // Reset changes
                                setIsEditing(false);
                            }}>
                                Hủy bỏ
                            </Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                <Save className="w-4 h-4 mr-2" />
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Title Section */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-4 mb-2">
                                {isEditing ? (
                                    <div className="space-y-4 max-w-2xl w-full">
                                        <div className="space-y-2">
                                            <Label htmlFor="service-name" className="text-sm font-semibold">Tên dịch vụ</Label>
                                            <Input
                                                id="service-name"
                                                value={serviceData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="text-2xl font-bold h-12 px-4 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">
                                        {serviceData.name}
                                    </h1>
                                )}
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(serviceData.status)}
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-primary hover:bg-primary/90 gap-2 shadow-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Chỉnh sửa
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                                    <div>
                                        <Label htmlFor="address">Địa chỉ hiển thị</Label>
                                        <Input
                                            id="address"
                                            value={serviceData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Thành phố/Địa điểm</Label>
                                        <Input
                                            id="location"
                                            value={serviceData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-gray-900">{serviceData.rating}</span>
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span>({serviceData.reviews} đánh giá)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <span>{serviceData.address}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="mb-8 lg:mb-10 relative group bg-muted/30 rounded-xl p-1 border border-border">

                    {/* Hidden file input for adding images */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddImages}
                    />

                    {isEditing && (
                        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                <Camera className="w-4 h-4 text-orange-500" /> Quản lý hình ảnh
                            </p>
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className="flex items-center gap-2 text-sm text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm w-full justify-center cursor-pointer"
                            >
                                <ImagePlus className="w-4 h-4" />
                                Thêm ảnh mới
                            </button>
                            <p className="text-xs text-gray-400 mt-2">
                                ⭐ Hover ảnh → đặt thumbnail / xóa
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 h-[400px] lg:h-[500px]">
                        {/* Main Image */}
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-200 border">
                            <img
                                src={serviceData.images[currentImageIndex]}
                                alt={serviceData.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Thumbnail badge on current main image */}
                            {currentImageIndex === thumbnailIndex && (
                                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                                    <StarIcon className="w-3 h-3" />
                                    Thumbnail
                                </div>
                            )}

                            {!isEditing && (
                                <>
                                    <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                                    </button>
                                    <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ChevronRight className="w-6 h-6 text-gray-900" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails strip */}
                        <div className="lg:w-[140px] flex-shrink-0 flex lg:flex-col gap-3 overflow-auto">
                            {thumbnails.map((thumb: string, idx: number) => (
                                <div key={idx} className="relative group/thumb flex-shrink-0">
                                    <button
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative aspect-square rounded-lg overflow-hidden w-full border-2 transition-all block cursor-pointer ${currentImageIndex === idx
                                            ? 'border-orange-500 ring-2 ring-orange-200'
                                            : 'border-transparent hover:border-orange-300'
                                            }`}
                                    >
                                        <img
                                            src={thumb}
                                            alt={`Ảnh ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Star badge for thumbnail image */}
                                        {idx === thumbnailIndex && (
                                            <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-0.5 shadow">
                                                <StarIcon className="w-3 h-3 text-yellow-900" />
                                            </div>
                                        )}
                                    </button>

                                    {/* Edit overlay: set thumbnail + delete */}
                                    {isEditing && (
                                        <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                            {idx !== thumbnailIndex && (
                                                <button
                                                    className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 p-1.5 rounded-full shadow transition-transform hover:scale-110 cursor-pointer"
                                                    title="Đặt làm thumbnail"
                                                    onClick={(e) => { e.stopPropagation(); handleSetThumbnail(idx); }}
                                                >
                                                    <StarIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                className="bg-red-500 hover:bg-red-400 text-white p-1.5 rounded-full shadow transition-transform hover:scale-110 cursor-pointer"
                                                title="Xóa ảnh"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(idx); }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add image button at end of strip */}
                            {isEditing && (
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex-shrink-0 aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-400 hover:bg-orange-50 transition-colors bg-white cursor-pointer"
                                    title="Thêm ảnh"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200">
                            <div className="flex gap-8 overflow-x-auto pb-1 no-scrollbar">
                                {[
                                    { id: 'info', label: 'Thông tin' },
                                    { id: 'tickets', label: serviceType === 'hotel' ? 'Loại phòng' : 'Các loại vé' },
                                    { id: 'pricing', label: 'Lịch & Giá' },
                                    { id: 'promotions', label: 'Ưu đãi' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`pb-3 font-semibold transition-colors relative whitespace-nowrap px-1 cursor-pointer ${activeTab === tab.id
                                            ? "text-orange-600 border-b-2 border-orange-500"
                                            : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-200"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === 'info' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    {/* Description Section */}
                                    <section className={`rounded-xl ${isEditing ? 'p-6 border-2 border-primary/20 bg-primary/5' : ''}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-foreground/90">Giới thiệu</h3>
                                        </div>
                                        {isEditing ? (
                                            <Textarea
                                                value={serviceData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                className="min-h-[150px] bg-white"
                                                placeholder="Mô tả về dịch vụ của bạn..."
                                            />
                                        ) : (
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                                                {serviceData.description}
                                            </p>
                                        )}
                                    </section>

                                    {/* Amenities Section */}
                                    <section className={`rounded-xl ${isEditing ? 'p-6 border-2 border-primary/20 bg-primary/5' : ''}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-foreground/90">
                                                {serviceType === 'hotel' ? 'Tiện nghi khách sạn' : 'Điểm nổi bật & Dịch vụ'}
                                            </h3>
                                        </div>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {serviceData.attributes.map((attr: any, idx: number) => (
                                                        <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2 text-sm">
                                                            {attr.label}
                                                            <button
                                                                onClick={() => handleAttributeRemove(idx)}
                                                                className="hover:bg-red-200 rounded-full p-0.5 text-red-600 cursor-pointer"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                    <Button variant="outline" size="sm" className="h-7 text-xs border-dashed cursor-pointer">
                                                        <Plus className="w-3 h-3 mr-1" /> Thêm tiện ích
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {serviceData.attributes.map((attr: any, idx: number) => (
                                                    <div key={idx} className="bg-orange-50/50 p-3 rounded-lg flex items-center gap-3 border border-orange-100">
                                                        {/* Icon placeholder - in real app would map icon name to component */}
                                                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium text-sm">{attr.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Policies Section */}
                                    <section className={`rounded-xl ${isEditing ? 'p-4 border border-blue-200 bg-blue-50/30' : ''}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {serviceType === 'hotel' ? 'Chính sách khách sạn' : 'Thông tin & Chính sách tour'}
                                            </h3>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2 text-orange-600 font-medium">
                                                        <Clock className="w-5 h-5" />
                                                        <span>{serviceType === 'hotel' ? 'Nhận phòng' : 'Giờ khởi hành'}</span>
                                                    </div>
                                                    {isEditing ? (
                                                        <Input
                                                            value={serviceData.policies.checkIn}
                                                            onChange={(e) => handlePolicyChange('checkIn', e.target.value)}
                                                            className="bg-white"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-600 pl-7">
                                                            {serviceType === 'hotel' ? 'Từ ' : ''}{serviceData.policies.checkIn}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2 text-orange-600 font-medium">
                                                        <Clock className="w-5 h-5" />
                                                        <span>{serviceType === 'hotel' ? 'Trả phòng' : 'Giờ kết thúc'}</span>
                                                    </div>
                                                    {isEditing ? (
                                                        <Input
                                                            value={serviceData.policies.checkOut}
                                                            onChange={(e) => handlePolicyChange('checkOut', e.target.value)}
                                                            className="bg-white"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-600 pl-7">
                                                            {serviceType === 'hotel' ? 'Trước ' : ''}{serviceData.policies.checkOut}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-6">
                                                <h4 className="font-bold text-gray-900 mb-3">Lưu ý quan trọng</h4>
                                                {isEditing ? (
                                                    <Textarea
                                                        value={serviceData.policies.notes}
                                                        onChange={(e) => handlePolicyChange('notes', e.target.value)}
                                                        rows={4}
                                                        className="bg-white"
                                                    />
                                                ) : (
                                                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                                        {serviceData.policies.notes ? (
                                                            serviceData.policies.notes.split('\n').map((note: string, idx: number) => (
                                                                <li key={idx}>{note}</li>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <li>Vui lòng xuất trình CMND/CCCD khi nhận phòng</li>
                                                                <li>Không hút thuốc trong phòng</li>
                                                                <li>Không được mang thú cưng</li>
                                                                <li>Hủy miễn phí trước 24h</li>
                                                            </>
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'tickets' && (
                                <TicketsTab serviceId={serviceId as number} serviceType={serviceType} />
                            )}

                            {activeTab === 'pricing' && (
                                <PricingCalendarTab serviceId={serviceId as number} basePrice={serviceData.price} />
                            )}

                            {activeTab === 'promotions' && (
                                <PromotionsTab serviceId={serviceId!.toString()} />
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Stats */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-md border-border">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Tổng quan dịch vụ</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Trạng thái</span>
                                            {getStatusBadge(serviceData.status)}
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Đánh giá</span>
                                            <div className="flex items-center gap-1 font-medium">
                                                {serviceData.rating} <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Lượt xem</span>
                                            <span className="font-medium">1,245</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Yêu thích</span>
                                            <span className="font-medium">45</span>
                                        </div>
                                    </div>
                                </div>

                                {!isEditing ? (
                                    <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => setIsEditing(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Cập nhật thông tin
                                    </Button>
                                ) : (
                                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSave}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu thay đổi
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderMyService;
