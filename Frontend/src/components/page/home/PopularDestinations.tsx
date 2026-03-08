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
  const [hotels, setHotels] = useState<Destination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);
  const [isLoadingHotels, setIsLoadingHotels] = useState<boolean>(true);

  // Mock data for fallback
  const mockDestinations: Destination[] = [
    { id: '1', title: 'Vinpearl Land Nha Trang', location: 'Nha Trang, Khánh Hòa', priceRange: '880.000 ₫', openingHours: '8:00 - 21:00', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop', destinationSlug: 'nha-trang', regionSlug: 'mien-trung', serviceType: 'place', rating: '4.8', reviews: '240 reviews' },
    { id: '2', title: 'Sun World Ba Na Hills', location: 'Đà Nẵng', priceRange: '850.000 ₫', openingHours: '7:00 - 22:00', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', destinationSlug: 'da-nang', regionSlug: 'mien-trung', serviceType: 'place', rating: '4.9', reviews: '1.2k reviews' },
    { id: '4', title: 'Du thuyền Heritage', location: 'Hạ Long, Quảng Ninh', priceRange: '3.200.000 ₫', openingHours: '8:00 - 17:00', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop', destinationSlug: 'ha-long', regionSlug: 'mien-bac', serviceType: 'place', rating: '4.7', reviews: '56 reviews' },
    { id: '5', title: 'Landmark 81 SkyView', location: 'Bình Thạnh, TP.HCM', priceRange: '810.000 ₫', openingHours: '9:00 - 22:00', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=300&fit=crop', destinationSlug: 'ho-chi-minh', regionSlug: 'mien-nam', serviceType: 'ticket', rating: '4.6', reviews: '310 reviews' },
    { id: '6', title: 'Grand World Phú Quốc', location: 'Phú Quốc, Kiên Giang', priceRange: 'Miễn phí', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=400&h=300&fit=crop', destinationSlug: 'phu-quoc', regionSlug: 'mien-nam', serviceType: 'place', rating: '4.8', reviews: '450 reviews' },
    { id: '9', title: 'Phố cổ Hội An', location: 'Hội An, Quảng Nam', priceRange: 'Miễn phí', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop', destinationSlug: 'hoi-an', regionSlug: 'mien-trung', serviceType: 'place', rating: '4.9', reviews: '680 reviews' },
  ];

  const mockHotels: Destination[] = [
    { id: '3', title: 'Khách sạn Melia Vinpearl', location: 'Huế', priceRange: '2.500.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', destinationSlug: 'hue', regionSlug: 'mien-trung', serviceType: 'hotel', rating: '5.0', reviews: '89 reviews' },
    { id: '7', title: 'InterContinental Hanoi', location: 'Hà Nội', priceRange: '3.500.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop', destinationSlug: 'ha-noi', regionSlug: 'mien-bac', serviceType: 'hotel', rating: '4.9', reviews: '156 reviews' },
    { id: '8', title: 'Vinpearl Resort Phú Quốc', location: 'Phú Quốc, Kiên Giang', priceRange: '4.200.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop', destinationSlug: 'phu-quoc', regionSlug: 'mien-nam', serviceType: 'hotel', rating: '4.8', reviews: '203 reviews' },
    { id: '10', title: 'JW Marriott Hanoi', location: 'Hà Nội', priceRange: '4.800.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop', destinationSlug: 'ha-noi', regionSlug: 'mien-bac', serviceType: 'hotel', rating: '4.9', reviews: '278 reviews' },
    { id: '11', title: 'Sheraton Nha Trang', location: 'Nha Trang, Khánh Hòa', priceRange: '3.200.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop', destinationSlug: 'nha-trang', regionSlug: 'mien-trung', serviceType: 'hotel', rating: '4.7', reviews: '192 reviews' },
    { id: '12', title: 'Pullman Đà Nẵng', location: 'Đà Nẵng', priceRange: '2.800.000 ₫', openingHours: '24/7', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop', destinationSlug: 'da-nang', regionSlug: 'mien-trung', serviceType: 'hotel', rating: '4.8', reviews: '234 reviews' },
  ];

  const mapServiceToDestination = (service: any): Destination => {
    const regionSlug = 'vietnam';
    const destinationSlug = service.province?.code || 'general';

    let typeSlug = 'place';
    if (service.serviceType === 'HOTEL') typeSlug = 'hotel';
    if (service.serviceType === 'RESTAURANT') typeSlug = 'restaurant';
    if (service.serviceType === 'TICKET_VENUE') typeSlug = 'ticket';
    if (service.serviceType === 'DESTINATION') typeSlug = 'place';

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
      rating: service.rating?.toString() || '4.5',
      reviews: '100+'
    };
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoadingDestinations(true);
        const response: any = await apiClient.services.search({
          serviceType: 'DESTINATION',
          page: 0,
          size: 6
        });

        if (response && response.services && response.services.length > 0) {
          const mapped = response.services.map(mapServiceToDestination);
          setDestinations(mapped);
        } else {
          console.log("No destinations found, using mock data");
          setDestinations(mockDestinations);
        }
      } catch (error) {
        console.error("Failed to fetch destinations, using mock data", error);
        setDestinations(mockDestinations);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    const fetchHotels = async () => {
      try {
        setIsLoadingHotels(true);
        const response: any = await apiClient.services.search({
          serviceType: 'HOTEL',
          page: 0,
          size: 6
        });

        if (response && response.services && response.services.length > 0) {
          const mapped = response.services.map(mapServiceToDestination);
          setHotels(mapped);
        } else {
          console.log("No hotels found, using mock data");
          setHotels(mockHotels);
        }
      } catch (error) {
        console.error("Failed to fetch hotels, using mock data", error);
        setHotels(mockHotels);
      } finally {
        setIsLoadingHotels(false);
      }
    };

    fetchDestinations();
    fetchHotels();
  }, []);

  const handleBook = (id: string, serviceType: string): void => {
    const allItems = [...destinations, ...hotels];
    const item = allItems.find(d => d.id === id);
    if (!item) return;

    const idSlug = `${id}-${item.title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
    navigate(`/destinations/vietnam/${item.destinationSlug}/${item.serviceType}/${idSlug}`);
  };

  const handleViewAllDestinations = () => {
    navigate('/destinations?serviceType=DESTINATION');
  };

  const handleViewAllHotels = () => {
    navigate('/destinations?serviceType=HOTEL');
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: Destination[],
    isLoading: boolean,
    onViewAll: () => void
  ) => (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
          </div>

          <button
            onClick={onViewAll}
            className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
          >
            Xem tất cả
          </button>
        </div>

        {/* Loading */}
        {isLoading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white h-80 rounded-lg shadow animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {items.map((item) => (
              <DestinationCard
                key={item.id}
                destination={{
                  id: item.id,
                  title: item.title,
                  location: item.location,
                  rating: item.rating,
                  reviews: item.reviews,
                  price: item.priceRange,
                  image: item.image,
                  openingHours: item.openingHours,
                  description: item.description,
                  discount: item.discount,
                  nights: item.nights
                }}
                onBook={() => handleBook(item.id, item.serviceType)}
                onClick={() => handleBook(item.id, item.serviceType)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="bg-gray-50">
      {/* Destinations Section */}
      {renderSection(
        'Địa điểm nổi bật',
        <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>,
        destinations,
        isLoadingDestinations,
        handleViewAllDestinations
      )}

      {/* Hotels Section */}
      {renderSection(
        'Khách sạn được yêu thích',
        <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>,
        hotels,
        isLoadingHotels,
        handleViewAllHotels
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PopularDestinations;