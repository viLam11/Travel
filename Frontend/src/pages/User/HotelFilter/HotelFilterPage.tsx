// src/pages/User/HotelFilter/HotelFilterPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Hotel, Loader2 } from 'lucide-react';
import Footer from '../../../components/common/layout/Footer';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
import Pagination from '../../../components/common/Pagination';
import HotelFilterSidebar from '../../../components/page/hotelFilter/HotelFilterSidebar';
import HotelListCard, { type HotelListItem } from '../../../components/page/hotelFilter/HotelListCard';
import apiClient from '@/services/apiClient';
import { getDestinationInfo, getDestinationByName } from '@/constants/regions';
import LocationSelector from '@/components/common/LocationSelector';

const STALE_MS = 5 * 60 * 1000;
const MAX_PRICE = 10_000_000;
const PAGE_SIZE = 5;

const mapServiceToHotel = (service: any): HotelListItem => {
    const potentialPrices: number[] = [
        service.minPrice, service.averagePrice, service.price, service.lowestPrice,
    ].filter((p): p is number => typeof p === 'number' && p > 0);

    if (service.roomTypes?.length) {
        service.roomTypes.forEach((r: any) => {
            const p = r.price || r.pricePerNight || 0;
            if (p > 0) potentialPrices.push(p);
        });
    }

    return {
        id: service.id.toString(),
        name: service.serviceName,
        location: service.province?.full_name || service.province?.fullName || service.address || 'Việt Nam',
        provinceCode: service.province?.code || service.provinceCode || '',
        rating: service.rating || 0,
        reviews: service.reviewCount || 0,
        price: potentialPrices.length > 0 ? Math.min(...potentialPrices) : 0,
        stars: service.starRating || (service.rating ? Math.floor(service.rating) : 0),
        image: service.thumbnailUrl || 'https://via.placeholder.com/600x400',
        amenities: service.amenities || ['wifi', 'parking'],
        discount: service.discounts?.[0],
    };
};

