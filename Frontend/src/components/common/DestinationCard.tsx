import React from 'react';

interface DestinationCardProps {
  id: string;
  title: string;
  location: string;
  priceRange: string;
  openingHours: string;
  image: string;
  onBook: (id: string) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  title,
  location,
  priceRange,
  openingHours,
  image,
  onBook
}) => {
  return (
    <div className="animate-fadeIn bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex group h-auto">
      {/* Image - Left Side */}
      <div className="w-[40%] flex-shrink-0 relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Heart Icon */}
        <div className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:scale-110">
          <svg 
            className="w-5 h-5 text-orange-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Content - Right Side */}
      <div className="w-[60%] p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors duration-200">
            {title}
          </h3>
          
          <div className="space-y-2">
            {/* Location */}
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <svg 
                className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <span className="flex-1">
                <span className="font-medium">Địa chỉ:</span> {location}
              </span>
            </p>
            
            {/* Opening Hours */}
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <svg 
                className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span className="flex-1">
                <span className="font-medium">Thời gian mở cửa:</span> {openingHours}
              </span>
            </p>
          </div>
        </div>

        {/* Price & Booking Button */}
      <div className="mt-4 flex justify-between items-center">
        {/* Cột bên trái: Giá từ + giá */}
        <div className="flex flex-col">
          <p className="text-sm text-gray-500">Giá từ:</p>
          <p className="text-xs font-bold text-orange-500">
            {priceRange}
          </p>
        </div>

        {/* Cột bên phải: nút Đặt ngay */}
        <button
          onClick={() => onBook(id)}
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
        >
          ĐẶT NGAY
        </button>
      </div>
      </div>
    </div>
  );
};

export default DestinationCard;
