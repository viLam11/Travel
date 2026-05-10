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
import apiClient from '@/services/apiClient';
import { getDestinationInfo } from '@/constants/regions';

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

    const destinationParam = searchParams.get('destination') || '';
    const queryProvinceCode = searchParams.get('provinceCode') || '';

    // Resolve slug/code to numeric ID for backend filter
    const resolvedProvinceID = queryProvinceCode || getDestinationInfo(destinationParam || '')?.id || (destinationParam && !isNaN(Number(destinationParam)) ? destinationParam : '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiHotels, setApiHotels] = useState<HotelListItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

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

    const mapServiceToHotel = (service: any): HotelListItem => {
        // Collect all potential price points
        const potentialPrices: number[] = [
            service.minPrice,
            service.averagePrice,
            service.price,
            service.lowestPrice
        ].filter((p): p is number => typeof p === 'number' && p > 0);

        // Add prices from nested room types if available
        if (service.roomTypes && Array.isArray(service.roomTypes)) {
            service.roomTypes.forEach((r: any) => {
                const p = r.price || r.pricePerNight || 0;
                if (p > 0) potentialPrices.push(p);
            });
        }

        // Pick the absolute minimum
        const rawPrice = potentialPrices.length > 0 ? Math.min(...potentialPrices) : 0;

        const stars = service.rating ? Math.floor(service.rating) : 0; // Fallback star estimation if not provided

        return {
            id: service.id.toString(),
            name: service.serviceName,
            location: service.province?.full_name || service.province?.fullName || service.address || 'Việt Nam',
            rating: service.rating || 0,
            reviews: service.reviewCount || 0,
            price: rawPrice,
            stars: stars, // Do not default to 4 if unknown, keep 0 to show "Chưa có đánh giá"
            image: service.thumbnailUrl || 'https://via.placeholder.com/600x400',
            amenities: ['wifi', 'parking'], // Basic amenities if not from backend
            discount: service.discounts?.[0]
        };
    };

    const fetchHotels = async (signal?: AbortSignal) => {
        setIsLoading(true);
        try {
            const response: any = await apiClient.services.search({
                provinceCode: resolvedProvinceID || undefined,
                serviceType: 'HOTEL',
                minPrice: priceRange[0],
                maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
                minRating: selectedStars.length > 0 ? Math.min(...selectedStars) : undefined,
                page: currentPage - 1,
                size: 5,
                sortBy: sortBy === 'price-low' ? 'averagePrice' : sortBy === 'price-high' ? 'averagePrice' : 'rating',
                direction: sortBy === 'price-low' ? 'asc' : 'desc',
                signal
            });

            if (response && response.services && response.services.length > 0) {
                const mapped = response.services.map(mapServiceToHotel);
                setApiHotels(mapped);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalItems || response.totalElements || response.services.length);
            } else {
                setApiHotels([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Failed to fetch hotels:", error);
                setApiHotels([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            fetchHotels(controller.signal);
        }, 300); // Debounce

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [destinationParam, queryProvinceCode, priceRange, selectedStars, sortBy, currentPage]);

    const hotelsToShow = apiHotels.length > 0 ? apiHotels : mockHotels.filter(h => {
        if (destinationParam && !h.location.toLowerCase().includes(destinationParam.toLowerCase())) return false;
        if (h.price < priceRange[0] || h.price > priceRange[1]) return false;
        if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;
        return true;
    });

    const effectiveHotelsCount = apiHotels.length > 0 ? totalItems : hotelsToShow.length;
    const pagedHotels = apiHotels.length > 0 ? apiHotels : hotelsToShow.slice((currentPage - 1) * 5, currentPage * 5);

    const handleHotelClick = (hotel: HotelListItem) => {
        // ID slug
        const titleSlug = hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        // Destination slug (từ location VD: "Tây Hồ, Hà Nội" -> "ha-noi")
        const locationParts = hotel.location.split(',');
        const destStr = locationParts[locationParts.length - 1].trim();
        const destSlug = destStr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        navigate(`/hotels/vietnam/${destSlug}/${hotel.id}-${titleSlug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadcrumbSection
                auto
                title={destinationParam || 'Tất cả khách sạn'}
                subtitle={`Tìm thấy ${effectiveHotelsCount} khách sạn`}
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
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col sm:flex-row h-auto animate-pulse">
                                            {/* Image Skeleton */}
                                            <div className="w-full sm:w-64 h-52 sm:h-auto bg-gray-200"></div>
                                            
                                            {/* Content Skeleton */}
                                            <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                                        <div className="h-6 bg-gray-100 rounded w-12"></div>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                                    <div className="flex gap-2">
                                                        <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                                                        <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                                                    <div className="h-3 bg-gray-100 rounded w-20"></div>
                                                    <div className="flex items-end gap-3">
                                                        <div className="space-y-1">
                                                            <div className="h-3 bg-gray-100 rounded w-8 ml-auto"></div>
                                                            <div className="h-6 bg-gray-200 rounded w-24"></div>
                                                        </div>
                                                        <div className="h-10 bg-gray-200 rounded w-28"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : pagedHotels.length === 0 ? (
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
