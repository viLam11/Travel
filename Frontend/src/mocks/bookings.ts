// src/mocks/bookings.ts
export interface MockBooking {
    id: number;
    serviceId: number;
    serviceName: string;
    serviceType: 'hotel' | 'tour';
    userId: number;
    userName: string;
    userEmail: string;
    userPhone: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    checkIn?: string;
    checkOut?: string;
    tourDate?: string;
    guests: number;
    totalPrice: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    createdAt: string;
}

export const MOCK_BOOKINGS: MockBooking[] = [
    {
        id: 1,
        serviceId: 1,
        serviceName: "Grand Hotel Saigon",
        serviceType: "hotel",
        userId: 101,
        userName: "Nguyen Van A",
        userEmail: "nguyenvana@email.com",
        userPhone: "0901234567",
        status: "confirmed",
        checkIn: "2024-02-15",
        checkOut: "2024-02-18",
        guests: 2,
        totalPrice: 4500000,
        paymentStatus: "paid",
        createdAt: "2024-02-01T10:00:00"
    },
    {
        id: 2,
        serviceId: 6,
        serviceName: "Ha Long Bay Cruise",
        serviceType: "tour",
        userId: 102,
        userName: "Tran Thi B",
        userEmail: "tranthib@email.com",
        userPhone: "0902345678",
        status: "completed",
        tourDate: "2024-02-10",
        guests: 4,
        totalPrice: 10000000,
        paymentStatus: "paid",
        createdAt: "2024-01-25T14:30:00"
    },
    {
        id: 3,
        serviceId: 2,
        serviceName: "Hanoi Boutique Hotel",
        serviceType: "hotel",
        userId: 103,
        userName: "Le Van C",
        userEmail: "levanc@email.com",
        userPhone: "0903456789",
        status: "pending",
        checkIn: "2024-02-20",
        checkOut: "2024-02-22",
        guests: 1,
        totalPrice: 1600000,
        paymentStatus: "pending",
        createdAt: "2024-02-07T09:15:00"
    },
    {
        id: 4,
        serviceId: 7,
        serviceName: "Mekong Delta Discovery",
        serviceType: "tour",
        userId: 104,
        userName: "Pham Thi D",
        userEmail: "phamthid@email.com",
        userPhone: "0904567890",
        status: "confirmed",
        tourDate: "2024-02-12",
        guests: 2,
        totalPrice: 1600000,
        paymentStatus: "paid",
        createdAt: "2024-02-05T16:45:00"
    },
    {
        id: 5,
        serviceId: 9,
        serviceName: "Hoi An Cooking Class",
        serviceType: "tour",
        userId: 105,
        userName: "Hoang Van E",
        userEmail: "hoangvane@email.com",
        userPhone: "0905678901",
        status: "completed",
        tourDate: "2024-02-08",
        guests: 1,
        totalPrice: 600000,
        paymentStatus: "paid",
        createdAt: "2024-02-03T11:00:00"
    },
    {
        id: 6,
        serviceId: 4,
        serviceName: "Hue Imperial Hotel",
        serviceType: "hotel",
        userId: 106,
        userName: "Vo Thi F",
        userEmail: "vothif@email.com",
        userPhone: "0906789012",
        status: "cancelled",
        checkIn: "2024-02-14",
        checkOut: "2024-02-16",
        guests: 2,
        totalPrice: 2400000,
        paymentStatus: "refunded",
        createdAt: "2024-02-02T13:20:00"
    },
    {
        id: 7,
        serviceId: 10,
        serviceName: "Cu Chi Tunnels Tour",
        serviceType: "tour",
        userId: 107,
        userName: "Dang Van G",
        userEmail: "dangvang@email.com",
        userPhone: "0907890123",
        status: "confirmed",
        tourDate: "2024-02-11",
        guests: 3,
        totalPrice: 1500000,
        paymentStatus: "paid",
        createdAt: "2024-02-04T10:30:00"
    },
    {
        id: 8,
        serviceId: 1,
        serviceName: "Grand Hotel Saigon",
        serviceType: "hotel",
        userId: 108,
        userName: "Bui Thi H",
        userEmail: "buithih@email.com",
        userPhone: "0908901234",
        status: "pending",
        checkIn: "2024-02-25",
        checkOut: "2024-02-27",
        guests: 2,
        totalPrice: 3000000,
        paymentStatus: "pending",
        createdAt: "2024-02-07T15:00:00"
    },
    {
        id: 9,
        serviceId: 6,
        serviceName: "Ha Long Bay Cruise",
        serviceType: "tour",
        userId: 109,
        userName: "Nguyen Van I",
        userEmail: "nguyenvani@email.com",
        userPhone: "0909012345",
        status: "confirmed",
        tourDate: "2024-02-15",
        guests: 2,
        totalPrice: 5000000,
        paymentStatus: "paid",
        createdAt: "2024-02-08T10:20:00"
    },
    {
        id: 10,
        serviceId: 6,
        serviceName: "Ha Long Bay Cruise",
        serviceType: "tour",
        userId: 110,
        userName: "Le Thi K",
        userEmail: "lethik@email.com",
        userPhone: "0910123456",
        status: "pending",
        tourDate: "2024-02-20",
        guests: 6,
        totalPrice: 15000000,
        paymentStatus: "pending",
        createdAt: "2024-02-09T14:45:00"
    },
];

export const getBookingsByStatus = (status: string): MockBooking[] => {
    return MOCK_BOOKINGS.filter(booking => booking.status === status);
};

export const getBookingsByService = (serviceId: number): MockBooking[] => {
    return MOCK_BOOKINGS.filter(booking => booking.serviceId === serviceId);
};

export const getTotalRevenue = (): number => {
    return MOCK_BOOKINGS
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);
};
