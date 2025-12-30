// src/pages/DestinationsPage.tsx
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../../../components/common/layout/Footer';
import FilterSidebar from '../../../components/page/destinationFilter/FilterSidebar';
import DestinationCard from '../../../components/page/destinationFilter/DestinationFIlterCard';
import apiClient from '@/services/apiClient';
import Pagination from '../../../components/common/Pagination';
import LocationSelector from '@/components/common/LocationSelector';
import type { BreadcrumbItem } from '../../../components/common/Breadcrumb';
import { getDestinationInfo, getServiceTypeName, type SortValue } from '@/constants/regions';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
interface DestinationsPageProps {
  onNavigateToHome?: () => void;
}

const DestinationsPage: React.FC<DestinationsPageProps> = ({ onNavigateToHome }) => {
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
  const provinceCode = destination || ''; // Province code from URL (e.g., 'ha-noi')
  const paramServiceType = searchParams.get('serviceType') || serviceType || '';
  const paramStartDate = searchParams.get('startDate');
  const paramEndDate = searchParams.get('endDate');

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

      // Call API
      const response: any = await apiClient.services.search({
        provinceCode: provinceCode || undefined, // Filter by province
        keyword: searchKeyword || undefined, // Text search
        serviceType: paramServiceType, // Use from query params
        minPrice: priceRange[0],
        maxPrice: priceRange[1] < 100000000 ? priceRange[1] : undefined,
        minRating: minRating > 0 ? minRating : undefined, // Only send if rating filter is active
        page: currentPage - 1,
        size: 5,
        sortBy: apiSortBy,
        direction: apiDirection
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
    fetchDestinations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchKeyword, provinceCode, serviceType, priceRange, sortBy, minRating, currentPage]); // Re-fetch dependencies


  // Get destination info for UI
  const destInfo = destination ? getDestinationInfo(destination) : null;
  const serviceTypeName = serviceType ? getServiceTypeName(serviceType, true) : '';

  // Determine page title and breadcrumb
  const getPageTitle = () => {
    if (searchKeyword) return `Kết quả tìm kiếm cho "${searchKeyword}"`;
    if (provinceCode) {
      const destInfo = getDestinationInfo(provinceCode);
      if (destInfo) return destInfo.name;

      // If not in hardcoded list, try to get from first service result
      if (destinations.length > 0 && destinations[0].province) {
        return destinations[0].province.fullName || destinations[0].province.name || provinceCode;
      }

      // Fallback: decode and capitalize provinceCode
      return decodeURIComponent(provinceCode).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Tất cả điểm đến';
  };

  const click_card = (id: string, item: any) => {
    console.log('Navigate to:', id);
    console.log('Item data:', item);

    // Determine service type based on item data from API
    // Enum Backend: HOTEL, RESTAURANT, TICKET_VENUE
    let typeSlug = 'place';
    if (item.serviceType === 'HOTEL') typeSlug = 'hotel';
    if (item.serviceType === 'RESTAURANT') typeSlug = 'restaurant';
    if (item.serviceType === 'TICKET_VENUE') typeSlug = 'ticket';

    // Create slug: id-title
    const titleSlug = (item.serviceName || 'service')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const idSlug = `${id}-${titleSlug}`;

    // Get province code from item data
    // If province is null or doesn't have code, use a fallback
    const provinceCode = item.province?.code || item.province?.provinceCode || 'ha-noi';

    // Construct Path: /destinations/vietnam/ha-noi/hotel/101-grand-hotel
    const targetRegion = region || 'vietnam';

    const finalUrl = `/destinations/${targetRegion}/${provinceCode}/${typeSlug}/${idSlug}`;
    console.log('🚀 Navigating to URL:', finalUrl);

    navigate(finalUrl);
  };

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Trang chủ',
      onClick: onNavigateToHome
    },
    {
      label: 'Miền Bắc',
      onClick: () => console.log('Navigate to Miền Bắc')
    },
    {
      label: 'Địa điểm',
      isActive: true
    }
  ];

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
            onLocationChange={(code, name) => navigate(`/destinations/vietnam/${name}/all`)}
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
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
                  <button onClick={() => setSortBy('popular')} className="hover:text-orange-900">
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
                  <button onClick={() => setPriceRange([0, 100000000])} className="hover:text-orange-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

              )}

              {minRating > 0 && (

                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">

                  <span>{minRating}★ trở lên</span>
                  <button onClick={() => setMinRating(0)} className="hover:text-orange-900">
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
                      onSelect={(code, name) => {
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
                    }}
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {destinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={{
                      id: destination.id,
                      title: destination.serviceName,
                      location: destination.province?.fullName || destination.address || 'Việt Nam',
                      rating: destination.rating || '0',
                      reviews: '0', // API chưa có field này?
                      description: destination.description,
                      price: destination.averagePrice?.toLocaleString('vi-VN') + ' ₫',
                      nights: 'Trong ngày', // Placeholder
                      image: destination.thumbnailUrl || 'https://via.placeholder.com/400x300',
                      discount: ''
                    }}
                    onBook={handleBooking}
                    onClick={() => click_card(destination.id, destination)}
                  />
                ))}
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