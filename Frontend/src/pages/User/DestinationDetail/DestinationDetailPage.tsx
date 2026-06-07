import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, SearchX, Ticket, Building2, Loader2 } from 'lucide-react';
import Footer from '../../../components/common/layout/Footer';
import DestinationCard from '../../../components/common/DestinationCard';
import type { Destination } from '../../../components/common/DestinationCard';
import BreadcrumbSection from '../../../components/common/BreadcrumbSection';
import { getDestinationInfo } from '@/constants/regions';
import apiClient from '@/services/apiClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price?: number): string => {
    if (!price) return 'Liên hệ';
    return `${price.toLocaleString('vi-VN')}₫`;
};

const mapServiceToCard = (s: any): Destination => ({
    id: String(s.id),
    title: s.serviceName || s.name || 'Dịch vụ',
    location: s.address || s.province?.fullName || s.province?.name || '',
    priceRange: formatPrice(s.averagePrice),
    rating: s.rating ? String(s.rating) : undefined,
    reviews: s.reviewCount ? String(s.reviewCount) : undefined,
    image: s.thumbnailUrl || s.thumbnail || '',
});

const PAGE_SIZE = 9;

// ─── Component ────────────────────────────────────────────────────────────────

const DestinationDetailPage: React.FC = () => {
    const { region, destination } = useParams<{ region: string; destination: string }>();
    const navigate = useNavigate();

    const [venues, setVenues] = useState<Destination[]>([]);
    const [hotels, setHotels] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllVenues, setShowAllVenues] = useState(false);
    const [showAllHotels, setShowAllHotels] = useState(false);

    const destInfo = destination ? getDestinationInfo(destination) : null;

    const fetchServices = useCallback(async (provinceCode: string) => {
        setLoading(true);
        setError(null);
        try {
            const [venueRes, hotelRes] = await Promise.all([
                apiClient.services.filterByLocation({
                    provinceCode,
                    serviceType: 'TICKET_VENUE',
                    page: 0,
                    size: PAGE_SIZE,
                }),
                apiClient.services.filterByLocation({
                    provinceCode,
                    serviceType: 'HOTEL',
                    page: 0,
                    size: PAGE_SIZE,
                }),
            ]);
            setVenues((venueRes?.services || []).map(mapServiceToCard));
            setHotels((hotelRes?.services || []).map(mapServiceToCard));
        } catch (err) {
            console.error('Failed to load services:', err);
            setError('Không thể tải dữ liệu dịch vụ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!destination || !region) { navigate('/homepage'); return; }
        if (!destInfo || destInfo.region !== region) { navigate('/homepage'); return; }
        fetchServices(destInfo.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [destination, region, destInfo, fetchServices, navigate]);

    const handleBook = (serviceId: string) => {
        navigate(`/services/${serviceId}`);
    };

    // ── Loading ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải dịch vụ...</p>
                </div>
            </div>
        );
    }

    // ── Error / not found ────────────────────────────────────────────────────

    if (error || !destInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin</h2>
                    <p className="text-gray-600 mb-6">{error || `Không có dữ liệu cho "${destination}"`}</p>
                    <button
                        onClick={() => navigate('/homepage')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────

    const displayedVenues = showAllVenues ? venues : venues.slice(0, 6);
    const displayedHotels = showAllHotels ? hotels : hotels.slice(0, 6);
    const totalItems = venues.length + hotels.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadcrumbSection
                auto
                title={`Khám phá ${destInfo.name}`}
                subtitle={`${totalItems} dịch vụ • ${destInfo.regionName}`}
            />

            {/* Hero */}
            <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-6 h-6 text-white/80" />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow">
                            {destInfo.name}
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm font-medium">{destInfo.regionName}</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">

                {/* Summary */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dịch vụ tại {destInfo.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{totalItems} dịch vụ được tìm thấy</p>
                    </div>
                </div>

                {/* TICKET_VENUE section */}
                {venues.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Địa điểm & Vé tham quan
                                    <span className="ml-2 text-base font-normal text-gray-400">({venues.length})</span>
                                </h3>
                            </div>
                            {venues.length > 6 && (
                                <button
                                    onClick={() => setShowAllVenues(v => !v)}
                                    className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
                                >
                                    {showAllVenues ? 'Thu gọn' : 'Xem tất cả'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {displayedVenues.map(item => (
                                <DestinationCard
                                    key={item.id}
                                    destination={item}
                                    onBook={handleBook}
                                    onClick={() => handleBook(item.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* HOTEL section */}
                {hotels.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Khách sạn
                                    <span className="ml-2 text-base font-normal text-gray-400">({hotels.length})</span>
                                </h3>
                            </div>
                            {hotels.length > 6 && (
                                <button
                                    onClick={() => setShowAllHotels(v => !v)}
                                    className="text-orange-500 hover:text-orange-600 font-medium text-sm underline transition-colors"
                                >
                                    {showAllHotels ? 'Thu gọn' : 'Xem tất cả'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {displayedHotels.map(item => (
                                <DestinationCard
                                    key={item.id}
                                    destination={item}
                                    onBook={handleBook}
                                    onClick={() => handleBook(item.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {venues.length === 0 && hotels.length === 0 && (
                    <div className="py-20 text-center">
                        <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Chưa có dịch vụ nào tại {destInfo.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Hãy quay lại sau để xem thêm dịch vụ.</p>
                    </div>
                )}

                <div className="pb-4 text-center">
                    <button
                        onClick={() => navigate('/homepage')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                        ← Quay lại trang chủ
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DestinationDetailPage;
