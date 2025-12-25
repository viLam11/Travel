// src/pages/DestinationsPage.tsx
import React, { useState } from 'react';
import Navigation from '../../../components/common/layout/NavigationUser';
import Footer from '../../../components/common/layout/Footer';
import FilterSidebar from '../../../components/page/destinationFilter/FilterSidebar';
import DestinationCard from '../../../components/page/destinationFilter/DestinationFIlterCard';
import Pagination from '../../../components/common/Pagination';
import { useNavigate, useParams } from 'react-router-dom';
import type { BreadcrumbSection, BreadcrumbItem } from '../../../components/common/Breadcrumb';

interface DestinationsPageProps {
  onNavigateToHome?: () => void;
}

const DestinationsPage: React.FC<DestinationsPageProps> = ({ onNavigateToHome }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const totalPages = 20;
  const { destination } = useParams<{ destination: string }>();
  const navigate = useNavigate();
  const click_card = (id: string, item: any) => {
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

    // Navigate to service detail page
    navigate(`/destinations/${destination}/${serviceType}/${idSlug}`);
    // TODO: Implement booking logic
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

  const destinations = [
    {
      id: '1',
      title: 'Vé tham quan VinWonders Phú Quốc',
      location: 'Phú Quốc',
      rating: '4.9',
      reviews: '320',
      description: 'Khám phá công viên chủ đề lớn nhất Việt Nam với hàng trăm trò chơi giải trí đẳng cấp thế giới và các show diễn thực cảnh Tinh Hoa Việt Nam ấn tượng.',
      price: '950.000 ₫',
      nights: 'Trong ngày',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      discount: 'Giảm 10%'
    },
    {
      id: '2',
      title: 'Tour săn mây núi Bà Đen',
      location: 'Tây Ninh',
      rating: '4.8',
      reviews: '150',
      description: 'Trải nghiệm cáp treo hiện đại chinh phục nóc nhà Nam Bộ, chiêm bái tượng Phật Bà Tây Bổ Đà Sơn và săn mây buổi sớm tuyệt đẹp.',
      price: '550.000 ₫',
      nights: 'Trong ngày',
      image: 'https://images.unsplash.com/photo-1528184039930-bd03972bd974?w=500',
      discount: 'Giảm 15%'
    },
    {
      id: '3',
      title: 'Vé vui chơi VinPearl Harbour Nha Trang',
      location: 'Nha Trang',
      rating: '4.7',
      reviews: '412',
      description: 'Trải nghiệm cáp treo vượt biển, tham quan bến cảng VinPearl Harbour sầm uất và thưởng thức show diễn Tata Show triệu đô.',
      price: '880.000 ₫',
      nights: 'Trong ngày',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
      discount: 'Giảm 5%'
    },
    {
      id: '4',
      title: 'Combo Tour Bà Nà Hills & Buffet Trưa',
      location: 'Đà Nẵng',
      rating: '5.0',
      reviews: '890',
      description: 'Check-in Cầu Vàng nổi tiếng thế giới, khám phá Làng Pháp cổ kính và thưởng thức tiệc buffet hơn 100 món ăn Á - Âu.',
      price: '1.250.000 ₫',
      nights: 'Trong ngày',
      image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=500',
      discount: 'Giảm 10%'
    },
    {
      id: '5',
      title: 'Tour lặn ngắm san hô Cù Lao Chàm',
      location: 'Hội An',
      rating: '4.8',
      reviews: '265',
      description: 'Cano cao tốc đưa đón ra đảo, trải nghiệm đi bộ dưới đáy biển (Seawalker) ngắm san hô và thưởng thức hải sản tươi sống.',
      price: '1.450.000 ₫',
      nights: 'Trong ngày',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500',
      discount: 'Giảm 20%'
    },
    {
      id: '6',
      title: 'Nghỉ dưỡng Resort 5 Sao & Tour 4 Đảo',
      location: 'Phú Quốc',
      rating: '4.9',
      reviews: '120',
      description: 'Gói nghỉ dưỡng cao cấp bao gồm 1 đêm tại Resort 5 sao view biển và tour cano tham quan 4 hòn đảo đẹp nhất phía Nam.',
      price: '3.890.000 ₫',
      nights: '2 Ngày | 1 Đêm',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
      discount: 'Giảm 25%'
    }
  ];

  const handleBooking = (id: string) => {
    console.log('Booking destination:', id);
    // TODO: Navigate to booking page or open booking modal
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {/* <Navigation 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn}
        onFilterClick={() => setIsMobileSidebarOpen(true)}
        onNavigateToDestinations={onNavigateToHome} // Click lại để về home hoặc refresh page
      /> */}

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-2">Trang chủ • Miền Bắc</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tìm kiếm tất cả địa điểm du lịch
          </h1>
        </div>
      </div>

      {/* Main Content: Sidebar + Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* LEFT: Filter Sidebar */}
          <FilterSidebar 
            isMobileOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />

          {/* RIGHT: Destination Cards */}
          <div className="flex-1 min-w-0">
            {/* Cards List */}
            <div className="space-y-5">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onBook={handleBooking}
                  onClick={() => click_card(destination.id, destination)}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DestinationsPage;