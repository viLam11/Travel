// src/pages/User/HotelFilter/HotelFilterPage.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Hotel, Star, MapPin, Wifi, Waves, Dumbbell, Sparkles, Car, UtensilsCrossed, Palmtree } from 'lucide-react';
import Footer from '../../../components/common/layout/Footer';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
import Pagination from '../../../components/common/Pagination';
import HotelFilterSidebar from '../../../components/page/hotelFilter/HotelFilterSidebar';

const HotelFilterPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]); // Max 10M/night
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('popular');

    // Get query params
    const destination = searchParams.get('destination') || '';

    // Mock hotel data (will be replaced with API)
    const mockHotels = [
        {
            id: '101',
            name: 'Khách sạn Melia Vinpearl',
            location: 'Nha Trang, Khánh Hòa',
            rating: 4.9,
            reviews: 856,
            price: 1500000,
            stars: 5,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
            amenities: ['wifi', 'pool', 'gym', 'spa', 'parking']
        },
        {
            id: '102',
            name: 'InterContinental Hanoi Westlake',
            location: 'Hà Nội',
            rating: 4.8,
            reviews: 1234,
            price: 2500000,
            stars: 5,
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
            amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking']
        },
        {
            id: '103',
            name: 'Pullman Đà Nẵng Beach Resort',
            location: 'Đà Nẵng',
            rating: 4.7,
            reviews: 967,
            price: 1800000,
            stars: 5,
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
            amenities: ['wifi', 'pool', 'gym', 'spa', 'beach']
        },
    ];

    const [hotels] = useState(mockHotels);
    const totalPages = Math.ceil(hotels.length / 5);

    const amenitiesMap: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
        wifi: { label: 'WiFi', icon: Wifi },
        pool: { label: 'Hồ bơi', icon: Waves },
        gym: { label: 'Gym', icon: Dumbbell },
        spa: { label: 'Spa', icon: Sparkles },
        parking: { label: 'Đỗ xe', icon: Car },
        restaurant: { label: 'Nhà hàng', icon: UtensilsCrossed },
        beach: { label: 'Bãi biển', icon: Palmtree },
    };

    const handleHotelClick = (hotel: any) => {
        const titleSlug = hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const idSlug = `${hotel.id}-${titleSlug}`;
        navigate(`/destinations/vietnam/general/hotel/${idSlug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadcrumbSection
                auto
                title={destination || 'Tất cả khách sạn'}
                subtitle={`Tìm thấy ${hotels.length} khách sạn`}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="flex gap-8">
                    {/* LEFT: Filter Sidebar */}
                    <HotelFilterSidebar
                        isMobileOpen={isMobileSidebarOpen}
                        onClose={() => setIsMobileSidebarOpen(false)}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        minPrice={0}
                        maxPrice={10000000}
                        selectedStars={selectedStars}
                        onStarsChange={setSelectedStars}
                        selectedAmenities={selectedAmenities}
                        onAmenitiesChange={setSelectedAmenities}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />

                    {/* RIGHT: Hotel Grid */}
                    <main className="flex-1">
                        <div className="space-y-4">
                            {hotels.map(hotel => (
                                <div
                                    key={hotel.id}
                                    onClick={() => handleHotelClick(hotel)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-64 h-48 sm:h-auto">
                                            <img
                                                src={hotel.image}
                                                alt={hotel.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 p-4 sm:p-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h3>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {Array.from({ length: hotel.stars }).map((_, i) => (
                                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        {hotel.location}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                                        <span className="font-bold text-gray-900">{hotel.rating}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{hotel.reviews} đánh giá</p>
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between mt-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {hotel.amenities.slice(0, 4).map(amenity => {
                                                        const amenityInfo = amenitiesMap[amenity];
                                                        if (!amenityInfo) return null;
                                                        const IconComponent = amenityInfo.icon;
                                                        return (
                                                            <div key={amenity} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded">
                                                                <IconComponent className="w-3.5 h-3.5" />
                                                                <span>{amenityInfo.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Từ</p>
                                                    <p className="text-xl font-bold text-orange-500">
                                                        {(hotel.price / 1000000).toFixed(1)}M
                                                    </p>
                                                    <p className="text-xs text-gray-500">/đêm</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-orange-600 transition-colors"
            >
                <Hotel className="w-6 h-6" />
            </button>

            <Footer />
        </div>
    );
};

export default HotelFilterPage;
