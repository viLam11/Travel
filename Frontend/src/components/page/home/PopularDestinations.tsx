// src/components/page/home/PopularDestinations.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationCard from '../../common/DestinationCard';
import apiClient from '@/services/apiClient';

interface Destination {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
  destinationSlug: string;
  regionSlug: string;
  serviceType: string;
  rating?: string;
  reviews?: string;
  description?: string;
  price?: string;
  nights?: string;
  discount?: string;
}

const PopularDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mock data for fallback
  const mockServices: Destination[] = [
    { id: '1', title: 'Vinpearl Land Nha Trang', location: 'Nha Trang, Khánh Hòa', priceRange: '880.000 ₫', openingHours: '8:00 - 21:00', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop', destinationSlug: 'nha-trang', regionSlug: 'mien-trung', serviceType: 'place', rating: '4.8', reviews: '240 reviews' },
    { id: '2', title: 'Sun World Ba Na Hills', location: 'Đà Nẵng', priceRange: '850.000 ₫', openingHours: '7:00 - 22:00', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', destinationSlug: 'da-nang', regionSlug: 'mien-trung', serviceType: 'place', rating: '4.9', reviews: '1.2k reviews' },
    { id: '3', title: 'Khách sạn Melia Vinpearl', location: 'Huế', priceRange: '2.500.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', destinationSlug: 'hue', regionSlug: 'mien-trung', serviceType: 'hotel', rating: '5.0', reviews: '89 reviews' },
    { id: '4', title: 'Du thuyền Heritage', location: 'Hạ Long, Quảng Ninh', priceRange: '3.200.000 ₫', openingHours: '8:00 - 17:00', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop', destinationSlug: 'ha-long', regionSlug: 'mien-bac', serviceType: 'place', rating: '4.7', reviews: '56 reviews' },
    { id: '5', title: 'Landmark 81 SkyView', location: 'Bình Thạnh, TP.HCM', priceRange: '810.000 ₫', openingHours: '9:00 - 22:00', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=300&fit=crop', destinationSlug: 'ho-chi-minh', regionSlug: 'mien-nam', serviceType: 'ticket', rating: '4.6', reviews: '310 reviews' },
    { id: '6', title: 'Grand World Phú Quốc', location: 'Phú Quốc, Kiên Giang', priceRange: 'Miễn phí', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=400&h=300&fit=crop', destinationSlug: 'phu-quoc', regionSlug: 'mien-nam', serviceType: 'place', rating: '4.8', reviews: '450 reviews' },
  ];

  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        setIsLoading(true);
        // Fetch page 0, size 6 for initial view
        const response: any = await apiClient.services.list(0, 6);

        if (response && response.services && response.services.length > 0) {
          const mappedDestinations = response.services.map((service: any) => {
            // const titleSlug = (service.serviceName || '').toLowerCase().replace(/\s+/g, '-');
            const regionSlug = 'vietnam';
            const destinationSlug = service.province?.customer_name || 'general';

            let typeSlug = 'place';
            if (service.serviceType === 'HOTEL') typeSlug = 'hotel';
            if (service.serviceType === 'RESTAURANT') typeSlug = 'restaurant';
            if (service.serviceType === 'TICKET_VENUE') typeSlug = 'ticket';

            return {
              id: service.id.toString(),
              title: service.serviceName,
              location: service.province?.fullName || service.address || 'Việt Nam',
              priceRange: service.averagePrice ? `${service.averagePrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ',
              openingHours: '8:00 - 22:00',
              image: service.thumbnailUrl || 'https://via.placeholder.com/400x300',
              destinationSlug: destinationSlug,
              regionSlug: regionSlug,
              serviceType: typeSlug,
              rating: service.rating || '4.5',
              reviews: '100+'
            };
          });
          setDestinations(mappedDestinations);
        } else {
          // Fallback if empty array
          console.log("No services found from API, using mock data");
          setDestinations(mockServices);
        }
      } catch (error) {
        console.error("Failed to fetch popular destinations, using mock data", error);
        setDestinations(mockServices);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  const handleBook = (id: string): void => {
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;

    const idSlug = `${id}-${dest.title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;

    // /destinations/:region/:destination/:serviceType/:idSlug
    navigate(`/destinations/vietnam/general/${dest.serviceType}/${idSlug}`);
  };

  const handleViewAll = () => {
    navigate('/destinations');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Địa điểm & Dịch vụ Nổi bật</h2>

          <button
            onClick={handleViewAll}
            className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
          >
            Xem tất cả
          </button>
        </div>

        {/* Loading */}
        {isLoading && destinations.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-80 rounded-lg shadow animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={{
                  id: dest.id,
                  title: dest.title,
                  location: dest.location,
                  rating: dest.rating,
                  reviews: dest.reviews,
                  price: dest.priceRange,
                  image: dest.image,
                  openingHours: dest.openingHours,
                  description: dest.description,
                  discount: dest.discount,
                  nights: dest.nights
                }}
                onBook={() => handleBook(dest.id)}
                onClick={() => handleBook(dest.id)}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default PopularDestinations;