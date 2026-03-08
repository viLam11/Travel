// src/pages/Admin/Services/AdminAddService.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Upload, X, Hotel, Map } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { MOCK_PROVIDERS } from '@/mocks/providers';

const AdminAddService = () => {
    const navigate = useNavigate();
    const [serviceType, setServiceType] = useState<'hotel' | 'tour'>('hotel');
    // ... (lines 23-118 remain unchanged)
    const [formData, setFormData] = useState({
        name: '',
        providerId: '',
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

    const activeProviders = MOCK_PROVIDERS.filter(p =>
        p.status === 'active' && p.type === serviceType
    );

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddImage = () => {
        // Mock image upload
        const mockImage = `https://images.unsplash.com/photo-${Date.now()}`;
        setImages(prev => [...prev, mockImage]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newService = {
            ...formData,
            type: serviceType,
            images,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        console.log('Creating new service:', newService);
        alert(`Service "${formData.name}" created successfully!\nStatus: Pending approval`);
        navigate(ROUTES.ADMIN_SERVICES);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(ROUTES.ADMIN_SERVICES)}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Service</h1>
                    <p className="text-muted-foreground mt-1">
                        Create a new hotel or tour service
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Type</CardTitle>
                        <CardDescription>Select the type of service you want to create</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setServiceType('hotel')}
                                className={`p-6 border-2 rounded-lg transition-all ${serviceType === 'hotel'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="flex justify-center mb-3">
                                        <div className={`p-3 rounded-full ${serviceType === 'hotel' ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
                                            <Hotel className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="font-semibold">Hotel</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Accommodation service
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceType('tour')}
                                className={`p-6 border-2 rounded-lg transition-all ${serviceType === 'tour'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="flex justify-center mb-3">
                                        <div className={`p-3 rounded-full ${serviceType === 'tour' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                            <Map className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="font-semibold">Tour</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Travel experience
                                    </div>
                                </div>
                            </button>
                        </div>
                    </CardContent >
                </Card >

                {/* Basic Information */}
                < Card >
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
                                    placeholder="e.g., Grand Hotel Saigon"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider">Provider *</Label>
                                <Select
                                    value={formData.providerId}
                                    onValueChange={(value) => handleInputChange('providerId', value)}
                                    required
                                >
                                    <SelectTrigger id="provider">
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeProviders.map(provider => (
                                            <SelectItem key={provider.id} value={provider.id.toString()}>
                                                {provider.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Ho Chi Minh City"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="basePrice">Base Price (VND) *</Label>
                                <Input
                                    id="basePrice"
                                    type="number"
                                    placeholder="e.g., 1500000"
                                    value={formData.basePrice}
                                    onChange={(e) => handleInputChange('basePrice', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the service..."
                                rows={4}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card >

                {/* Hotel-Specific Fields */}
                {
                    serviceType === 'hotel' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Hotel Details</CardTitle>
                                <CardDescription>Hotel-specific information</CardDescription>
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
                    )
                }

                {/* Tour-Specific Fields */}
                {
                    serviceType === 'tour' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tour Details</CardTitle>
                                <CardDescription>Tour-specific information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration</Label>
                                        <Input
                                            id="duration"
                                            placeholder="e.g., 2 days 1 night"
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
                                            placeholder="e.g., 15"
                                            value={formData.groupSize}
                                            onChange={(e) => handleInputChange('groupSize', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="includedItems">Included Items</Label>
                                    <Textarea
                                        id="includedItems"
                                        placeholder="Enter included items (one per line)"
                                        rows={4}
                                        onChange={(e) => {
                                            const items = e.target.value.split('\n').filter(item => item.trim());
                                            handleInputChange('includedItems', items);
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )
                }

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                        <CardDescription>Upload service images (mock)</CardDescription>
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
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                            >
                                <Upload className="w-6 h-6" />
                                <span className="text-sm">Add Image</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_SERVICES)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        Create Service
                    </Button>
                </div>
            </form >
        </div >
    );
};

export default AdminAddService;
