// src/mocks/providers.ts
export interface MockProvider {
    id: number;
    name: string;
    type: 'hotel' | 'tour';
    email: string;
    phone: string;
    address: string;
    totalServices: number;
    status: 'active' | 'inactive';
}

export const MOCK_PROVIDERS: MockProvider[] = [
    {
        id: 1,
        name: "Saigon Hotels Group",
        type: "hotel",
        email: "contact@saigonhotels.vn",
        phone: "028-1234-5678",
        address: "District 1, Ho Chi Minh City",
        totalServices: 3,
        status: "active"
    },
    {
        id: 2,
        name: "Northern Hospitality",
        type: "hotel",
        email: "info@northernhotel.vn",
        phone: "024-9876-5432",
        address: "Hoan Kiem, Hanoi",
        totalServices: 2,
        status: "active"
    },
    {
        id: 3,
        name: "Coastal Resorts Ltd",
        type: "hotel",
        email: "booking@coastalresorts.vn",
        phone: "0236-123-456",
        address: "Son Tra, Da Nang",
        totalServices: 1,
        status: "active"
    },
    {
        id: 4,
        name: "Heritage Hotels",
        type: "hotel",
        email: "reservations@heritagehotels.vn",
        phone: "0234-567-890",
        address: "Hue City Center",
        totalServices: 1,
        status: "active"
    },
    {
        id: 5,
        name: "Beach Paradise Group",
        type: "hotel",
        email: "hello@beachparadise.vn",
        phone: "0258-111-222",
        address: "Nha Trang Beach",
        totalServices: 1,
        status: "inactive"
    },
    {
        id: 6,
        name: "Vietnam Adventures",
        type: "tour",
        email: "tours@vnadventures.vn",
        phone: "024-333-444",
        address: "Ba Dinh, Hanoi",
        totalServices: 2,
        status: "active"
    },
    {
        id: 7,
        name: "Delta Tours Co",
        type: "tour",
        email: "info@deltatours.vn",
        phone: "0292-555-666",
        address: "Can Tho City",
        totalServices: 1,
        status: "active"
    },
    {
        id: 8,
        name: "Mountain Explorers",
        type: "tour",
        email: "trek@mountainexplorers.vn",
        phone: "0214-777-888",
        address: "Lao Cai Province",
        totalServices: 1,
        status: "active"
    },
    {
        id: 9,
        name: "Culinary Vietnam",
        type: "tour",
        email: "cook@culinaryvn.com",
        phone: "0235-999-000",
        address: "Hoi An Ancient Town",
        totalServices: 1,
        status: "active"
    },
    {
        id: 10,
        name: "History Tours VN",
        type: "tour",
        email: "history@toursvn.com",
        phone: "028-222-333",
        address: "District 3, HCMC",
        totalServices: 1,
        status: "active"
    },
    {
        id: 11,
        name: "Cave Adventures Ltd",
        type: "tour",
        email: "caves@adventures.vn",
        phone: "0232-444-555",
        address: "Phong Nha Town",
        totalServices: 1,
        status: "active"
    },
    {
        id: 12,
        name: "Highland Tours",
        type: "tour",
        email: "dalat@highlandtours.vn",
        phone: "0263-666-777",
        address: "Dalat City Center",
        totalServices: 1,
        status: "inactive"
    },
];

export const getProviderById = (id: number): MockProvider | undefined => {
    return MOCK_PROVIDERS.find(provider => provider.id === id);
};

export const getProvidersByType = (type: 'hotel' | 'tour'): MockProvider[] => {
    return MOCK_PROVIDERS.filter(provider => provider.type === type);
};

export const getActiveProviders = (): MockProvider[] => {
    return MOCK_PROVIDERS.filter(provider => provider.status === 'active');
};
