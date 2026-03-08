// src/mocks/services.ts
export interface MockService {
    id: number;
    name: string;
    type: 'hotel' | 'tour';
    provider: {
        id: number;
        name: string;
    };
    status: 'active' | 'pending' | 'inactive' | 'draft';
    location: string;
    price: number;
    rating: number;
    totalBookings: number;
    createdAt: string;
    description: string;
    image: string;
}

export const MOCK_SERVICES: MockService[] = [
    // Hotels
    {
        id: 1,
        name: "Grand Hotel Saigon",
        type: "hotel",
        provider: { id: 1, name: "Saigon Hotels Group" },
        status: "active",
        location: "Ho Chi Minh City",
        price: 1500000,
        rating: 4.5,
        totalBookings: 245,
        createdAt: "2024-01-15",
        description: "Luxury 5-star hotel in the heart of Saigon",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    },
    {
        id: 2,
        name: "Hanoi Boutique Hotel",
        type: "hotel",
        provider: { id: 2, name: "Northern Hospitality" },
        status: "active",
        location: "Hanoi",
        price: 800000,
        rating: 4.2,
        totalBookings: 189,
        createdAt: "2024-02-01",
        description: "Charming boutique hotel in Old Quarter",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
    },
    {
        id: 3,
        name: "Da Nang Beach Resort",
        type: "hotel",
        provider: { id: 3, name: "Coastal Resorts Ltd" },
        status: "pending",
        location: "Da Nang",
        price: 2000000,
        rating: 4.8,
        totalBookings: 0,
        createdAt: "2024-02-05",
        description: "Beachfront resort with ocean views",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
    },
    {
        id: 4,
        name: "Hue Imperial Hotel",
        type: "hotel",
        provider: { id: 4, name: "Heritage Hotels" },
        status: "active",
        location: "Hue",
        price: 1200000,
        rating: 4.3,
        totalBookings: 156,
        createdAt: "2024-01-20",
        description: "Historic hotel near Imperial City",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"
    },
    {
        id: 5,
        name: "Nha Trang Seaside Hotel",
        type: "hotel",
        provider: { id: 5, name: "Beach Paradise Group" },
        status: "inactive",
        location: "Nha Trang",
        price: 900000,
        rating: 4.0,
        totalBookings: 98,
        createdAt: "2023-12-10",
        description: "Affordable beachside accommodation",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d"
    },
    {
        id: 11,
        name: "Dalat Dream Hotel",
        type: "hotel",
        provider: { id: 11, name: "Highland Hospitality" },
        status: "draft",
        location: "Da Lat",
        price: 1200000,
        rating: 0,
        totalBookings: 0,
        createdAt: "2024-02-08",
        description: "New luxury hotel in the city of eternal spring - Pending admin approval",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"
    },

    // Tours
    {
        id: 6,
        name: "Ha Long Bay Cruise",
        type: "tour",
        provider: { id: 6, name: "Vietnam Adventures" },
        status: "active",
        location: "Ha Long Bay",
        price: 2500000,
        rating: 4.7,
        totalBookings: 312,
        createdAt: "2024-01-10",
        description: "2-day cruise through stunning limestone karsts",
        image: "https://images.unsplash.com/photo-1528127269322-539801943592"
    },
    {
        id: 7,
        name: "Mekong Delta Discovery",
        type: "tour",
        provider: { id: 7, name: "Delta Tours Co" },
        status: "active",
        location: "Mekong Delta",
        price: 800000,
        rating: 4.4,
        totalBookings: 267,
        createdAt: "2024-01-25",
        description: "Full-day tour of floating markets and villages",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482"
    },
    {
        id: 8,
        name: "Sapa Trekking Adventure",
        type: "tour",
        provider: { id: 8, name: "Mountain Explorers" },
        status: "pending",
        location: "Sapa",
        price: 1500000,
        rating: 4.6,
        totalBookings: 0,
        createdAt: "2024-02-07",
        description: "3-day trek through rice terraces and villages",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482"
    },
    {
        id: 9,
        name: "Hoi An Cooking Class",
        type: "tour",
        provider: { id: 9, name: "Culinary Vietnam" },
        status: "active",
        location: "Hoi An",
        price: 600000,
        rating: 4.9,
        totalBookings: 423,
        createdAt: "2024-01-05",
        description: "Learn to cook authentic Vietnamese dishes",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d"
    },
    {
        id: 10,
        name: "Cu Chi Tunnels Tour",
        type: "tour",
        provider: { id: 10, name: "History Tours VN" },
        status: "active",
        location: "Ho Chi Minh City",
        price: 500000,
        rating: 4.3,
        totalBookings: 198,
        createdAt: "2024-01-18",
        description: "Half-day tour of historic war tunnels",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a"
    },
    {
        id: 11,
        name: "Phong Nha Cave Exploration",
        type: "tour",
        provider: { id: 11, name: "Cave Adventures Ltd" },
        status: "active",
        location: "Phong Nha",
        price: 1800000,
        rating: 4.8,
        totalBookings: 156,
        createdAt: "2024-02-01",
        description: "Explore UNESCO World Heritage caves",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482"
    },
    {
        id: 12,
        name: "Dalat City Tour",
        type: "tour",
        provider: { id: 12, name: "Highland Tours" },
        status: "inactive",
        location: "Dalat",
        price: 700000,
        rating: 4.1,
        totalBookings: 87,
        createdAt: "2023-11-20",
        description: "Full-day tour of the city of eternal spring",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482"
    },
];

// Helper functions
export const getServiceById = (id: number): MockService | undefined => {
    return MOCK_SERVICES.find(service => service.id === id);
};

export const getServicesByType = (type: 'hotel' | 'tour'): MockService[] => {
    return MOCK_SERVICES.filter(service => service.type === type);
};

export const getServicesByStatus = (status: string): MockService[] => {
    return MOCK_SERVICES.filter(service => service.status === status);
};

export const searchServices = (query: string): MockService[] => {
    const lowerQuery = query.toLowerCase();
    return MOCK_SERVICES.filter(service =>
        service.name.toLowerCase().includes(lowerQuery) ||
        service.location.toLowerCase().includes(lowerQuery) ||
        service.provider.name.toLowerCase().includes(lowerQuery)
    );
};
