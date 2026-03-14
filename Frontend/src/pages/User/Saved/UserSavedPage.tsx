import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Star, 
  Trash2, 
  Grid3x3, 
  List,
  Loader2,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Map,
  Hotel
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from "@/services/apiClient";

interface SavedItem {
  id: string;
  type: 'hotel' | 'destination';
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price?: number;
  priceUnit?: string;
  image: string;
  savedDate: string;
  description: string;
}

const UserSavedPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'hotel' | 'destination'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        const data: any = await apiClient.favorites.getAll();
        const list = Array.isArray(data) ? data : (data?.content || []);
        
        const mapped: SavedItem[] = list.map((item: any) => ({
          id: item.serviceId,
          type: item.serviceType?.toLowerCase() === 'hotel' ? 'hotel' : 'destination',
          name: item.serviceName,
          location: item.provinceName,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          price: item.averagePrice,
          priceUnit: item.serviceType?.toLowerCase() === 'hotel' ? '/đêm' : '/vé',
          image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
          savedDate: new Date().toISOString(),
          description: '', 
        }));
        
        setSavedItems(mapped);
      } catch (error) {
        console.error("Lỗi fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const filteredItems = selectedType === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === selectedType);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (id: string) => {
    try {
      await apiClient.favorites.remove(id);
      setSavedItems(prev => prev.filter(item => item.id !== id));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      toast.error('Không thể xóa mục này');
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'hotel' ? 'Khách sạn' : 'Địa điểm';
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Khám phá tâm hồn của bạn...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2.5 rounded-2xl">
              <Bookmark className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Danh sách yêu thích</h1>
          </div>
          <p className="text-gray-500 font-medium">Nơi lưu giữ những địa điểm bạn mong muốn ghé thăm</p>
        </div>

        <div className="flex gap-2 bg-orange-50/50 border border-orange-100/50 p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-md transform -translate-y-0.5' : 'text-gray-400 hover:text-orange-400'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-md transform -translate-y-0.5' : 'text-gray-400 hover:text-orange-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modern Filter Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {[
          { value: 'all', label: 'Tất cả', count: savedItems.length, icon: Map },
          { value: 'hotel', label: 'Khách sạn', count: savedItems.filter(i => i.type === 'hotel').length, icon: Hotel },
          { value: 'destination', label: 'Địa điểm', count: savedItems.filter(i => i.type === 'destination').length, icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value as any)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-95 whitespace-nowrap cursor-pointer border ${
                selectedType === tab.value
                  ? 'bg-orange-600 text-white border-orange-500 shadow-xl shadow-orange-100'
                  : 'bg-white text-gray-500 border-gray-100 hover:bg-orange-50 shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${selectedType === tab.value ? 'bg-white/20' : 'bg-orange-50 text-orange-400'}`}>
                 {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid/List Container */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-orange-50 shadow-inner">
          <div className="relative inline-block mb-6">
             <div className="absolute inset-0 bg-orange-100 blur-2xl rounded-full opacity-50 animate-pulse" />
             <Heart className="w-16 h-16 text-orange-200 relative z-10 mx-auto" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Trống trải quá...</h3>
          <p className="text-gray-400 max-w-xs mx-auto mb-8 font-medium italic">Hãy để trái tim dẫn lối và lưu lại những khoảnh khắc tuyệt vời</p>
          <button 
            onClick={() => navigate('/destinations')}
            className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 cursor-pointer"
          >
            SƯU TẬP NGAY
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/service/${item.id}`)}
              className="group relative bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-100/30 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />
                {/* Glassmorphism Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-orange-600/60 backdrop-blur-xl border border-white/30 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                  {getTypeLabel(item.type)}
                </div>
                {/* Heart Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl hover:bg-rose-500 group/heart transition-all active:scale-90 cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500 group-hover/heart:text-white group-hover/heart:fill-white transition-colors" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-black text-gray-900">{item.rating}</span>
                  <span className="text-xs text-gray-400 font-bold">({item.reviewCount} lượt lưu)</span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-orange-600 transition-colors">
                  {item.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-tighter mb-4">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                    {item.price ? (
                      <div>
                        <span className="text-2xl font-black text-orange-600">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 ml-1 uppercase">
                          {item.priceUnit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-orange-300 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg">LIÊN HỆ GIÁ</span>
                    )}

                    <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:bg-orange-700 transition-all duration-300">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/service/${item.id}`)}
              className="group bg-white border border-gray-100 rounded-[32px] p-5 hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-500 cursor-pointer box-border"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 sm:hidden">
                     <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                      className="bg-white/90 p-2 rounded-xl"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col pt-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {getTypeLabel(item.type)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400">
                           <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                           {item.rating}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                      className="hidden sm:flex ml-4 p-3.5 text-gray-300 hover:text-white hover:bg-rose-500 border border-gray-100 rounded-2xl transition-all shadow-sm active:scale-90 cursor-pointer"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-6">
                        {item.price ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                              {item.priceUnit}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-orange-300 uppercase tracking-widest bg-orange-50 px-3 py-1 bg-orange-50 rounded-lg">LIÊN HỆ GIÁ</span>
                        )}
                    </div>
                    
                    <button className="flex items-center gap-2 text-xs font-black text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-6 py-3 rounded-2xl transition-all cursor-pointer group/btn border border-orange-100">
                      XEM CHI TIẾT
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                currentPage === i + 1
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-100'
                  : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modern Stats Section */}
      {!loading && savedItems.length > 0 && (
         <div className="mt-20 p-8 bg-gray-50 rounded-[40px] border border-orange-100 flex flex-col md:flex-row items-center justify-around gap-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="text-center relative z-10">
               <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
               <p className="text-3xl font-black text-gray-800">{savedItems.length}</p>
               <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Dịch vụ ưu thích</p>
            </div>
            
            <div className="w-px h-12 bg-orange-200 hidden md:block" />
            
            <div className="text-center relative z-10">
               <p className="text-sm font-medium text-gray-500 mb-2 italic">"Cuộc đời là những chuyến đi..."</p>
               <button 
                  onClick={() => navigate('/destinations')}
                  className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-orange-500/20 active:scale-95 cursor-pointer"
               >
                  KHÁM PHÁ THÊM
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default UserSavedPage;