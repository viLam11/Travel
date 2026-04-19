import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Map, Share2, Compass, Plus, Loader2, Calendar, Users, 
    MapPin, Briefcase, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiPlannerApi } from '@/api/aiPlannerApi';
import type { PlanOverallResponse } from '@/types/aiPlanner.types';
import Avatar from '@/components/common/avatar/Avatar';
import Footer from '@/components/common/layout/Footer';

const MyPlansPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse the ?tab= params
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') === 'shared' ? 'shared' : 'my_plans';
    
    const [activeTab, setActiveTab] = useState<'my_plans' | 'shared'>(initialTab);
    const [isLoading, setIsLoading] = useState(true);
    const [myPlans, setMyPlans] = useState<PlanOverallResponse[]>([]);
    const [sharedPlans, setSharedPlans] = useState<PlanOverallResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');

    useEffect(() => {
        // Sync state if url changes
        if (queryParams.get('tab') === 'shared') setActiveTab('shared');
    }, [location.search]);

    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                // Tải song song cả 2 list để chuyển tab cho mượt
                const [my, shared] = await Promise.all([
                    aiPlannerApi.getUserPlans(),
                    aiPlannerApi.getSharedPlans()
                ]);
                
                setMyPlans(my);
                setSharedPlans(shared);
            } catch (err) {
                console.error('Failed to fetch plans', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // --- Smart Image Selection System ---
    const DESTINATION_THUMBNAILS: Record<string, string> = {
        'đà nẵng': 'https://images.unsplash.com/photo-1559592442-7e182c940340?q=80&w=800',
        'hà nội': 'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800',
        'hồ chí minh': 'https://images.unsplash.com/photo-1529158017274-924a61fe4178?q=80&w=800',
        'sài gòn': 'https://images.unsplash.com/photo-1529158017274-924a61fe4178?q=80&w=800',
        'đà lạt': 'https://images.unsplash.com/photo-1599354145952-45e3f4e1f760?q=80&w=800',
        'nha trang': 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=800',
        'phú quốc': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800',
        'hội an': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
        'hạ long': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800',
        'phong nha': 'https://images.unsplash.com/photo-1505353547171-d60f54518774?q=80&w=800',
    };

    const getThumbnail = (place: string) => {
        const key = (place || '').toLowerCase().trim();
        
        // 1. Ảnh mặc định cho địa danh quá ngắn hoặc rỗng (VD: "123", "a")
        if (key.length < 2 || /^\d+$/.test(key)) {
            return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800'; // Ảnh máy bay/du lịch chung chung cực đẹp
        }

        // 2. Kiểm tra danh sách hot destinations
        for (const [city, url] of Object.entries(DESTINATION_THUMBNAILS)) {
            if (key.includes(city)) return url;
        }

        // 3. Fallback sang LoremFlickr cho địa danh lạ có nghĩa
        return `https://loremflickr.com/600/400/landscape,travel,${encodeURIComponent(key)}/all`;
    };

    const handleDeletePlan = async (e: React.MouseEvent, planId: string) => {
        e.stopPropagation(); // Ngăn chặn việc click vào card nhảy vào trang edit
        if (!window.confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) return;

        try {
            await aiPlannerApi.deletePlan(planId);
            toast.success('Đã xóa kế hoạch thành công');
            setMyPlans(prev => prev.filter(p => p.planId !== planId));
            setSharedPlans(prev => prev.filter(p => p.planId !== planId));
        } catch (err) {
            toast.error('Xóa thất bại, vui lòng thử lại sau');
        }
    };

    const renderPlanCard = (plan: PlanOverallResponse, isShared: boolean = false) => {
        const thumbnail = getThumbnail(plan.place);

        return (
            <div 
                key={plan.planId}
                onClick={() => navigate(`/ai-planner/${plan.planId}`)}
                className="group cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col"
            >
                {/* Header Có Ảnh Tự Sinh (Auto-gen via Unsplash) */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img 
                        src={thumbnail} 
                        alt={plan.place}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'; 
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-black/10" />
                    
                    <div className="absolute inset-x-5 top-5 flex items-start justify-between z-10">
                        <span className="bg-white/90 text-orange-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            {plan.place}
                        </span>

                        <div className="flex items-center gap-2">
                            {!isShared && (
                                <button 
                                    onClick={(e) => handleDeletePlan(e, plan.planId)}
                                    className="w-8 h-8 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm border border-white/20 group/trash"
                                    title="Xóa kế hoạch"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            {isShared && plan.owner && (
                                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                                    <Avatar name={plan.owner.fullname} size="sm" />
                                    <div className="flex flex-col pr-1 text-gray-800">
                                        <span className="text-[8px] font-extrabold uppercase leading-none text-gray-500">Người tạo</span>
                                        <span className="text-[10px] font-bold leading-tight">{plan.owner.fullname}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute inset-x-5 bottom-5 z-10">
                        <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2 group-hover:text-amber-300 transition-colors">
                            {plan.tripTitle || `Kế hoạch đi ${plan.place}`}
                        </h3>
                    </div>
                </div>

                {/* Body Thông tin */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                    <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-orange-100 absolute -top-5 right-6 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <Calendar className="w-5 h-5" />
                    </div>

                    <div className="pt-1">
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                            {plan.overview || "Bản kế hoạch trống. Hãy nhấn vào để bắt đầu xây dựng lịch trình ngay!"}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-50 p-1.5 rounded-lg text-orange-500">
                                <Users className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600">
                                {isShared ? "Đang hợp tác" : (plan.members?.length > 0 ? `${plan.members.length} thành viên` : 'Chỉ mình tôi')}
                            </span>
                        </div>
                        
                        <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${plan.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {plan.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const currentList = (activeTab === 'my_plans' ? myPlans : sharedPlans)
        .filter(p => 
            p.place.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (p.tripTitle && p.tripTitle.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.place.localeCompare(b.place);
            // Mặc định mock ID có dạng mock-timestamp nên có thể dùng làm sort newest
            return b.planId.localeCompare(a.planId);
        });

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 truncate">
                            Lịch trình của bạn
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            Nơi lưu trữ mọi chuyến đi thanh xuân
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/ai-planner')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo lịch trình mới
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 mb-8 bg-gray-50/80 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('my_plans')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'my_plans' 
                            ? 'bg-white text-orange-500 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Kế hoạch của tôi
                        {myPlans.length > 0 && (
                            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'my_plans' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                                {myPlans.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'shared' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Share2 className="w-4 h-4" />
                        Được chia sẻ
                        {sharedPlans.length > 0 && (
                            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'shared' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                {sharedPlans.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo địa điểm hoặc tiêu đề..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                        />
                        <div className="absolute left-3.5 top-3 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Sắp xếp:</span>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="name">Tên (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* State: Loading */}
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                        <p className="font-medium text-sm">Đang tải lịch trình...</p>
                    </div>
                ) : (
                    <>
                        {/* State: Empty */}
                        {currentList.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 border-dashed py-20 px-6 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                    {searchQuery ? (
                                        <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 4h.01" />
                                        </svg>
                                    ) : (
                                        <Map className="w-10 h-10 text-orange-300" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {searchQuery ? 'Không tìm thấy kết quả' : (activeTab === 'my_plans' ? 'Chưa có kế hoạch nào' : 'Chưa có kế hoạch được chia sẻ')}
                                </h3>
                                <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                                    {searchQuery 
                                        ? `Chúng tôi không tìm thấy kế hoạch nào khớp với từ khóa "${searchQuery}". Thử tìm với từ khóa khác xem sao?` 
                                        : (activeTab === 'my_plans' 
                                            ? 'Bạn chưa tạo lịch trình du lịch nào. Hãy để AI Planner của chúng tôi giúp bạn lên kế hoạch hoàn hảo trong vài giây!'
                                            : 'Chưa có ai mời bạn tham gia chỉnh sửa lịch trình cùng họ. Rủ hội bạn thân lên plan ngay thôi!')}
                                </p>
                                {activeTab === 'my_plans' && !searchQuery && (
                                    <button 
                                        onClick={() => navigate('/ai-planner')}
                                        className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                    >
                                        Khám phá AI Planner
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* State: Data List */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                {currentList.map(plan => renderPlanCard(plan, activeTab === 'shared'))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default MyPlansPage;
