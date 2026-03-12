// src/components/page/serviceDetail/info/RoomsTab.tsx
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Users, Maximize2, Wifi, Tv, Wine, Sunrise, Bath, Sofa, Sparkles } from 'lucide-react';

interface Room {
    id: string;
    title: string;
    desc: string;
    price: number;
    images: string[];
    capacity: number;
    size: number;
    bedType: string;
    amenities: string[];
}

interface RoomsTabProps {
    service: any;
    onRoomBookNow?: (room: Room) => void; // Callback when user clicks "Đặt phòng ngay"
}

const RoomsTab: React.FC<RoomsTabProps> = ({ service, onRoomBookNow }) => {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Mock room data - will be replaced with API data
    const rooms: Room[] = [
        {
            id: '1',
            title: 'Phòng Deluxe Ocean View',
            desc: '2 người • 35m² • Giường King',
            price: 1500000,
            capacity: 2,
            size: 35,
            bedType: 'Giường King',
            images: [
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
            ],
            amenities: ['WiFi miễn phí', 'TV màn hình phẳng', 'Minibar', 'Ban công view biển']
        },
        {
            id: '2',
            title: 'Phòng Suite',
            desc: '4 người • 60m² • 2 Giường Queen',
            price: 2500000,
            capacity: 4,
            size: 60,
            bedType: '2 Giường Queen',
            images: [
                'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop',
            ],
            amenities: ['WiFi miễn phí', 'TV màn hình phẳng', 'Minibar', 'Phòng khách riêng', 'Bồn tắm']
        },
        {
            id: '3',
            title: 'Phòng Presidential',
            desc: '6 người • 120m² • Phòng khách riêng',
            price: 5000000,
            capacity: 6,
            size: 120,
            bedType: '2 Giường King + Sofa bed',
            images: [
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop',
            ],
            amenities: ['WiFi miễn phí', 'TV màn hình phẳng', 'Minibar', 'Phòng khách riêng', 'Bồn tắm Jacuzzi', 'Ban công lớn']
        },
    ];

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
        setCurrentImageIndex(0);
    };

    const handleCloseModal = () => {
        setSelectedRoom(null);
        setCurrentImageIndex(0);
    };

    const handlePrevImage = () => {
        if (selectedRoom) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedRoom.images.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (selectedRoom) {
            setCurrentImageIndex((prev) =>
                prev === selectedRoom.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handleBookNow = () => {
        if (selectedRoom && onRoomBookNow) {
            handleCloseModal(); // Close room gallery modal
            onRoomBookNow(selectedRoom); // Open booking modal with room info
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Các loại phòng
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Click vào phòng để xem thêm ảnh và thông tin chi tiết
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            onClick={() => handleRoomClick(room)}
                            className="border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            {/* Room Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={room.images[0]}
                                    alt={room.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg text-xs font-semibold text-orange-500">
                                    {room.images.length} ảnh
                                </div>
                            </div>

                            {/* Room Info */}
                            <div className="p-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                            {room.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {room.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500">Từ</p>
                                        <p className="text-lg font-bold text-orange-500">
                                            {(room.price / 1000000).toFixed(1)}M
                                        </p>
                                    </div>
                                    <button className="text-sm text-orange-500 font-medium hover:text-orange-600 cursor-pointer">
                                        Xem chi tiết →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal - Room Details with Image Gallery */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header - Sticky */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedRoom.title}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content - 2 Column Layout */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                                {/* Left Column - Image Gallery (60%) */}
                                <div className="lg:col-span-3 space-y-4">
                                    {/* Main Image */}
                                    <div className="relative">
                                        <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                                            <img
                                                src={selectedRoom.images[currentImageIndex]}
                                                alt={`${selectedRoom.title} - ${currentImageIndex + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Navigation Arrows */}
                                        {selectedRoom.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={handlePrevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                                                </button>
                                                <button
                                                    onClick={handleNextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all cursor-pointer"
                                                >
                                                    <ChevronRight className="w-6 h-6 text-gray-900" />
                                                </button>
                                            </>
                                        )}

                                        {/* Image Counter */}
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                            {currentImageIndex + 1} / {selectedRoom.images.length}
                                        </div>
                                    </div>

                                    {/* Thumbnail Gallery */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedRoom.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentImageIndex === idx
                                                    ? 'border-orange-500 ring-2 ring-orange-200'
                                                    : 'border-gray-200 hover:border-orange-300'
                                                    }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column - Room Info (40%) */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Quick Info Cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                                            <Users className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 mb-1">Sức chứa</p>
                                            <p className="font-bold text-gray-900">{selectedRoom.capacity} người</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                                            <Maximize2 className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 mb-1">Diện tích</p>
                                            <p className="font-bold text-gray-900">{selectedRoom.size}m²</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                                            <svg className="w-5 h-5 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <p className="text-xs text-gray-500 mb-1">Loại giường</p>
                                            <p className="font-bold text-gray-900 text-xs">{selectedRoom.bedType}</p>
                                        </div>
                                    </div>

                                    {/* Amenities with Icons */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4">Tiện nghi phòng</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedRoom.amenities.map((amenity, idx) => {
                                                // Map amenities to Lucide icons
                                                const getAmenityIcon = (name: string) => {
                                                    if (name.includes('WiFi')) return <Wifi className="w-5 h-5 text-orange-500" />;
                                                    if (name.includes('TV')) return <Tv className="w-5 h-5 text-orange-500" />;
                                                    if (name.includes('Minibar')) return <Wine className="w-5 h-5 text-orange-500" />;
                                                    if (name.includes('Ban công') || name.includes('view')) return <Sunrise className="w-5 h-5 text-orange-500" />;
                                                    if (name.includes('Bồn tắm')) return <Bath className="w-5 h-5 text-orange-500" />;
                                                    if (name.includes('Phòng khách')) return <Sofa className="w-5 h-5 text-orange-500" />;
                                                    return <Sparkles className="w-5 h-5 text-orange-500" />;
                                                };

                                                return (
                                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-orange-50 transition-colors">
                                                        {getAmenityIcon(amenity)}
                                                        <span className="text-sm text-gray-700 font-medium">{amenity}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Room Description (if needed) */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-sm text-blue-900">
                                            <span className="font-semibold"> Lưu ý:</span> Giá phòng đã bao gồm thuế và phí dịch vụ. Miễn phí hủy trước 24h.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer - Price and Book Button */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Giá phòng / đêm</p>
                                    <p className="text-3xl font-bold text-orange-500">
                                        {(selectedRoom.price / 1000000).toFixed(1)}M <span className="text-lg text-gray-500">VNĐ</span>
                                    </p>
                                </div>
                                <button
                                    onClick={handleBookNow}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl cursor-pointer"
                                >
                                    Đặt phòng ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsTab;