const HotelFilterPage: React.FC = () => {
    const navigate = useNavigate();
    const { region, destination } = useParams<{ region?: string; destination?: string }>();
    const [searchParams] = useSearchParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('popular');

    // ─── URL / province derivation (must come before effects that use them) ─────
    const destinationParam = destination || searchParams.get('destination') || '';
    const queryProvinceCode = searchParams.get('provinceCode') || '';
    const searchKeyword = searchParams.get('keyword') || '';

    const urlProvinceID =
        queryProvinceCode
        || getDestinationInfo(destinationParam || '')?.id
        || getDestinationByName(destinationParam || '')?.id
        || (destinationParam && !isNaN(Number(destinationParam)) ? destinationParam : '');

    // Province chosen in the sidebar — overrides URL when set
    const [sidebarProvinceCode, setSidebarProvinceCode] = useState('');
    const resolvedProvinceID = sidebarProvinceCode || urlProvinceID;

    // Debounced price — query key only changes 400ms after slider stops
    const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>([0, MAX_PRICE]);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedPrice(priceRange), 400);
        return () => clearTimeout(t);
    }, [priceRange]);

    // When URL destination changes, clear sidebar selection so URL province takes over
    useEffect(() => { setSidebarProvinceCode(''); }, [urlProvinceID]);

    // Reset to page 1 on any filter change (including location)
    useEffect(() => { setCurrentPage(1); }, [resolvedProvinceID, debouncedPrice, selectedStars, sortBy]);

    // Scroll to top on every page change (including cache hits)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const sortToApi = () => {
        if (sortBy === 'price-low')  return { sortBy: 'averagePrice', direction: 'asc' };
        if (sortBy === 'price-high') return { sortBy: 'averagePrice', direction: 'desc' };
        if (sortBy === 'rating-high') return { sortBy: 'rating', direction: 'desc' };
        return { sortBy: 'id', direction: 'asc' };
    };

    // ─── TanStack Query ──────────────────────────────────────────────────────────
    const { data, isLoading, isFetching } = useQuery({
        queryKey: [
            'hotels', 'filter',
            searchKeyword, resolvedProvinceID, debouncedPrice,
            selectedStars, sortBy, currentPage,
        ],
        queryFn: async ({ signal }) => {
            const { sortBy: apiSortBy, direction } = sortToApi();
            const base = {
                provinceCode: resolvedProvinceID || undefined,
                serviceType: 'HOTEL' as const,   // always HOTEL on this page
                minPrice: debouncedPrice[0] > 0          ? debouncedPrice[0] : undefined,
                maxPrice: debouncedPrice[1] < MAX_PRICE  ? debouncedPrice[1] : undefined,
                minRating: selectedStars.length > 0 ? Math.min(...selectedStars) : undefined,
                page: currentPage - 1,
                size: PAGE_SIZE,
                sortBy: apiSortBy,
                direction,
                signal,
            };

            // Keyword search also scoped to HOTEL only
            if (searchKeyword) {
                return apiClient.services.search({ ...base, keyword: searchKeyword });
            }
            return apiClient.services.filterByLocation(base);
        },
        placeholderData: keepPreviousData,
        staleTime: STALE_MS,
        select: (res) => ({
            hotels: (res?.services ?? []).map(mapServiceToHotel),
            totalItems: res?.totalElements ?? res?.services?.length ?? 0,
            totalPages: res?.totalPages ?? 1,
        }),
    });

    const hotels     = data?.hotels     ?? [];
    const totalItems = data?.totalItems ?? 0;
    const totalPages = data?.totalPages ?? 1;

    // ─── Navigation ─────────────────────────────────────────────────────────────
    const handleHotelClick = (hotel: HotelListItem) => {
        const titleSlug = hotel.name
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/đ/g, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        const locationParts = hotel.location.split(',');
        const destStr = locationParts[locationParts.length - 1].trim();
        const destInfo = getDestinationByName(destStr);

        let destSlug = destInfo?.slug || destStr
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/đ/g, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        const targetRegion = (region && region !== 'undefined') ? region : 'vietnam';
        navigate(`/hotels/${targetRegion}/${destSlug}/${hotel.id}-${titleSlug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadcrumbSection
                auto
                title={destinationParam || 'Tất cả khách sạn'}
                subtitle={isLoading ? 'Đang tải...' : `Tìm thấy ${totalItems} khách sạn`}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8 items-start">
                    <HotelFilterSidebar
                        isMobileOpen={isMobileSidebarOpen}
                        onClose={() => setIsMobileSidebarOpen(false)}
                        selectedLocation={resolvedProvinceID}
                        onLocationChange={(code) => setSidebarProvinceCode(code)}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        minPrice={0}
                        maxPrice={MAX_PRICE}
                        selectedStars={selectedStars}
                        onStarsChange={setSelectedStars}
                        selectedAmenities={selectedAmenities}
                        onAmenitiesChange={setSelectedAmenities}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />

                    <main className="flex-1 min-w-0">
                        {/* Active filter pills */}
                        {(selectedStars.length > 0 || selectedAmenities.length > 0 || sortBy !== 'popular' || priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {sortBy !== 'popular' && (
                                    <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        Sắp xếp: {sortBy === 'price-low' ? 'Giá thấp→cao' : sortBy === 'price-high' ? 'Giá cao→thấp' : 'Đánh giá cao'}
                                        <button onClick={() => setSortBy('popular')} className="hover:text-orange-900 cursor-pointer">✕</button>
                                    </span>
                                )}
                                {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
                                    <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        Giá: {(priceRange[0] / 1_000_000).toFixed(1)}tr - {(priceRange[1] / 1_000_000).toFixed(1)}tr
                                        <button onClick={() => setPriceRange([0, MAX_PRICE])} className="hover:text-orange-900 cursor-pointer">✕</button>
                                    </span>
                                )}
                                {selectedStars.map(s => (
                                    <span key={s} className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        {s}★
                                        <button onClick={() => setSelectedStars(prev => prev.filter(x => x !== s))} className="hover:text-orange-900 cursor-pointer">✕</button>
                                    </span>
                                ))}
                                {selectedAmenities.map(am => (
                                    <span key={am} className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        Tiện ích: {am === 'wifi' ? 'Wifi' : am === 'parking' ? 'Bãi đỗ xe' : am === 'pool' ? 'Bể bơi' : am === 'restaurant' ? 'Nhà hàng' : am === 'gym' ? 'Phòng gym' : am}
                                        <button onClick={() => setSelectedAmenities(prev => prev.filter(x => x !== am))} className="hover:text-orange-900 cursor-pointer">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Result count with refetch indicator */}
                        {!isLoading && (
                            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                                {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />}
                                {totalItems} khách sạn
                            </p>
                        )}

                        <div className={`space-y-4 transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                        <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col sm:flex-row animate-pulse">
                                            <div className="w-full sm:w-64 h-52 sm:h-auto bg-gray-200" />
                                            <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                                                        <div className="h-6 bg-gray-100 rounded w-12" />
                                                    </div>
                                                    <div className="h-3 bg-gray-100 rounded w-16" />
                                                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                                                    <div className="flex gap-2">
                                                        <div className="h-6 bg-gray-100 rounded-full w-16" />
                                                        <div className="h-6 bg-gray-100 rounded-full w-16" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                                                    <div className="h-3 bg-gray-100 rounded w-20" />
                                                    <div className="flex items-end gap-3">
                                                        <div className="space-y-1">
                                                            <div className="h-3 bg-gray-100 rounded w-8 ml-auto" />
                                                            <div className="h-6 bg-gray-200 rounded w-24" />
                                                        </div>
                                                        <div className="h-10 bg-gray-200 rounded w-28" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : hotels.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 px-4">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-orange-50 rounded-full">
                                            <Hotel className="w-12 h-12 text-orange-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy khách sạn phù hợp</h3>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        Không có khách sạn nào tại địa điểm này với bộ lọc hiện tại.
                                    </p>
                                    <div className="max-w-sm mx-auto space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <p className="text-sm font-medium text-gray-700 mb-3 block text-left">Thử tìm ở địa điểm khác:</p>
                                            <LocationSelector
                                                onSelect={(code, name) => {
                                                    const slug = name.toLowerCase()
                                                        .normalize('NFD').replace(/[̀-ͯ]/g, '')
                                                        .replace(/đ/g, 'd')
                                                        .replace(/\s+/g, '-')
                                                        .replace(/[^a-z0-9-]/g, '');
                                                    setSidebarProvinceCode(code);
                                                    navigate(`/hotels/vietnam/${slug}`);
                                                }}
                                                placeholder="Chọn tỉnh/thành phố..."
                                            />
                                        </div>
                                        <button
                                            onClick={() => { setPriceRange([0, MAX_PRICE]); setSelectedStars([]); setSelectedAmenities([]); setSortBy('popular'); }}
                                            className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline cursor-pointer"
                                        >
                                            Xóa tất cả bộ lọc
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                hotels.map(hotel => (
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
                                    totalResults={totalItems}
                                    resultsPerPage={PAGE_SIZE}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>

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
