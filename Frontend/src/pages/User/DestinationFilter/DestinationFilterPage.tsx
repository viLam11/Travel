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
      title: 'Phú Quốc Islands Adventure Day Trip with Seawalker Lunch by V. Marine Tour',
      location: 'Đà Nẵng',
      rating: '4.8',
      reviews: '265',
      description: 'The Phú archipelago is a must-visit while in Phuket, and this speedboat trip...',
      price: '$114',
      nights: '2 Days | 1 Nights',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      discount: '20 % OFF'
    },
    {
      id: '2',
      title: 'Tham quan núi Bà Đen',
      location: 'Cát Bà',
      rating: '4.8',
      reviews: '265',
      description: 'The Phú archipelago is a must-visit while in Phuket, and this speedboat trip...',
      price: '$114',
      nights: '2 Days | 1 Nights',
      image: 'https://images.unsplash.com/photo-1528184039930-bd03972bd974?w=500',
      discount: '-20 % OFF'
    },
    {
      id: '3',
      title: 'VinPearl Nha Trang',
      location: 'Cát Bà',
      rating: '4.8',
      reviews: '265',
      description: 'The Phú archipelago is a must-visit while in Phuket, and this speedboat trip...',
      price: '$114',
      nights: '2 Days | 1 Nights',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
      discount: '-20 % OFF'
    },
    {
      id: '4',
      title: 'Phú Quốc Islands Adventure Day Trip with Seawalker Lunch by V. Marine Tour',
      location: 'Đà Nẵng',
      rating: '4.8',
      reviews: '265',
      description: 'The Phú archipelago is a must-visit while in Phuket, and this speedboat trip...',
      price: '$114',
      nights: '2 Days | 1 Nights',
      image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=500',
      discount: '-20 % OFF'
    },
    {
      id: '5',
      title: 'Phú Quốc Islands Adventure Day Trip with Seawalker Lunch by V. Marine Tour',
      location: 'Đà Nẵng',
      rating: '4.8',
      reviews: '265',
      description: 'The Phú archipelago is a must-visit while in Phuket, and this speedboat trip...',
      price: '$114',
      nights: '2 Days | 1 Nights',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500',
      discount: '-20 % OFF'
    },
    {
      id: '6',
      title: 'Phú Quốc Islands Adventure Day Trip',
      location: 'Đà Nẵng',
      rating: '4.8',
      reviews: '265',
      description: 'The Phú archipelago is a must-visit while in Phuket, and this speedboat trip...',
      price: '$114',
      nights: '2 Days | 1 Nights',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
      discount: '-20 % OFF'
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