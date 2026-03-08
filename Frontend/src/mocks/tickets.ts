// src/mocks/tickets.ts
export interface MockTicket {
    id: number;
    tourId: number;
    tourName: string;
    name: string;
    price: number;
    description: string;
    content: string;
    maxQuantity: number;
    available: number;
}

export const MOCK_TICKETS: MockTicket[] = [
    {
        id: 1,
        tourId: 6,
        tourName: "Ha Long Bay Cruise",
        name: "Adult Ticket",
        price: 2500000,
        description: "Standard ticket for adults (18+)",
        content: "Includes: 2D1N cruise, meals, kayaking, cave exploration",
        maxQuantity: 50,
        available: 38
    },
    {
        id: 2,
        tourId: 6,
        tourName: "Ha Long Bay Cruise",
        name: "Child Ticket",
        price: 1500000,
        description: "Discounted ticket for children (6-17)",
        content: "Includes: 2D1N cruise, meals, kayaking, cave exploration",
        maxQuantity: 30,
        available: 25
    },
    {
        id: 3,
        tourId: 6,
        tourName: "Ha Long Bay Cruise",
        name: "VIP Ticket",
        price: 4000000,
        description: "Premium experience with luxury cabin",
        content: "Includes: 2D1N cruise in VIP cabin, premium meals, private guide, spa",
        maxQuantity: 10,
        available: 7
    },
    {
        id: 4,
        tourId: 7,
        tourName: "Mekong Delta Discovery",
        name: "Standard Ticket",
        price: 800000,
        description: "Full-day tour ticket",
        content: "Includes: Transportation, lunch, boat ride, local guide",
        maxQuantity: 40,
        available: 32
    },
    {
        id: 5,
        tourId: 7,
        tourName: "Mekong Delta Discovery",
        name: "Premium Ticket",
        price: 1200000,
        description: "Enhanced experience with private boat",
        content: "Includes: Private transportation, premium lunch, private boat, expert guide",
        maxQuantity: 15,
        available: 12
    },
    {
        id: 6,
        tourId: 9,
        tourName: "Hoi An Cooking Class",
        name: "Individual Ticket",
        price: 600000,
        description: "Single participant ticket",
        content: "Includes: Market tour, cooking class, lunch, recipe book",
        maxQuantity: 20,
        available: 15
    },
    {
        id: 7,
        tourId: 9,
        tourName: "Hoi An Cooking Class",
        name: "Couple Ticket",
        price: 1000000,
        description: "Discounted ticket for couples",
        content: "Includes: Market tour, cooking class, lunch, recipe book (for 2)",
        maxQuantity: 10,
        available: 8
    },
];

export const getTicketsByTour = (tourId: number): MockTicket[] => {
    return MOCK_TICKETS.filter(ticket => ticket.tourId === tourId);
};

export const getTicketById = (id: number): MockTicket | undefined => {
    return MOCK_TICKETS.find(ticket => ticket.id === id);
};
