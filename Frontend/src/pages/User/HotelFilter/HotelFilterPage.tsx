// src/pages/User/HotelFilter/HotelFilterPage.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import Footer from '../../../components/common/layout/Footer';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
import Pagination from '../../../components/common/Pagination';
import HotelFilterSidebar from '../../../components/page/hotelFilter/HotelFilterSidebar';
import HotelListCard, { type HotelListItem } from '../../../components/page/hotelFilter/HotelListCard';
import { MOCK_DISCOUNTS } from '@/mocks/discounts';

const HotelFilterPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('popular');

    const destination = searchParams.get('destination') || '';

    const mockHotels: HotelListItem[] = [
        {
            id: '203',
            name: 'Khách sạn Melia Vinpearl Nha Trang',
            location: 'Nha Trang, Khánh Hòa',
            rating: 4.9,
            reviews: 856,
            price: 1500000,
            stars: 5,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
            amenities: ['wifi', 'pool', 'gym', 'spa', 'parking'],
            discount: MOCK_DISCOUNTS[0], // -20% Mùa Hè
        },
        {
            id: '204',
            name: 'InterContinental Hanoi Westlake',
            location: 'Tây Hồ, Hà Nội',
            rating: 4.8,
            reviews: 1234,
            price: 2500000,
            stars: 5,
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
            amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
            discount: MOCK_DISCOUNTS[1], // -200k Flash Sale
        },
        {
            id: '205',
            name: 'Pullman Đà Nẵng Beach Resort',
            location: 'Ngũ Hành Sơn, Đà Nẵng',
            rating: 4.7,
            reviews: 967,
            price: 1800000,
            stars: 5,
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
            amenities: ['wifi', 'pool', 'gym', 'spa', 'beach'],
            // No discount on this one
        },
        {
            id: '206',
            name: 'Novotel Phú Quốc Resort',
            location: 'Phú Quốc, Kiên Giang',
            rating: 4.6,
            reviews: 742,
            price: 1200000,
            stars: 4,
            image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
            amenities: ['wifi', 'pool', 'restaurant', 'beach', 'parking'],
            discount: MOCK_DISCOUNTS[3], // -10% Đặt sớm
        },
        {
            id: '207',
            name: 'Muong Thanh Grand Đà Lạt',
            location: 'Đà Lạt, Lâm Đồng',
            rating: 4.4,
            reviews: 521,
            price: 890000,
            stars: 4,
            image: 'https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=600&h=400&fit=crop',
            amenities: ['wifi', 'parking', 'restaurant', 'gym'],
            // No discount
        },
    ];

    const [hotels] = useState(mockHotels);

    // ── Apply filters + sort ──────────────────────────────────────────
    const filteredHotels = React.useMemo(() => {
        let result = hotels.filter(h => {
            // Price range
            if (h.price < priceRange[0] || h.price > priceRange[1]) return false;
            // Stars
            if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;
            // Amenities (hotel must have ALL selected amenities)
            if (selectedAmenities.length > 0 && !selectedAmenities.every(a => h.amenities.includes(a))) return false;
            return true;
        });

        // Sort
        if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);

        return result;
    }, [hotels, priceRange, selectedStars, selectedAmenities, sortBy]);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
    const pagedHotels = filteredHotels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleHotelClick = (hotel: HotelListItem) => {
        // ID slug
        const titleSlug = hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        // Destination slug (từ location VD: "Tây Hồ, Hà Nội" -> "ha-noi")
        const locationParts = hotel.location.split(',');
        const destStr = locationParts[locationParts.length - 1].trim();
        const destSlug = destStr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        navigate(`/destinations/vietnam/${destSlug}/hotel/${hotel.id}-${titleSlug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadcrumbSection
                auto
                title={destination || 'Tất cả khách sạn'}
                subtitle={`Tìm thấy ${filteredHotels.length} / ${hotels.length} khách sạn`}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8 items-start">
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

                    {/* RIGHT: Hotel List */}
                    <main className="flex-1 min-w-0">
                        {/* Active filter pills */}
                        {(selectedStars.length > 0 || selectedAmenities.length > 0 || sortBy !== 'popular') && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {sortBy !== 'popular' && (
                                    <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        Sắp xếp: {sortBy === 'price-low' ? 'Giá thấp→cao' : sortBy === 'price-high' ? 'Giá cao→thấp' : 'Đánh giá cao'}
                                        <button onClick={() => setSortBy('popular')} className="hover:text-orange-900">✕</button>
                                    </span>
                                )}
                                {selectedStars.map(s => (
                                    <span key={s} className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        {s}★
                                        <button onClick={() => setSelectedStars(prev => prev.filter(x => x !== s))} className="hover:text-orange-900">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            {pagedHotels.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                                    <p className="text-gray-500 text-lg font-medium mb-2">Không tìm thấy khách sạn phù hợp</p>
                                    <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc để xem thêm kết quả</p>
                                    <button
                                        onClick={() => { setPriceRange([0, 10000000]); setSelectedStars([]); setSelectedAmenities([]); setSortBy('popular'); }}
                                        className="mt-4 text-orange-500 hover:text-orange-600 text-sm font-semibold underline cursor-pointer"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                </div>
                            ) : (
                                pagedHotels.map(hotel => (
                                    <HotelListCard
                                        key={hotel.id}
                                        hotel={hotel}
                                        onClick={() => handleHotelClick(hotel)}
                                    />
                                ))
                            )}
                        </div>

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
