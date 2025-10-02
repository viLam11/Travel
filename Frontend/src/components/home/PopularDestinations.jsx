// src/components/home/PopularDestinations.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import DestinationCard from '../common/DestinationCard';

const PopularDestinations = () => {
  const destinations = [
    { title: 'Du lịch Hạ Long', location: 'Quảng Ninh', price: '1.500.000đ', rating: '4.8' },
    { title: 'Khám phá Sapa', location: 'Lào Cai', price: '2.000.000đ', rating: '4.9' },
    { title: 'Tour Phú Quốc', location: 'Kiên Giang', price: '3.500.000đ', rating: '4.7' },
    { title: 'Đà Nẵng - Hội An', location: 'Đà Nẵng', price: '1.800.000đ', rating: '4.8' },
    { title: 'Nha Trang biển xanh', location: 'Khánh Hòa', price: '1.600.000đ', rating: '4.6' },
    { title: 'Đà Lạt lãng mạn', location: 'Lâm Đồng', price: '1.200.000đ', rating: '4.9' }
  ];

  const handleBook = (destination) => {
    console.log('Booking:', destination);
    // Handle booking logic
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Địa điểm yêu thích</h2>
          <a href="#" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            Xem tất cả
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <DestinationCard 
              key={index} 
              {...dest} 
              onBook={() => handleBook(dest)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;