// src/components/home/HeroSection.jsx
import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const HeroSection = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    console.log('Search:', { destination, checkIn, guests });
  };

  return (
    <div className="relative h-[500px] bg-gradient-to-r from-blue-500 to-cyan-400">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(data:image/svg+xml,%3Csvg width="1440" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="0%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(59,130,246);stop-opacity:0.9" /%3E%3Cstop offset="100%25" style="stop-color:rgb(34,211,238);stop-opacity:0.9" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="1440" height="500" fill="url(%23grad)" /%3E%3C/svg%3E)',
          opacity: 0.95
        }}
      />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Tận hưởng chuyến đi
        </h1>
        <p className="text-xl text-white mb-8 drop-shadow">
          Tận hưởng cuộc đời với trải nghiệng không của riêng bạn
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Destination */}
            <div className="flex items-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
              <MapPin className="text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs text-gray-500 block">Địa điểm</label>
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="flex items-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
              <Calendar className="text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs text-gray-500 block">Ngày đi</label>
                <input
                  type="text"
                  placeholder="Thêm ngày"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-center pb-4 md:pb-0 md:pr-4">
              <Users className="text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs text-gray-500 block">Khách</label>
                <input
                  type="text"
                  placeholder="Thêm khách"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-center">
              <button 
                onClick={handleSearch}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;