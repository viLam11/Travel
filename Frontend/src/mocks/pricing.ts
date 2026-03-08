// src/mocks/pricing.ts
export interface DayPricing {
    date: string; // YYYY-MM-DD
    price: number;
    isSpecial?: boolean;
    dayOfWeek?: string;
}

export interface Promotion {
    id: number;
    serviceId: number;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    conditions: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export const MOCK_DAY_PRICING: DayPricing[] = [
    // Weekend pricing for tour (serviceId: 6)
    { date: "2024-02-17", price: 1100000, isSpecial: true, dayOfWeek: "Thứ 7" },
    { date: "2024-02-18", price: 1200000, isSpecial: true, dayOfWeek: "Chủ nhật" },
    { date: "2024-02-24", price: 1100000, isSpecial: true, dayOfWeek: "Thứ 7" },
    { date: "2024-02-25", price: 1200000, isSpecial: true, dayOfWeek: "Chủ nhật" },
    { date: "2024-03-02", price: 1100000, isSpecial: true, dayOfWeek: "Thứ 7" },
    { date: "2024-03-03", price: 1200000, isSpecial: true, dayOfWeek: "Chủ nhật" },
];

export const MOCK_PROMOTIONS: Promotion[] = [
    {
        id: 1,
        serviceId: 1,
        name: "Ưu đãi đặt phòng sớm",
        description: "Giảm 15% khi đặt phòng trước 7 ngày",
        discountType: "percentage",
        discountValue: 15,
        conditions: ["Đặt trước 7 ngày", "Thanh toán online"],
        startDate: "2024-02-01",
        endDate: "2024-03-31",
        isActive: true
    },
    {
        id: 2,
        serviceId: 6,
        name: "Mua vé online giảm 5%",
        description: "Giảm ngay 5% khi mua vé qua website",
        discountType: "percentage",
        discountValue: 5,
        conditions: ["Mua vé online", "Áp dụng cho tất cả loại vé"],
        startDate: "2024-02-01",
        endDate: "2024-12-31",
        isActive: true
    },
    {
        id: 3,
        serviceId: 6,
        name: "Ưu đãi nhóm từ 10 người",
        description: "Giảm 100,000đ/vé khi đặt từ 10 vé trở lên",
        discountType: "fixed",
        discountValue: 100000,
        conditions: ["Đặt từ 10 vé trở lên", "Áp dụng cho vé người lớn"],
        startDate: "2024-02-01",
        endDate: "2024-12-31",
        isActive: true
    }
];

export const getPromotionsByService = (serviceId: number): Promotion[] => {
    return MOCK_PROMOTIONS.filter(promo => promo.serviceId === serviceId);
};

export const getDayPricing = (date: string): DayPricing | undefined => {
    return MOCK_DAY_PRICING.find(pricing => pricing.date === date);
};

export const getPricingByDateRange = (startDate: string, endDate: string): DayPricing[] => {
    return MOCK_DAY_PRICING.filter(pricing =>
        pricing.date >= startDate && pricing.date <= endDate
    );
};
