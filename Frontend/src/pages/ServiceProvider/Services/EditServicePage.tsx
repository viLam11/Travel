// src/pages/ServiceProvider/Services/EditServicePage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { serviceApi } from '@/api/serviceApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/admin/card';
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
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function EditServicePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch service data
    const { data: service, isLoading, error } = useQuery({
        queryKey: ['service', id],
        queryFn: () => serviceApi.getServiceById(id!),
        enabled: !!id,
    });

    const [serviceType, setServiceType] = useState<'hotel' | 'tour'>('hotel');
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        basePrice: '',
        // Hotel specific
        starRating: '',
        checkInTime: '',
        checkOutTime: '',
        amenities: [] as string[],
        // Tour specific
        duration: '',
        difficulty: '',
        groupSize: '',
        includedItems: [] as string[],
    });

    const [images, setImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (service) {
            setServiceType(service.type as 'hotel' | 'tour');
            setImages(service.images || []);
            setFormData({
                name: service.serviceName || '',
                location: service.location || '',
                description: service.description || '',
                basePrice: service.price ? service.price.toString() : '',
                starRating: service.starRating ? service.starRating.toString() : '',
                checkInTime: '14:00', // Mock default
                checkOutTime: '12:00', // Mock default
                amenities: service.amenities || [],
                duration: service.duration || '',
                difficulty: service.difficulty || 'moderate',
                groupSize: service.groupSize ? service.groupSize.toString() : '',
                includedItems: [], // Mock default
            });
        }
    }, [service]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileList = Array.from(files);
            setNewImageFiles(prev => [...prev, ...fileList]);

            // Add preview URLs
            fileList.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveImage = (index: number) => {
        // Find if this image was one of the newly added ones
        // This is a bit simplified, ideally we track original vs new
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSaving(true);
        try {
            // 1. Update basic info
            await serviceApi.updateService(id, {
                serviceName: formData.name,
                description: formData.description,
                location: formData.location,
                price: Number(formData.basePrice),
                starRating: Number(formData.starRating),
                amenities: formData.amenities
            });

            // 2. Upload new images if any
            if (newImageFiles.length > 0) {
                await serviceApi.uploadImages(id, newImageFiles);
            }

            toast.success(`Cập nhật dịch vụ "${formData.name}" thành công!`);
            queryClient.invalidateQueries({ queryKey: ['service', id] });
            navigate(ROUTES.PROVIDER_DASHBOARD);
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error('Có lỗi xảy ra khi cập nhật dịch vụ.');
        } finally {
            setIsSaving(false);
        }
    };

    const amenitiesList = [
        'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar',
        'Parking', 'Room Service', 'Laundry', 'Airport Shuttle'
    ];

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Error loading service</p>
                <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
                    <p className="text-muted-foreground mt-1">
                        Update information for {service.serviceName}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Enter the basic details of the service</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="basePrice">Base Price (VND) *</Label>
                            <Input
                                id="basePrice"
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => handleInputChange('description', value)}
                                placeholder="Mô tả chi tiết về dịch vụ..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Hotel-Specific Fields */}
                {serviceType === 'hotel' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hotel Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="starRating">Star Rating</Label>
                                    <Select
                                        value={formData.starRating}
                                        onValueChange={(value) => handleInputChange('starRating', value)}
                                    >
                                        <SelectTrigger id="starRating">
                                            <SelectValue placeholder="Select rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <SelectItem key={star} value={star.toString()}>
                                                    {star} Star{star > 1 ? 's' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="checkIn">Check-in Time</Label>
                                    <Input
                                        id="checkIn"
                                        type="time"
                                        value={formData.checkInTime}
                                        onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="checkOut">Check-out Time</Label>
                                    <Input
                                        id="checkOut"
                                        type="time"
                                        value={formData.checkOutTime}
                                        onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Amenities</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {amenitiesList.map(amenity => (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-3 py-2 text-sm rounded-md border transition-all ${formData.amenities.includes(amenity)
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-background border-border hover:border-primary'
                                                }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tour-Specific Fields */}
                {serviceType === 'tour' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tour Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange('duration', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Difficulty Level</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(value) => handleInputChange('difficulty', value)}
                                    >
                                        <SelectTrigger id="difficulty">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="challenging">Challenging</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="groupSize">Max Group Size</Label>
                                    <Input
                                        id="groupSize"
                                        type="number"
                                        value={formData.groupSize}
                                        onChange={(e) => handleInputChange('groupSize', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative aspect-video rounded-lg border overflow-hidden group">
                                    <img src={image} alt={`Service ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <label
                                className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
                            >
                                <Upload className="w-6 h-6" />
                                <span className="text-sm">Add Image</span>
                                <input type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : 'Update Service'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
