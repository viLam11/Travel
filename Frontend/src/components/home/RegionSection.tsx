// src/components/home/RegionSection.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Region {
  id: string;
  name: string;
  location: string;
  image: string;
}

interface Place {
  id: string;
  name: string;
  image: string;
}

interface RegionData {
  regions: Region[];
  places: Place[];
}

const RegionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('north');
  const navigate = useNavigate();

  // Data cho từng miền
  const regionData: Record<string, RegionData> = {
    north: {
      regions: [
        { 
          id: '1', 
          name: 'Miền Bắc', 
          location: 'Hạ Long',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop'
        },
        { 
          id: '2', 
          name: 'Miền Bắc', 
          location: 'Sapa',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop'
        },
        { 
          id: '3', 
          name: 'Miền Bắc', 
          location: 'Hà Nội',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop'
        }
      ],
      places: [
        { id: '4', name: 'Tam Cốc', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop' },
        { id: '5', name: 'Ninh Bình', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop' },
        { id: '6', name: 'Mai Châu', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=300&fit=crop' }
      ]
    },
    central: {
      regions: [
        { 
          id: '7', 
          name: 'Miền Trung', 
          location: 'Đà Nẵng',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop'
        },
        { 
          id: '8', 
          name: 'Miền Trung', 
          location: 'Hội An',
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop'
        },
        { 
          id: '9', 
          name: 'Miền Trung', 
          location: 'Huế',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop'
        }
      ],
      places: [
        { id: '10', name: 'Huế', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop' },
        { id: '11', name: 'Phong Nha', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop' },
        { id: '12', name: 'Quy Nhơn', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=300&fit=crop' }
      ]
    },
    south: {
      regions: [
        { 
          id: '13', 
          name: 'Miền Nam', 
          location: 'Phú Quốc',
          image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop'
        },
        { 
          id: '14', 
          name: 'Miền Nam', 
          location: 'Vũng Tàu',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop'
        },
        { 
          id: '15', 
          name: 'Miền Nam', 
          location: 'Cần Thơ',
          image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop'
        }
      ],
      places: [
        { id: '16', name: 'Nha Trang', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=300&fit=crop' },
        { id: '17', name: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=300&fit=crop' },
        { id: '18', name: 'Mũi Né', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=300&fit=crop' }
      ]
    }
  };

  const currentData = regionData[activeTab];

  // Navigate to destination detail page
  const handleRegionClick = (location: string) => {
    // Convert location to URL-friendly format
    const urlLocation = location.toLowerCase().replace(/\s+/g, '-');
    navigate(`/destination/${urlLocation}`, { state: { location } });
  };

  const handlePlaceClick = (name: string) => {
    const urlName = name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/destination/${urlName}`, { state: { location: name } });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1D7A] mb-3 ">
            ĐIỂM ĐẾN YÊU THÍCH
          </h2>
          <p className="text-gray-600 text-base">
            Trải nghiệm các điểm du lịch nổi tiếng với đa dạng
          </p>
        </div>

        {/* Region Tabs - Spacing rộng hơn */}
        <div className="flex justify-center gap-70 mb-10">
          <button 
            onClick={() => setActiveTab('north')}
            className={`pb-3 px-2 font-bold text-xl transition-colors fz-20 ${
              activeTab === 'north' 
                ? 'text-[#1A1D7A] border-b-4 border-blue-600' 
                : 'text-gray-600 hover:text-orange-500 cursor-pointer'
            }`}
          >
            Miền Bắc
          </button>
          <button 
            onClick={() => setActiveTab('central')}
            className={`pb-3 px-2 font-bold text-xl transition-colors ${
              activeTab === 'central' 
                ? 'text-[#1A1D7A] border-b-4 border-blue-600' 
                : 'text-gray-600 hover:text-orange-500 cursor-pointer'
            }`}
          >
            Miền Trung
          </button>
          <button 
            onClick={() => setActiveTab('south')}
            className={`pb-3 px-2 font-bold text-xl transition-colors ${
              activeTab === 'south' 
                ? 'text-[#1A1D7A] border-b-4 border-blue-600' 
                : 'text-gray-600 hover:text-orange-500 cursor-pointer'
            }`}
          >
            Miền Nam
          </button>
        </div>

        {/* Main Region Cards - Fade in animation with routing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
          {currentData.regions.map((region) => (
            <div 
              key={region.id} 
              className="group cursor-pointer"
              onClick={() => handleRegionClick(region.location)}
            >
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={region.image} 
                  alt={region.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{region.location}</h3>
                </div>
                
                {/* Hover overlay effect */}
                <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Places Grid - Fade in animation with routing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {currentData.places.map((place) => (
            <div 
              key={place.id} 
              className="group cursor-pointer"
              onClick={() => handlePlaceClick(place.name)}
            >
              <div className="relative h-52 rounded-xl overflow-hidden shadow-md">
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-lg font-semibold">{place.name}</h4>
                </div>
                
                {/* Hover overlay effect */}
                <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default RegionSection;