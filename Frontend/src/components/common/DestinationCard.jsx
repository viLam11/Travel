// src/components/common/DestinationCard.jsx
import React from 'react';

const DestinationCard = ({ title, location, price, rating, onBook }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-orange-500">{price}</span>
            <span className="text-xs text-gray-500 ml-1">/ người</span>
          </div>
          <button 
            onClick={onBook}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;