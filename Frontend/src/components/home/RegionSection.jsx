// src/components/home/RegionSection.jsx
import React from 'react';

const RegionSection = () => {
  const regions = [
    { name: 'Miền Bắc', location: 'Hạ Long' },
    { name: 'Miền Trung', location: 'Đà Nẵng' },
    { name: 'Miền Nam', location: 'Cần Thơ' }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">ĐIỂM ĐẾN YÊU THÍCH</h2>
        <p className="text-gray-600 text-center mb-12">
          Tận hưởng cuộc đời với trải nghiệm tuyệt vời của riêng bạn
        </p>

        {/* Main Region Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {regions.map((region, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-300 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-2xl font-bold mb-2">{region.name}</h3>
                  <p className="text-sm opacity-90">{region.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative h-48 rounded-xl overflow-hidden shadow-md group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-300 group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegionSection;