// src/pages/ServiceProvider/Services/ServiceSetup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/admin/card';
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
import { Hotel, Map, Upload, X, CheckCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/AuthContext';

interface ServiceSetupProps {
    initialData?: any;
    onCancel?: () => void;
}

const ServiceSetup = ({ initialData, onCancel }: ServiceSetupProps) => {
    const navigate = useNavigate();
    const { completeServiceSetup } = useAuthContext();

    // Mock: Get service type from user profile (hotel or tour)
    const userServiceType = 'hotel'; // In real app, from auth context

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location: initialData?.location || '',
        address: initialData?.address || '',
        description: initialData?.description || '',
        // Hotel specific
        starRating: initialData?.starRating?.toString() || '',
        checkInTime: initialData?.checkInTime || '14:00',
        checkOutTime: initialData?.checkOutTime || '12:00',
        amenities: initialData?.amenities || [] as string[],
        // Tour specific
        duration: initialData?.duration || '',
        difficulty: initialData?.difficulty || '',
        groupSize: initialData?.groupSize || '',
        includedItems: initialData?.includedItems || [] as string[],
        // Common
        images: initialData?.images || [] as string[],
    });

    const amenitiesList = [
        'WiFi', 'Hồ bơi', 'Phòng gym', 'Spa', 'Nhà hàng', 'Quầy bar',
        'Bãi đỗ xe', 'Dịch vụ phòng', 'Giặt ủi', 'Đưa đón sân bay'
    ];

    const includedItemsList = [
        'Phương tiện', 'Bữa ăn', 'Hướng dẫn viên', 'Phí vào cửa',
        'Bảo hiểm', 'Chỗ ở', 'Thiết bị', 'Ảnh lưu niệm'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleItem = (item: string, field: 'amenities' | 'includedItems') => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter((i: string) => i !== item)
                : [...prev[field], item]
        }));
    };

    const handleAddImage = () => {
        const mockImage = `https://images.unsplash.com/photo-${Date.now()}`;
        setFormData(prev => ({ ...prev, images: [...prev.images, mockImage] }));
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newService = {
            ...formData,
            type: userServiceType,
            status: 'draft', // Will be reviewed by admin
            createdAt: new Date().toISOString(),
        };

        console.log('Creating service:', newService);

        // Simulate API call and success
        if (completeServiceSetup) {
            completeServiceSetup();
            // No need to navigate manually if ProviderMyService handles the redirect/render based on hasService state
            // But if ProviderMyService re-renders, it will show the details.
        } else {
            // Fallback
            alert(`Service "${formData.name}" created successfully!`);
            navigate(ROUTES.PROVIDER_DASHBOARD);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                {/* Welcome Header */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                {userServiceType === 'hotel' ? (
                                    <Hotel className="w-6 h-6 text-primary" />
                                ) : (
                                    <Map className="w-6 h-6 text-primary" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold mb-2">Chào mừng! Hãy thiết lập {userServiceType === 'hotel' ? 'Khách sạn' : 'Tour'} của bạn</h1>
                                <p className="text-muted-foreground">
                                    Hoàn thành thông tin bên dưới để tạo hồ sơ dịch vụ của bạn.
                                    Sau khi gửi, đội ngũ quản trị sẽ xem xét và phê duyệt dịch vụ của bạn.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Cung cấp thông tin cơ bản về {userServiceType === 'hotel' ? 'khách sạn' : 'tour'} của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">
                                    {userServiceType === 'hotel' ? 'Tên Khách sạn' : 'Tên Tour'} *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder={userServiceType === 'hotel' ? 'Ví dụ: Khách sạn Grand Saigon' : 'Ví dụ: Tour Khám phá Vịnh Hạ Long'}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Thành phố *</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="Ví dụ: TP. Hồ Chí Minh"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Địa chỉ đầy đủ *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Quận 1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Mô tả *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả dịch vụ, điểm nổi bật và điều gì khiến nó đặc biệt..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service-Specific Details */}
                    {userServiceType === 'hotel' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin Khách sạn</CardTitle>
                                <CardDescription>Thông tin chi tiết về khách sạn</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="starRating">Xếp hạng Sao *</Label>
                                        <Select value={formData.starRating} onValueChange={(value) => handleInputChange('starRating', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn xếp hạng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3 Sao</SelectItem>
                                                <SelectItem value="4">4 Sao</SelectItem>
                                                <SelectItem value="5">5 Sao</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="checkInTime">Giờ nhận phòng *</Label>
                                        <Input
                                            id="checkInTime"
                                            type="time"
                                            value={formData.checkInTime}
                                            onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="checkOutTime">Giờ trả phòng *</Label>
                                        <Input
                                            id="checkOutTime"
                                            type="time"
                                            value={formData.checkOutTime}
                                            onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Tiện ích Khách sạn</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                        {amenitiesList.map((amenity) => (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => toggleItem(amenity, 'amenities')}
                                                className={`p-3 border rounded-lg text-sm transition-all ${formData.amenities.includes(amenity)
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin Tour</CardTitle>
                                <CardDescription>Thông tin chi tiết về tour</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="duration">Thời lượng *</Label>
                                        <Input
                                            id="duration"
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            placeholder="Ví dụ: 3 ngày 2 đêm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="difficulty">Mức độ khó *</Label>
                                        <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn mức độ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">Dễ</SelectItem>
                                                <SelectItem value="moderate">Trung bình</SelectItem>
                                                <SelectItem value="challenging">Khó</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="groupSize">Số người tối đa *</Label>
                                        <Input
                                            id="groupSize"
                                            type="number"
                                            value={formData.groupSize}
                                            onChange={(e) => handleInputChange('groupSize', e.target.value)}
                                            placeholder="Ví dụ: 15"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Đã bao gồm</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                        {includedItemsList.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleItem(item, 'includedItems')}
                                                className={`p-3 border rounded-lg text-sm transition-all ${formData.includedItems.includes(item)
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hình ảnh</CardTitle>
                            <CardDescription>Tải lên hình ảnh để giới thiệu {userServiceType === 'hotel' ? 'khách sạn' : 'tour'} của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddImage}
                                className="w-full"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Thêm hình ảnh (Demo)
                            </Button>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((image: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                                <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Card className="border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">Sẵn sàng gửi?</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Dịch vụ của bạn sẽ được gửi để quản trị viên xem xét. Bạn sẽ được thông báo khi được phê duyệt.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1">
                                    Gửi để xem xét
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onCancel ? onCancel() : navigate(ROUTES.PROVIDER_DASHBOARD)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default ServiceSetup;
