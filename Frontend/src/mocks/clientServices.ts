// src/mocks/clientServices.ts

export interface ClientService {
    id: number;
    serviceName: string;
    description: string;
    serviceType: string; // 'HOTEL' | 'TOUR' | 'DESTINATION' | 'RESTAURANT' | 'TICKET_VENUE'
    province: {
        code: string;
        name: string;
        fullName: string;
    };
    address: string;
    averagePrice: number;
    thumbnailUrl: string;
    rating: number;
    reviewCount: number;
    bookingCount: number;

    // Additional fields
    tags?: string[];
    images?: string[];
    openTime?: string;
    closeTime?: string;
    ticketTypes?: {
        id: string;
        title: string;
        description: string;
        price: number;
        inclusions: string[];
    }[];
}

// Mock Data for "Favorite Destinations" (Provinces/Cities acting as destinations)
// Note: In some contexts, a "Destination" is a service, but here we might treat key cities as destinations.
// However, PopularDestinations.tsx fetches serviceType='DESTINATION', so we should include them here.

export const MOCK_CLIENT_SERVICES: ClientService[] = [
    // --- DESTINATIONS (Địa điểm du lịch nổi tiếng) ---
    {
        id: 101,
        serviceName: "Vinpearl Land Nha Trang",
        description: "Thiên đường vui chơi giải trí đẳng cấp quốc tế tọa lạc bên bờ vịnh Nha Trang xinh đẹp.",
        serviceType: "DESTINATION",
        province: { code: "khanh-hoa", name: "Nha Trang", fullName: "Khánh Hòa" },
        address: "Đảo Hòn Tre, Nha Trang, Khánh Hòa",
        averagePrice: 880000,
        thumbnailUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
        rating: 4.8,
        reviewCount: 240,
        bookingCount: 1500,
        openTime: "08:00",
        closeTime: "21:00",
        ticketTypes: [
            {
                id: "t1",
                title: "Vé Người Lớn - Tiêu Chuẩn",
                description: "Vé vào cổng tham quan toàn khu vực, không bao gồm cáp treo.",
                price: 880000,
                inclusions: ["Cổng kiểm soát vé tự động", "Tham quan Vườn Quý Vương", "Quảng trường Thần Thoại"]
            },
            {
                id: "t2",
                title: "Vé Trẻ Em - Tiêu Chuẩn",
                description: "Dành cho trẻ em cao từ 1m - 1m4. Trẻ em dưới 1m miễn phí.",
                price: 660000,
                inclusions: ["Cổng kiểm soát vé tự động", "Khu vui chơi trẻ em", "Công viên nước"]
            },
            {
                id: "t3",
                title: "Combo Vé + Buffet Trưa (Người Lớn)",
                description: "Tiết kiệm hơn khi mua combo bao gồm vé vào cổng và buffet trưa tại nhà hàng.",
                price: 1250000,
                inclusions: ["Vé vào cổng tiêu chuẩn", "Buffet trưa tại nhà hàng Coral", "Nước uống chào mừng"]
            }
        ]
    },
    {
        id: 102,
        serviceName: "Sun World Ba Na Hills",
        description: "Quần thể du lịch nghỉ dưỡng kết hợp vui chơi giải trí đẳng cấp hàng đầu Việt Nam.",
        serviceType: "DESTINATION",
        province: { code: "da-nang", name: "Đà Nẵng", fullName: "Đà Nẵng" },
        address: "Thôn An Sơn, Xã Hòa Ninh, Huyện Hòa Vang, Đà Nẵng",
        averagePrice: 850000,
        thumbnailUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        rating: 4.9,
        reviewCount: 1200,
        bookingCount: 5000,
        openTime: "07:00",
        closeTime: "22:00"
    },
    {
        id: 103,
        serviceName: "Phố cổ Hội An",
        description: "Di sản văn hóa thế giới với những ngôi nhà cổ kính, đèn lồng rực rỡ và ẩm thực đặc sắc.",
        serviceType: "DESTINATION",
        province: { code: "quang-nam", name: "Hội An", fullName: "Quảng Nam" },
        address: "Phường Minh An, Hội An, Quảng Nam",
        averagePrice: 0,
        thumbnailUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        rating: 4.9,
        reviewCount: 680,
        bookingCount: 3000,
        openTime: "00:00",
        closeTime: "23:59"
    },
    {
        id: 104,
        serviceName: "Vịnh Hạ Long",
        description: "Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi lớn nhỏ tạo nên khung cảnh hùng vĩ.",
        serviceType: "DESTINATION",
        province: { code: "quang-ninh", name: "Hạ Long", fullName: "Quảng Ninh" },
        address: "Thành phố Hạ Long, Quảng Ninh",
        averagePrice: 290000,
        thumbnailUrl: "https://images.unsplash.com/photo-1506606401543-2e73709cebb4?w=800",
        rating: 4.7,
        reviewCount: 450,
        bookingCount: 2000,
        openTime: "06:00",
        closeTime: "18:00"
    },
    {
        id: 105,
        serviceName: "Grand World Phú Quốc",
        description: "Thành phố không ngủ với các hoạt động vui chơi, giải trí, mua sắm sầm uất 24/7.",
        serviceType: "DESTINATION",
        province: { code: "kien-giang", name: "Phú Quốc", fullName: "Kiên Giang" },
        address: "Gành Dầu, Phú Quốc, Kiên Giang",
        averagePrice: 0,
        thumbnailUrl: "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800",
        rating: 4.6,
        reviewCount: 320,
        bookingCount: 1200,
        openTime: "00:00",
        closeTime: "23:59"
    },
    {
        id: 106,
        serviceName: "Landmark 81 SkyView",
        description: "Đài quan sát cao nhất Việt Nam, ngắm nhìn toàn cảnh thành phố Hồ Chí Minh từ độ cao 461m.",
        serviceType: "DESTINATION",
        province: { code: "ho-chi-minh", name: "Hồ Chí Minh", fullName: "Hồ Chí Minh" },
        address: "720A Điện Biên Phủ, Bình Thạnh, Hồ Chí Minh",
        averagePrice: 810000,
        thumbnailUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
        rating: 4.8,
        reviewCount: 560,
        bookingCount: 2500,
        openTime: "09:00",
        closeTime: "22:00"
    },

    // --- HOTELS ---
    {
        id: 201,
        serviceName: "Khách sạn Majestic Saigon",
        description: "Khách sạn di sản 5 sao sang trọng bên sông Sài Gòn, mang đậm kiến trúc Pháp cổ điển.",
        serviceType: "HOTEL",
        province: { code: "ho-chi-minh", name: "Hồ Chí Minh", fullName: "Hồ Chí Minh" },
        address: "1 Đồng Khởi, Quận 1, Hồ Chí Minh",
        averagePrice: 2500000,
        thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        rating: 4.7,
        reviewCount: 180,
        bookingCount: 850
    },
    {
        id: 202,
        serviceName: "InterContinental Hanoi Westlake",
        description: "Khách sạn sang trọng nằm trên mặt nước Hồ Tây, mang đến không gian nghỉ dưỡng yên bình giữa lòng thủ đô.",
        serviceType: "HOTEL",
        province: { code: "ha-noi", name: "Hà Nội", fullName: "Hà Nội" },
        address: "5 Từ Hoa, Tây Hồ, Hà Nội",
        averagePrice: 3200000,
        thumbnailUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        rating: 4.9,
        reviewCount: 210,
        bookingCount: 920
    },
    {
        id: 203,
        serviceName: "Vinpearl Resort & Spa Nha Trang Bay",
        description: "Khu nghỉ dưỡng biển đẳng cấp với tầm nhìn tuyệt đẹp ra vịnh Nha Trang.",
        serviceType: "HOTEL",
        province: { code: "khanh-hoa", name: "Nha Trang", fullName: "Khánh Hòa" },
        address: "Đảo Hòn Tre, Nha Trang, Khánh Hòa",
        averagePrice: 2800000,
        thumbnailUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        rating: 4.8,
        reviewCount: 350,
        bookingCount: 1400
    },
    {
        id: 204,
        serviceName: "Melia Vinpearl Hue",
        description: "Khách sạn cao nhất thành phố Huế với tầm nhìn toàn cảnh sông Hương và núi Ngự.",
        serviceType: "HOTEL",
        province: { code: "thua-thien-hue", name: "Huế", fullName: "Thừa Thiên Huế" },
        address: "50A Hùng Vương, Phú Nhuận, Huế",
        averagePrice: 1800000,
        thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        rating: 4.6,
        reviewCount: 120,
        bookingCount: 600
    },
    {
        id: 205,
        serviceName: "Pullman Danang Beach Resort",
        description: "Khu nghỉ dưỡng 5 sao ngay bãi biển Bắc Mỹ An, nơi hội tụ phong cách sống và nghỉ dưỡng đẳng cấp.",
        serviceType: "HOTEL",
        province: { code: "da-nang", name: "Đà Nẵng", fullName: "Đà Nẵng" },
        address: "101 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng",
        averagePrice: 3500000,
        thumbnailUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        rating: 4.8,
        reviewCount: 280,
        bookingCount: 1100
    },
    {
        id: 206,
        serviceName: "JW Marriott Phu Quoc Emerald Bay",
        description: "Kiệt tác kiến trúc của Bill Bensley bên bãi Khem, mang chủ đề trường đại học giả tưởng độc đáo.",
        serviceType: "HOTEL",
        province: { code: "kien-giang", name: "Phú Quốc", fullName: "Kiên Giang" },
        address: "Bãi Khem, An Thới, Phú Quốc",
        averagePrice: 5500000,
        thumbnailUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        rating: 4.9,
        reviewCount: 400,
        bookingCount: 1300
    },

    // --- TOURS ---
    {
        id: 301,
        serviceName: "Tour 4 đảo Phú Quốc",
        description: "Khám phá 4 hòn đảo đẹp nhất phía Nam đảo Phú Quốc: Hòn Mây Rút, Hòn Gầm Ghì, Hòn Móng Tay.",
        serviceType: "TOUR",
        province: { code: "kien-giang", name: "Phú Quốc", fullName: "Kiên Giang" },
        address: "Cảng An Thới, Phú Quốc",
        averagePrice: 950000,
        thumbnailUrl: "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800",
        rating: 4.7,
        reviewCount: 150,
        bookingCount: 800
    },
    {
        id: 302,
        serviceName: "Tour khám phá hang động Phong Nha",
        description: "Trải nghiệm thám hiểm động Phong Nha và động Thiên Đường huyền ảo.",
        serviceType: "TOUR",
        province: { code: "quang-binh", name: "Quảng Bình", fullName: "Quảng Bình" },
        address: "Phong Nha, Bố Trạch, Quảng Bình",
        averagePrice: 1200000,
        thumbnailUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        rating: 4.8,
        reviewCount: 90,
        bookingCount: 400
    }
];
