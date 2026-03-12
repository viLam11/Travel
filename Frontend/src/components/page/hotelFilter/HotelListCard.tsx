// src/components/page/hotelFilter/HotelListCard.tsx
import React, { useState } from 'react';
import { MapPin, Star, Wifi, Waves, Dumbbell, Sparkles, Car, UtensilsCrossed, Palmtree, Heart, Tag } from 'lucide-react';
import type { MockDiscount } from '@/mocks/discounts';
import { getDiscountLabel, computeDiscountedPrice } from '@/mocks/discounts';

export interface HotelListItem {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    price: number;         // original price per night (VND)
    stars: number;         // hotel category stars (1-5)
    image: string;
    amenities: string[];
    discount?: MockDiscount;
}

interface HotelListCardProps {
    hotel: HotelListItem;
    onClick?: () => void;
}

const amenitiesMap: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    wifi:       { label: 'WiFi',     icon: Wifi },
    pool:       { label: 'Hồ bơi',  icon: Waves },
    gym:        { label: 'Gym',      icon: Dumbbell },
    spa:        { label: 'Spa',      icon: Sparkles },
    parking:    { label: 'Đỗ xe',   icon: Car },
    restaurant: { label: 'Nhà hàng',icon: UtensilsCrossed },
    beach:      { label: 'Bãi biển',icon: Palmtree },
};

const HotelListCard: React.FC<HotelListCardProps> = ({ hotel, onClick }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const { discount } = hotel;
    const discountLabel = discount ? getDiscountLabel(discount) : null;
    const discountedPrice = discount ? computeDiscountedPrice(hotel.price, discount) : hotel.price;
    const hasDiscount = !!discount && discountedPrice < hotel.price;

    const formatPrice = (p: number) => p.toLocaleString('vi-VN');

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
        >
            <div className="flex flex-col sm:flex-row">

                {/* ── Image ── */}
                <div className="relative sm:w-64 h-52 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-200">
                    <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {hasDiscount && discountLabel && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md z-10">
                            <Tag className="w-3 h-3" />
                            {discountLabel}
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Favorite */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFavorite(p => !p); }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                    >
                        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-orange-500 text-orange-500' : 'text-orange-500'}`} />
                    </button>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div>
                        {/* Name + Rating score */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                                {hotel.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
                                <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                                <span className="text-sm font-bold text-orange-700">{hotel.rating}</span>
                            </div>
                        </div>

                        {/* Hotel stars */}
                        <div className="flex items-center gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < hotel.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{hotel.stars} sao</span>
                        </div>

                        {/* Location */}
                        <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                            <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                            <span className="line-clamp-1">{hotel.location}</span>
                        </p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-1.5">
                            {hotel.amenities.slice(0, 5).map(key => {
                                const info = amenitiesMap[key];
                                if (!info) return null;
                                const Icon = info.icon;
                                return (
                                    <span key={key} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 hover:bg-orange-50 px-2.5 py-1 rounded-full transition-colors">
                                        <Icon className="w-3 h-3" />
                                        {info.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Price + Book ── */}
                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">{hotel.reviews.toLocaleString('vi-VN')} đánh giá</p>

                        <div className="flex items-end gap-3">
                            <div className="text-right">
                                {hasDiscount && (
                                    <p className="text-xs text-gray-400 line-through">
                                        {formatPrice(hotel.price)}₫
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">Từ</p>
                                <p className={`text-xl font-extrabold leading-tight ${hasDiscount ? 'text-red-500' : 'text-orange-500'}`}>
                                    {formatPrice(discountedPrice)}
                                    <span className="text-xs font-normal text-gray-400 ml-1">/đêm</span>
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                                Đặt ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelListCard;
