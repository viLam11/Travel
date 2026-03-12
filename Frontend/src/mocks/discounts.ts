// src/mocks/discounts.ts
// Mirrors backend DiscountResponse shape

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface MockDiscount {
    id: string;
    name: string;
    code: string;
    discountType: DiscountType;
    percentage?: number;          // e.g. 0.2 for 20%
    maxDiscountAmount?: number;   // VND cap for percentage
    fixedPrice?: number;          // VND reduction for fixed type
    startDate: string;
    endDate: string;
    minSpend: number;             // minimum booking amount to apply
}

export const MOCK_DISCOUNTS: MockDiscount[] = [
    {
        id: 'd-001',
        name: 'Khuyến mãi Mùa Hè 2024',
        code: 'SUMMER20',
        discountType: 'PERCENTAGE',
        percentage: 0.20,
        maxDiscountAmount: 500000,
        startDate: '2024-06-01T00:00:00',
        endDate: '2024-08-31T23:59:59',
        minSpend: 1000000,
    },
    {
        id: 'd-002',
        name: 'Flash Sale Cuối Tuần',
        code: 'FLASH200K',
        discountType: 'FIXED',
        fixedPrice: 200000,
        startDate: '2024-03-01T00:00:00',
        endDate: '2024-12-31T23:59:59',
        minSpend: 500000,
    },
    {
        id: 'd-003',
        name: 'Ưu đãi Lễ 30/4',
        code: 'HOLIDAY15',
        discountType: 'PERCENTAGE',
        percentage: 0.15,
        maxDiscountAmount: 300000,
        startDate: '2024-04-25T00:00:00',
        endDate: '2024-05-05T23:59:59',
        minSpend: 800000,
    },
    {
        id: 'd-004',
        name: 'Đặt sớm - Giảm ngay 10%',
        code: 'EARLY10',
        discountType: 'PERCENTAGE',
        percentage: 0.10,
        maxDiscountAmount: 200000,
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-12-31T23:59:59',
        minSpend: 0,
    },
];

/**
 * Get discount label for display (e.g. "-20%" or "-200.000₫")
 */
export function getDiscountLabel(discount: MockDiscount): string {
    if (discount.discountType === 'PERCENTAGE' && discount.percentage) {
        return `-${Math.round(discount.percentage * 100)}%`;
    }
    if (discount.discountType === 'FIXED' && discount.fixedPrice) {
        return `-${discount.fixedPrice.toLocaleString('vi-VN')}₫`;
    }
    return '';
}

/**
 * Compute the discounted price given original price and a discount
 */
export function computeDiscountedPrice(originalPrice: number, discount: MockDiscount): number {
    if (discount.discountType === 'PERCENTAGE' && discount.percentage) {
        const reduction = Math.min(originalPrice * discount.percentage, discount.maxDiscountAmount ?? Infinity);
        return Math.max(0, originalPrice - reduction);
    }
    if (discount.discountType === 'FIXED' && discount.fixedPrice) {
        return Math.max(0, originalPrice - discount.fixedPrice);
    }
    return originalPrice;
}
