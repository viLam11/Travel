// src/mocks/serviceDetails.ts
export interface ServiceDetail {
    id: number;
    name: string;
    type: 'hotel' | 'place';
    location: string;
    address: string;
    description: string;
    status: 'active' | 'inactive';
    rating: number;
    reviews: number;
    price: number;
    images: string[];
    attributes: { icon: string; label: string }[];
    policies: {
        checkIn?: string;
        checkOut?: string;
        cancellation: string;
        notes: string;
    };
}

export const MOCK_SERVICE_DETAILS: ServiceDetail[] = [
    {
        id: 1,
        name: "Khách sạn Grand Saigon",
        type: "hotel",
        location: "TP. Hồ Chí Minh",
        address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        description: "Khách sạn 5 sao sang trọng tại trung tâm Sài Gòn với đầy đủ tiện nghi hiện đại. Tọa lạc tại vị trí đắc địa, khách sạn Grand Saigon mang đến trải nghiệm nghỉ dưỡng đẳng cấp quốc tế.",
        status: "active",
        rating: 4.5,
        reviews: 245,
        price: 2500000,
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
            "https://images.unsplash.com/photo-1596436889106-be35e843f974"
        ],
        attributes: [
            { icon: "Wifi", label: "Wifi miễn phí" },
            { icon: "Wind", label: "Điều hòa" },
            { icon: "Tv", label: "TV màn hình phẳng" },
            { icon: "Wine", label: "Minibar" },
            { icon: "Car", label: "Bãi đậu xe" },
            { icon: "Utensils", label: "Nhà hàng" },
            { icon: "Dumbbell", label: "Phòng gym" },
            { icon: "Waves", label: "Hồ bơi" }
        ],
        policies: {
            checkIn: "14:00",
            checkOut: "12:00",
            cancellation: "Hủy miễn phí trước 24h",
            notes: "Vui lòng xuất trình giấy tờ tùy thân có ảnh và thẻ tín dụng khi nhận phòng.\nCác yêu cầu đặc biệt tùy thuộc vào tình trạng phòng thực tế khi nhận phòng."
        }
    },
    {
        id: 6,
        name: "Tour Vịnh Hạ Long",
        type: "place",
        location: "Quảng Ninh",
        address: "Bến Tàu Du Lịch, Bãi Cháy, Hạ Long, Quảng Ninh",
        description: "Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long - Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi. Tour bao gồm du thuyền sang trọng, ăn uống buffet hải sản tươi ngon, và tham quan các hang động nổi tiếng.",
        status: "active",
        rating: 4.8,
        reviews: 189,
        price: 2500000,
        images: [
            "https://images.unsplash.com/photo-1528127269322-539801943592",
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        ],
        attributes: [
            { icon: "Ship", label: "Du thuyền 5 sao" },
            { icon: "Utensils", label: "Buffet hải sản" },
            { icon: "Camera", label: "Điểm chụp ảnh đẹp" },
            { icon: "Waves", label: "Bơi lội, chèo kayak" },
            { icon: "Mountain", label: "Tham quan hang động" },
            { icon: "Users", label: "Hướng dẫn viên chuyên nghiệp" },
            { icon: "Shield", label: "Bảo hiểm du lịch" },
            { icon: "Bus", label: "Đưa đón tận nơi" }
        ],
        policies: {
            cancellation: "Hủy miễn phí trước 48h, hoàn 50% nếu hủy trước 24h",
            notes: "Tour khởi hành lúc 8:00 sáng và kết thúc lúc 17:00 chiều.\nVui lòng mang theo giấy tờ tùy thân, kem chống nắng và thuốc say sóng nếu cần.\nTrẻ em dưới 5 tuổi được miễn phí, từ 5-10 tuổi tính 50% giá vé."
        }
    }
];

export const getServiceDetailById = (id: number): ServiceDetail | undefined => {
    return MOCK_SERVICE_DETAILS.find(service => service.id === id);
};
