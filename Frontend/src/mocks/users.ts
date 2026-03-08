// src/mocks/users.ts
export interface MockUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'provider' | 'user';
    providerType?: 'hotel' | 'tour'; // Only for providers
    status: 'active' | 'blocked';
    joinDate: string;
    lastLogin: string;
    avatar: string;
}

export const MOCK_USERS_DATA: MockUser[] = [
    {
        id: 1,
        name: "Admin System",
        email: "admin@test.com",
        role: "admin",
        status: "active",
        joinDate: "2023-01-01",
        lastLogin: "2024-02-07T08:00:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    },
    {
        id: 2,
        name: "Saigon Hotels Group",
        email: "hotel@test.com",
        role: "provider",
        providerType: "hotel",
        status: "active",
        joinDate: "2023-05-15",
        lastLogin: "2024-02-06T14:30:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hotel"
    },
    {
        id: 3,
        name: "Vietnam Tour Operator",
        email: "tour@test.com",
        role: "provider",
        providerType: "tour",
        status: "active",
        joinDate: "2023-06-20",
        lastLogin: "2024-02-07T09:15:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tour"
    },
    {
        id: 4,
        name: "Nguyen Van A",
        email: "customer@test.com",
        role: "user",
        status: "active",
        joinDate: "2024-01-10",
        lastLogin: "2024-02-05T18:45:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
    },
    {
        id: 5,
        name: "Tran Thi B",
        email: "tranthib@email.com",
        role: "user",
        status: "blocked",
        joinDate: "2024-01-15",
        lastLogin: "2024-01-20T10:00:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2"
    },
    {
        id: 6,
        name: "Le Van C",
        email: "levanc@email.com",
        role: "user",
        status: "active",
        joinDate: "2024-02-01",
        lastLogin: "2024-02-07T11:20:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3"
    },
    {
        id: 7,
        name: "Da Nang Resorts",
        email: "danang@hotel.com",
        role: "provider",
        providerType: "hotel",
        status: "active",
        joinDate: "2023-08-05",
        lastLogin: "2024-02-04T16:00:00",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=resort"
    }
];

export const getUsersByRole = (role: string): MockUser[] => {
    return MOCK_USERS_DATA.filter(user => user.role === role);
};
