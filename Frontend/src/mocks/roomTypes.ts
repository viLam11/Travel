// src/mocks/roomTypes.ts
export interface MockRoomType {
    id: number;
    hotelId: number;
    hotelName: string;
    name: string;
    price: number;
    quantity: number;
    available: number;
    description: string;
    images: string[];
    amenities: string[];
}

export const MOCK_ROOM_TYPES: MockRoomType[] = [
    {
        id: 1,
        hotelId: 1,
        hotelName: "Grand Hotel Saigon",
        name: "Deluxe Room",
        price: 1500000,
        quantity: 20,
        available: 15,
        description: "Spacious room with city view, king-size bed, and modern amenities",
        images: [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427"
        ],
        amenities: ["WiFi", "TV", "Mini Bar", "Air Conditioning", "Room Service"]
    },
    {
        id: 2,
        hotelId: 1,
        hotelName: "Grand Hotel Saigon",
        name: "Executive Suite",
        price: 3000000,
        quantity: 10,
        available: 8,
        description: "Luxurious suite with separate living area, premium amenities",
        images: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a"
        ],
        amenities: ["WiFi", "TV", "Mini Bar", "Air Conditioning", "Room Service", "Jacuzzi", "Butler Service"]
    },
    {
        id: 3,
        hotelId: 1,
        hotelName: "Grand Hotel Saigon",
        name: "Standard Room",
        price: 1000000,
        quantity: 30,
        available: 25,
        description: "Comfortable room with essential amenities, perfect for budget travelers",
        images: [
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"
        ],
        amenities: ["WiFi", "TV", "Air Conditioning"]
    },
    {
        id: 4,
        hotelId: 2,
        hotelName: "Hanoi Boutique Hotel",
        name: "Superior Room",
        price: 800000,
        quantity: 15,
        available: 12,
        description: "Elegant room with traditional Vietnamese decor",
        images: [
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39"
        ],
        amenities: ["WiFi", "TV", "Mini Bar", "Air Conditioning"]
    },
    {
        id: 5,
        hotelId: 2,
        hotelName: "Hanoi Boutique Hotel",
        name: "Family Suite",
        price: 1500000,
        quantity: 8,
        available: 6,
        description: "Spacious suite perfect for families, with two bedrooms",
        images: [
            "https://images.unsplash.com/photo-1595576508898-0ad5c879a061"
        ],
        amenities: ["WiFi", "TV", "Mini Bar", "Air Conditioning", "Kitchen", "Washing Machine"]
    },
];

export const getRoomTypesByHotel = (hotelId: number): MockRoomType[] => {
    return MOCK_ROOM_TYPES.filter(room => room.hotelId === hotelId);
};

export const getRoomTypeById = (id: number): MockRoomType | undefined => {
    return MOCK_ROOM_TYPES.find(room => room.id === id);
};
