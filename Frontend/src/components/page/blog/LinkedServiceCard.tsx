// src/components/page/blog/LinkedServiceCard.tsx
import React from 'react';
import { MapPin, Hotel, Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LinkedService } from '@/types/blog.types';

interface LinkedServiceCardProps {
  service: LinkedService;
}

const LinkedServiceCard: React.FC<LinkedServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (service.type === 'HOTEL') {
      navigate(`/hotels/${service.id}`);
    } else {
      navigate(`/service/${service.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl cursor-pointer hover:bg-orange-100 hover:border-orange-200 hover:shadow-sm transition-all duration-200 group"
    >
      {/* Image */}
      {service.thumbnailUrl ? (
        <img
          src={service.thumbnailUrl}
          alt={service.serviceName}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-orange-200 flex items-center justify-center flex-shrink-0">
          {service.type === 'HOTEL' ? (
            <Hotel className="w-6 h-6 text-orange-500" />
          ) : (
            <Compass className="w-6 h-6 text-orange-500" />
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              service.type === 'HOTEL'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {service.type === 'HOTEL' ? 'Khách sạn' : 'Dịch vụ'}
          </span>
        </div>
        <p className="font-semibold text-gray-800 text-sm truncate">{service.serviceName}</p>
        <p className="flex items-center gap-1 text-xs text-gray-500 truncate mt-0.5">
          <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
          {service.province || 'Chưa xác định'}
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </div>
  );
};

export default LinkedServiceCard;
