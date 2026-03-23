// src/pages/DestinationsPage.tsx
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../../../components/common/layout/Footer';
import FilterSidebar from '../../../components/page/destinationFilter/FilterSidebar';
import DestinationCard from '../../../components/page/destinationFilter/DestinationFIlterCard';
import apiClient from '@/services/apiClient';
import Pagination from '../../../components/common/Pagination';
import LocationSelector from '@/components/common/LocationSelector';
import { getDestinationInfo, type SortValue } from '@/constants/regions';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
interface DestinationsPageProps {
  onNavigateToHome?: () => void;
}

const DestinationsPage: React.FC<DestinationsPageProps> = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const { region, destination, serviceType } = useParams<{
    region?: string;
    destination?: string;
    serviceType?: string;
  }>();
  const [searchParams] = useSearchParams();

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]); // Max 100tr
  const [sortBy, setSortBy] = useState<SortValue>('popular');
  const [minRating, setMinRating] = useState(0);

  // Get query params
  const searchKeyword = searchParams.get('keyword') || ''; // Text search from search bar
  const urlDestination = destination || searchParams.get('destination') || ''; 
  const provinceCode = urlDestination === 'undefined' ? '' : urlDestination;
  const paramServiceType = searchParams.get('serviceType') || serviceType || '';

  // Resolve slug/code to numeric ID for backend filter
  const resolvedProvinceID = getDestinationInfo(provinceCode || '')?.id || provinceCode;

  // Fetch API
  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      // Convert SortValue to API params
      let apiSortBy = 'id';
      let apiDirection = 'asc';
      if (sortBy === 'price-low') { apiSortBy = 'averagePrice'; apiDirection = 'asc'; }
      if (sortBy === 'price-high') { apiSortBy = 'averagePrice'; apiDirection = 'desc'; }
      if (sortBy === 'rating-high') { apiSortBy = 'rating'; apiDirection = 'desc'; }

      const abortController = new AbortController();

      // Call API
      const response: any = await apiClient.services.search({
        provinceCode: resolvedProvinceID || undefined,
        keyword: searchKeyword || undefined,
        serviceType: paramServiceType || 'TICKET_VENUE',
        minPrice: priceRange[0],
        maxPrice: priceRange[1] < 100000000 ? priceRange[1] : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        page: currentPage - 1,
        size: 5,
        sortBy: apiSortBy,
        direction: apiDirection,
        signal: abortController.signal // Pass signal
      });

      // Handle response
      if (response && response.services) {
        setDestinations(response.services);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
      } else {
        setDestinations([]);
      }

    } catch (error) {
      console.error("Failed to fetch services", error);
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch data
  React.useEffect(() => {
    const fetchWithCleanup = async () => {
      await fetchDestinations();
    };
    
    fetchWithCleanup();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Cleanup is handled inside fetchDestinations if we use a ref or similar,
    // but for simplicity in this structure, we'll just ensure the API handles the signal.
  }, [searchKeyword, provinceCode, paramServiceType, priceRange, sortBy, minRating, currentPage]); 


  // Determine page title and breadcrumb
  const getPageTitle = () => {
    if (searchKeyword) return `Kết quả tìm kiếm cho "${searchKeyword}"`;
    if (provinceCode) {
      // 1. Try local hardcoded list (slug or code)
      const destInfo = getDestinationInfo(provinceCode);
      if (destInfo) return destInfo.name;

      // 2. Try to get from first service result from API
      if (destinations.length > 0 && destinations[0].province) {
        const p = destinations[0].province;
        return p.fullName || p.name || provinceCode;
      }

      // 3. Last fallback: decode and capitalize provinceCode
      return decodeURIComponent(provinceCode).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Tất cả điểm đến';
  };

  const click_card = (id: string | number, item: any) => {
    console.log('Navigate to:', id);
    console.log('Item data:', item);

    // Determine service type based on item data from API
    // Enum Backend: HOTEL, RESTAURANT, TICKET_VENUE, TOUR
    let typeSlug = 'place';
    const itemType = (item.serviceType || '').toUpperCase();
    if (itemType === 'HOTEL') typeSlug = 'hotel';
    else if (itemType === 'RESTAURANT') typeSlug = 'restaurant';
    else if (itemType === 'TICKET_VENUE' || itemType === 'TOUR') typeSlug = 'ticket';

    // Create readable slug: id-title-safe
    const titleSlug = (item.serviceName || item.title || 'service')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const idSlug = `${id}-${titleSlug}`;

    // Region fallback
    const targetRegion = region || 'vietnam';
    
    // Province fallback logic
    const provinceCode = item.province?.code || item.provinceCode || destination || 'ha-noi';

    const finalUrl = `/destinations/${targetRegion}/${provinceCode}/${typeSlug}/${idSlug}`;
    console.log('Final Navigation URL:', finalUrl);

    navigate(finalUrl);
  };

  // handleBooking moved up

  const handleBooking = (id: string, event?: React.MouseEvent) => {
    // Prevent event bubbling to parent onClick
    if (event) {
      event.stopPropagation();
    }

    // Find the destination item to get its details
    const item = destinations.find(dest => dest.id === id);
    if (item) {
      click_card(id, item);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Breadcrumb */}
      <BreadcrumbSection
        auto
        title={getPageTitle()}
        subtitle={`Tìm thấy ${totalItems} kết quả`}
      />

      {/* Main Content: Sidebar + Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* LEFT: Filter Sidebar */}
          <FilterSidebar
            isMobileOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            selectedLocation={resolvedProvinceID}
            onLocationChange={(code) => {
              // Update URL with location code as destination
              navigate(`/destinations?destination=${code}&serviceType=${paramServiceType}`);
            }}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            minPrice={0}
            maxPrice={100000000} // Cập nhật Max Price UI
            sortBy={sortBy}
            onSortChange={setSortBy}
            minRating={minRating}
            onRatingChange={setMinRating}
          />

          {/* RIGHT: Destination Cards */}
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

            {/* Active Filters Display */}
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

              {/* Reset Price Logic Update */}
              {(priceRange[0] > 0 || priceRange[1] < 100000000) && (

                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <span>Giá: {(priceRange[0] / 1000000).toFixed(1)}tr - {(priceRange[1] / 1000000).toFixed(1)}tr</span>
                  <button onClick={() => setPriceRange([0, 100000000])} className="hover:text-orange-900 cursor-pointer">
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

            {/* Loading / Empty / List */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
                    onSelect={(_code, name) => {
                        const slug = name;
                        // Simple navigation to trigger refresh with new location
                        navigate(`/destinations/vietnam/${slug}/all`);
                    }}
                      placeholder="Chọn tỉnh/thành phố..."
                    />
                  </div>

                  <button
                    onClick={() => {
                      setPriceRange([0, 100000000]);
                      setMinRating(0);
                      setSortBy('popular');
                      // Note: We keep provinceCode (location) as per UX discussion
                    }}
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {destinations.map((item) => {
                  // Use real discounts from backend if available, otherwise no discount
                  const discounts = item.discounts || [];
                  const activeDiscount = discounts.length > 0 ? discounts[0] : null;

                  const rawPrice = item.averagePrice ?? 0;
                  let discountedPrice = rawPrice;
                  let discountLabel = undefined;

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
                        id: item.id?.toString() || '',
                        title: item.serviceName,
                        location: item.province?.fullName || item.address || 'Việt Nam',
                        rating: item.rating?.toString() || '0',
                        reviews: item.reviewCount?.toString() || '0',
                        description: item.description,
                        price: discountedPrice > 0 ? discountedPrice.toLocaleString('vi-VN') + ' ₫' : rawPrice.toLocaleString('vi-VN') + ' ₫',
                        originalPrice: activeDiscount && rawPrice > 0 ? rawPrice.toLocaleString('vi-VN') + ' ₫' : undefined,
                        nights: 'Trong ngày',
                        image: item.thumbnailUrl || 'https://via.placeholder.com/400x300',
                        discount: discountLabel,
                      }}
                      onBook={(id) => handleBooking(id)}
                      onClick={() => click_card(item.id, item)}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DestinationsPage;