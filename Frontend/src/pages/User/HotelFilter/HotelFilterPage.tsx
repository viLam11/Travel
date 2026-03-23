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

    const destination = searchParams.get('destination') || '';

    // Resolve slug/code to numeric ID for backend filter
    const resolvedProvinceID = getDestinationInfo(destination || '')?.id || destination;
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
        const rawPrice = service.averagePrice ?? 0;
        const stars = service.rating ? Math.floor(service.rating) : 0; // Fallback star estimation if not provided

        return {
            id: service.id.toString(),
            name: service.serviceName,
            location: service.province?.fullName || service.address || 'Việt Nam',
            rating: service.rating || 0,
            reviews: service.reviewCount || 0,
            price: rawPrice,
            stars: stars > 0 ? stars : 4, // Default to 4 if unknown
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
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
    }, [destination, priceRange, selectedStars, sortBy, currentPage]);

    // Final hotels list: use API if results found, otherwise mock (as requested)
    const hotelsToShow = apiHotels.length > 0 ? apiHotels : mockHotels.filter(h => {
        if (destination && !h.location.toLowerCase().includes(destination.toLowerCase())) return false;
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

        navigate(`/destinations/vietnam/${destSlug}/hotel/${hotel.id}-${titleSlug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadcrumbSection
                auto
                title={destination || 'Tất cả khách sạn'}
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
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
