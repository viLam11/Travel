// src/pages/DestinationsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Footer from '../../../components/common/layout/Footer';
import FilterSidebar from '../../../components/page/destinationFilter/FilterSidebar';
import DestinationCard from '../../../components/page/destinationFilter/DestinationFIlterCard';
import apiClient from '@/services/apiClient';
import Pagination from '../../../components/common/Pagination';
import LocationSelector from '@/components/common/LocationSelector';
import { getDestinationInfo, getDestinationByName, type SortValue } from '@/constants/regions';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';

interface DestinationsPageProps {
  onNavigateToHome?: () => void;
}

const STALE_MS = 5 * 60 * 1000;
const MAX_PRICE = 10_000_000;
const PAGE_SIZE = 5;

const sortToApi = (sortBy: SortValue) => {
  if (sortBy === 'price-low')  return { sortBy: 'averagePrice', direction: 'asc' };
  if (sortBy === 'price-high') return { sortBy: 'averagePrice', direction: 'desc' };
  if (sortBy === 'rating-high') return { sortBy: 'rating',       direction: 'desc' };
  return { sortBy: 'id', direction: 'asc' };
};

const DestinationsPage: React.FC<DestinationsPageProps> = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { region, destination, serviceType } = useParams<{
    region?: string;
    destination?: string;
    serviceType?: string;
  }>();
  const [searchParams] = useSearchParams();

  // Filter UI state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [sortBy, setSortBy] = useState<SortValue>('popular');
  const [minRating, setMinRating] = useState(0);

  // Debounced price — query key only changes 400ms after slider stops
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>([0, MAX_PRICE]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(priceRange), 400);
    return () => clearTimeout(t);
  }, [priceRange]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setCurrentPage(1); }, [debouncedPrice, sortBy, minRating]);

  // Resolve URL params
  const searchKeyword    = searchParams.get('keyword') || '';
  const urlDestination   = destination || searchParams.get('destination') || '';
  const queryProvinceCode = searchParams.get('provinceCode') || '';
  const provinceSlug     = urlDestination === 'undefined' ? '' : urlDestination;
  const paramServiceType = searchParams.get('serviceType') || serviceType || '';

  const resolvedProvinceID =
    queryProvinceCode
    || getDestinationInfo(provinceSlug || '')?.id
    || getDestinationByName(provinceSlug || '')?.id
    || (provinceSlug && !isNaN(Number(provinceSlug)) ? provinceSlug : '');

  let apiServiceType = paramServiceType;
  if (paramServiceType === 'ticket' || paramServiceType === 'place') apiServiceType = 'TICKET_VENUE';
  else if (paramServiceType === 'hotel')      apiServiceType = 'HOTEL';
  else if (paramServiceType === 'restaurant') apiServiceType = 'RESTAURANT';
  // Default to TICKET_VENUE when no explicit type — this is the destinations page
  const effectiveServiceType = apiServiceType || 'TICKET_VENUE';

  // ─── TanStack Query ──────────────────────────────────────────────────────────
  const queryKey = [
    'destinations', 'filter',
    searchKeyword, resolvedProvinceID, effectiveServiceType,
    debouncedPrice, sortBy, minRating, currentPage,
  ] as const;

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const { sortBy: apiSortBy, direction } = sortToApi(sortBy);
      const base = {
        provinceCode: resolvedProvinceID || undefined,
        serviceType:  effectiveServiceType,
        minPrice:     debouncedPrice[0] > 0           ? debouncedPrice[0] : undefined,
        maxPrice:     debouncedPrice[1] < MAX_PRICE   ? debouncedPrice[1] : undefined,
        minRating:    minRating > 0                    ? minRating          : undefined,
        page:         currentPage - 1,
        size:         PAGE_SIZE,
        sortBy:       apiSortBy,
        direction,
        signal,
      };

      if (searchKeyword) {
        return apiClient.services.search({ ...base, keyword: searchKeyword });
      }
      return apiClient.services.filterByLocation(base);
    },
    placeholderData: keepPreviousData, // old results stay visible while fetching new page/filter
    staleTime: STALE_MS,
  });

  const destinations   = data?.services      ?? [];
  const totalItems     = data?.totalElements  ?? destinations.length;
  const totalPages     = data?.totalPages     ?? 1;

  // Scroll to top on every page change — runs even on cache hits
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // ─── Navigation helpers ──────────────────────────────────────────────────────
  const click_card = (id: string | number, item: any) => {
    let typeSlug = 'place';
    const itemType = (item.serviceType || '').toUpperCase();
    if (itemType === 'HOTEL') typeSlug = 'hotel';
    else if (itemType === 'RESTAURANT') typeSlug = 'restaurant';
    else if (itemType === 'TICKET_VENUE' || itemType === 'TOUR') typeSlug = 'ticket';

    const titleSlug = (item.serviceName || item.title || 'service')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const idSlug = `${id}-${titleSlug}`;

    const targetRegion = (region && region !== 'undefined') ? region : 'vietnam';
    let tempProvinceCode = item.province?.code || item.provinceCode || destination || 'ha-noi';
    if (tempProvinceCode === 'undefined') tempProvinceCode = 'ha-noi';

    const destInfo = getDestinationInfo(tempProvinceCode.toString());
    const finalProvinceCode = destInfo?.slug || tempProvinceCode;

    const finalUrl = typeSlug === 'hotel'
      ? `/hotels/${targetRegion}/${finalProvinceCode}/${idSlug}`
      : `/destinations/${targetRegion}/${finalProvinceCode}/${typeSlug}/${idSlug}`;
    navigate(finalUrl);
  };

  const handleBooking = (id: string) => {
    const item = destinations.find((d: any) => d.id?.toString() === id);
    if (item) click_card(id, item);
  };

  // ─── Page title ──────────────────────────────────────────────────────────────
  const getPageTitle = () => {
    if (searchKeyword) return `Kết quả tìm kiếm cho "${searchKeyword}"`;
    if (provinceSlug) {
      const destInfo = getDestinationInfo(provinceSlug);
      if (destInfo) return destInfo.name;
      if (destinations.length > 0 && destinations[0].province) {
        const p = destinations[0].province;
        return p.full_name || p.fullName || p.name || provinceSlug;
      }
      return decodeURIComponent(provinceSlug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Tất cả điểm đến';
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <BreadcrumbSection
        auto
        title={getPageTitle()}
        subtitle={isLoading ? 'Đang tải...' : `Tìm thấy ${totalItems} kết quả`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            isMobileOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            selectedLocation={resolvedProvinceID}
            onLocationChange={(code) => {
              navigate(`/destinations?destination=${code}&serviceType=${paramServiceType}`);
            }}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            minPrice={0}
            maxPrice={MAX_PRICE}
            sortBy={sortBy}
            onSortChange={setSortBy}
            minRating={minRating}
            onRatingChange={setMinRating}
          />

          {/* Cards */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Bộ lọc & Sắp xếp
              </button>
            </div>

            {/* Active Filter Tags */}
            <div className="mb-6 flex flex-wrap gap-2">
              {sortBy !== 'popular' && (
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <span>Sắp xếp: {sortBy === 'rating-high' ? 'Đánh giá cao' : sortBy === 'price-low' ? 'Giá thấp' : 'Giá cao'}</span>
                  <button onClick={() => setSortBy('popular')} className="hover:text-orange-900 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <span>Giá: {(priceRange[0] / 1_000_000).toFixed(1)}tr - {(priceRange[1] / 1_000_000).toFixed(1)}tr</span>
                  <button onClick={() => setPriceRange([0, MAX_PRICE])} className="hover:text-orange-900 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {minRating > 0 && (
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <span>{minRating}★ trở lên</span>
                  <button onClick={() => setMinRating(0)} className="hover:text-orange-900 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Results — skeleton only on first load, old data dims while refetching */}
            {isLoading ? (
              <div className="space-y-5">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col sm:flex-row h-auto animate-pulse">
                    <div className="w-full sm:w-64 h-48 sm:h-52 bg-gray-200" />
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="h-6 bg-gray-200 rounded w-3/4" />
                          <div className="h-6 bg-gray-100 rounded w-12" />
                        </div>
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-16" />
                          <div className="h-6 bg-gray-200 rounded w-24" />
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 px-4">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-orange-50 rounded-full">
                    <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Không có dịch vụ nào tại địa điểm này với bộ lọc hiện tại.
                </p>
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-3 block text-left">Thử tìm ở địa điểm khác:</p>
                    <LocationSelector
                      onSelect={(_code, name) => navigate(`/destinations/vietnam/${name}/all`)}
                      placeholder="Chọn tỉnh/thành phố..."
                    />
                  </div>
                  <button
                    onClick={() => { setPriceRange([0, MAX_PRICE]); setMinRating(0); setSortBy('popular'); }}
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <div className={`space-y-5 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                {destinations.map((item: any) => {
                  const discounts     = item.discounts || [];
                  const activeDiscount = discounts[0] ?? null;

                  const potentialPrices: number[] = [
                    item.minPrice, item.averagePrice, item.price, item.lowestPrice,
                  ].filter((p): p is number => typeof p === 'number' && p > 0);

                  const children = item.roomTypes || item.ticketTypes || item.rooms || item.tickets || [];
                  if (Array.isArray(children)) {
                    children.forEach((c: any) => {
                      const p = c.price || c.pricePerNight || 0;
                      if (p > 0) potentialPrices.push(p);
                    });
                  }

                  const rawPrice = potentialPrices.length > 0 ? Math.min(...potentialPrices) : 0;
                  let discountedPrice = rawPrice;
                  let discountLabel: string | undefined;

                  if (activeDiscount) {
                    if (activeDiscount.discountType === 'Percentage') {
                      discountedPrice = rawPrice * (1 - (activeDiscount.percentage || 0) / 100);
                      discountLabel = `Giảm ${activeDiscount.percentage}%`;
                    } else if (activeDiscount.discountType === 'Fixed') {
                      discountedPrice = Math.max(0, rawPrice - (activeDiscount.fixedPrice || 0));
                      discountLabel = `Giảm ${(activeDiscount.fixedPrice || 0).toLocaleString()} ₫`;
                    }
                  }

                  return (
                    <DestinationCard
                      key={item.id}
                      destination={{
                        id:            item.id?.toString() || '',
                        title:         item.serviceName,
                        location:      item.province?.full_name || item.province?.fullName || item.address || 'Việt Nam',
                        rating:        item.rating?.toString() || '0',
                        reviews:       item.reviewCount?.toString() || '0',
                        description:   item.description,
                        price:         discountedPrice > 0
                          ? discountedPrice.toLocaleString('vi-VN') + ' ₫'
                          : rawPrice.toLocaleString('vi-VN') + ' ₫',
                        originalPrice: activeDiscount && rawPrice > 0
                          ? rawPrice.toLocaleString('vi-VN') + ' ₫'
                          : undefined,
                        nights:        'Trong ngày',
                        image:         item.thumbnailUrl || 'https://via.placeholder.com/400x300',
                        discount:      discountLabel,
                      }}
                      onBook={(id) => handleBooking(id)}
                      onClick={() => click_card(item.id, item)}
                    />
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalResults={totalItems}
                resultsPerPage={PAGE_SIZE}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationsPage;
