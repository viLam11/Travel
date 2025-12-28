// src/pages/DestinationsPage.tsx
import React, { useState } from 'react';
import Footer from '../../../components/common/layout/Footer';
import FilterSidebar from '../../../components/page/destinationFilter/FilterSidebar';
import DestinationCard from '../../../components/page/destinationFilter/DestinationFIlterCard';
import apiClient from '@/services/apiClient';
import Pagination from '../../../components/common/Pagination';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import type { BreadcrumbSection, BreadcrumbItem } from '../../../components/common/Breadcrumb';
import type { BreadcrumbItem } from '../../../components/common/Breadcrumb';
import { getDestinationInfo, getServiceTypeName, type SortValue } from '@/constants/regions';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
interface DestinationsPageProps {
  onNavigateToHome?: () => void;
}

const DestinationsPage: React.FC<DestinationsPageProps> = ({ onNavigateToHome }) => {
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
  const keyword = searchParams.get('destination') || destination || '';
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
        keyword: keyword,
        serviceType: serviceType, // 'HOTEL', 'RESTAURANT', 'TICKET_VENUE' if mapped correctly
        minPrice: priceRange[0],
        maxPrice: priceRange[1] < 100000000 ? priceRange[1] : undefined, // If max not changed, don't send limit
        page: currentPage - 1, // Backend 0-indexed
        size: 10,
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
  }, [keyword, serviceType, priceRange, sortBy, currentPage]); // Re-fetch dependencies


  // Get destination info for UI
  const destInfo = destination ? getDestinationInfo(destination) : null;
  const serviceTypeName = serviceType ? getServiceTypeName(serviceType, true) : '';

  // Determine page title and breadcrumb
  const navigate = useNavigate();
  const getPageTitle = () => {
    if (keyword) return `Kết quả tìm kiếm cho "${keyword}"`;
    return 'Tất cả điểm đến';
  };

  const click_card = (id: string, item: any) => {
    console.log('Navigate to:', id);
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

    // Construct Path: /destinations/vietnam/hanoi/hotel/101-grand-hotel
    // We can use generic region/destination placeholders if missing from item
    const targetRegion = region || 'vietnam';
    const targetDest = destination || 'general';

    navigate(`/destinations/${targetRegion}/${targetDest}/${typeSlug}/${idSlug}`);
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

  const handleBooking = (id: string) => {
    // console.log('Booking destination:', id);
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
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Không tìm thấy kết quả nào phù hợp.</p>
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