import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store';
import { loadDestination } from '../../../store/slices/destinationSlice';
// import Navigation from '../../components/common/layout/NavigationUser';
import Footer from '../../../components/common/layout/Footer';
import DestinationCard from '../../../components/common/DestinationCard';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
import { getDestinationInfo } from '@/constants/regions';

const DestinationDetailPage: React.FC = () => {
  const { region, destination } = useParams<{ region: string; destination: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAll, setShowAll] = useState(false); // Toggle tổng hợp
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [showAllFood, setShowAllFood] = useState(false);
  const [showAllHotels, setShowAllHotels] = useState(false);

  // Lấy state từ Redux
  const { data, loading, error } = useSelector(
    (state: RootState) => state.destination
  );

  /**
   * Load destination data khi component mount hoặc destination thay đổi
   */
  useEffect(() => {
    if (!destination || !region) {
      navigate('/homepage');
      return;
    }
    // Validate region-destination mapping
    const destInfo = getDestinationInfo(destination);
    if (!destInfo || destInfo.region !== region) {
      navigate('/homepage');
      return;
    }
    dispatch(loadDestination(destination));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [destination, region, dispatch, navigate]);

  /**
   * Handle booking
   */
  const handleBook = (id: string, item: any) => {
    console.log('Booking destination:', id);
    // Determine service type based on section
    let serviceType = 'place'; // Default

    // You can pass serviceType as prop or determine from item
    if (item.category === 'food') serviceType = 'restaurant';
    if (item.category === 'hotel') serviceType = 'hotel';
    if (item.category === 'event') serviceType = 'event';

    // Create slug: id-title
    const titleSlug = item.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const idSlug = `${id}-${titleSlug}`;

    // Navigate với region trong URL
    navigate(`/destinations/${region}/${destination}/${serviceType}/${idSlug}`);
    // TODO: Implement booking logic
  };

  /**
   * Handle "Xem tất cả" - Expand tất cả sections
   */
  const handleViewAll = () => {
    setShowAll(true);
    setShowAllHighlights(true);
    setShowAllFood(true);
    setShowAllHotels(true);
  };

  /**
   * FIX: LOADING STATE - Hiển thị spinner đúng
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * FIX: ERROR STATE - Chỉ hiển thị khi có error HOẶC data = null SAU KHI load xong
   */
  if (error || (!loading && !data)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy thông tin
            </h2>
            <p className="text-gray-600 mb-6">
              {error || `Không có dữ liệu cho "${destination}"`}
            </p>
            <button
              onClick={() => navigate('/homepage')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * SUCCESS STATE - data đã có
   */
  if (!data) return null; // Safety check

  // Displayed items với safe check
  const displayedHighlights = showAllHighlights
    ? data.highlights
    : data.highlights.slice(0, 6);
  const displayedFood = showAllFood
    ? data.food
    : data.food.slice(0, 6);
  const displayedHotels = showAllHotels
    ? data.hotels
    : data.hotels.slice(0, 6);

  // Tính tổng số items để quyết định hiển thị "Xem tất cả"
  const totalItems = data.highlights.length + data.food.length + data.hotels.length;
  const displayedItems = displayedHighlights.length + displayedFood.length + displayedHotels.length;
  const hasMoreItems = totalItems > displayedItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> */}
      <BreadcrumbSection
        auto
        title={`Khám phá ${data.name}`}
        subtitle={`${totalItems} dịch vụ • ${data.region}`}
      />
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
        <img
          src={data.heroImage}
          alt={data.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
              {data.name}
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 drop-shadow max-w-2xl mb-2">
            {data.description}
          </p>
          <p className="text-xs sm:text-sm text-orange-400 font-medium">
            {data.region}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header với nút "Xem tất cả dịch vụ" */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 pt-8 sm:pt-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Khám phá {data.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tổng cộng {totalItems} dịch vụ
            </p>
          </div>

          {/* Nút "Xem tất cả" tổng hợp */}
          {!showAll && hasMoreItems && (
            <button
              onClick={handleViewAll}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
            >
              Xem tất cả dịch vụ
            </button>
          )}
        </div>

        {/* Địa điểm nổi bật */}
        {data.highlights.length > 0 && (
          <section className="pb-8 sm:pb-12 lg:pb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Địa điểm nổi bật ({data.highlights.length})
              </h3>
              {!showAll && data.highlights.length > 6 && (
                <button
                  onClick={() => setShowAllHighlights(!showAllHighlights)}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
                >
                  {showAllHighlights ? 'Thu gọn' : 'Tất cả'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedHighlights.map((item) => (
                <DestinationCard
                  key={item.id}
                  destination={item}
                  onBook={(id) => handleBook(id, { ...item, category: 'place' })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ẩm thực */}
        {data.food.length > 0 && (
          <section className="py-8 sm:py-12 lg:py-16 bg-white rounded-2xl shadow-sm mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Ẩm thực ({data.food.length})
              </h3>
              {!showAll && data.food.length > 6 && (
                <button
                  onClick={() => setShowAllFood(!showAllFood)}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
                >
                  {showAllFood ? 'Thu gọn' : 'Tất cả'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedFood.map((item) => (
                <DestinationCard
                  key={item.id}
                  destination={item}
                  onBook={(id) => handleBook(id, { ...item, category: 'food' })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Khách sạn */}
        {data.hotels.length > 0 && (
          <section className="pb-8 sm:pb-12 lg:pb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Khách sạn ({data.hotels.length})
              </h3>
              {!showAll && data.hotels.length > 6 && (
                <button
                  onClick={() => setShowAllHotels(!showAllHotels)}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
                >
                  {showAllHotels ? 'Thu gọn' : 'Tất cả'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedHotels.map((item) => (
                <DestinationCard
                  key={item.id}
                  destination={item}
                  onBook={(id) => handleBook(id, { ...item, category: 'hotel' })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Statistics Section */}
        <section className="py-8 sm:py-12 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-sm mb-8 sm:mb-12 px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">932M</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Donations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">24M</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Campaigns Closed</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">10M</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Happy People</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">65M</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Our Volunteers</p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="pb-12 text-center">
          <button
            onClick={() => navigate('/homepage')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetailPage;