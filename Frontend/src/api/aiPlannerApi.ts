// src/api/aiPlannerApi.ts
import type { PlanRequest, PlanResponse } from '@/types/aiPlanner.types';
import { MOCK_PLAN_RESPONSE } from '@/mocks/aiPlanner';

// ─── Toggle mock vs real API ───────────────────────────────────────────────────
export const USE_MOCK_AI_PLANNER = true; // ← đổi thành false để gọi API thật
// ──────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const MOCK_DELAY_MS = 2000; // Giả lập độ trễ AI

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiPlannerApi = {
    /**
     * Tạo kế hoạch du lịch từ AI
     * BE: POST /api/plan-recommend/generate
     * Body: { place, numberOfDays, additionalInformation }
     */
    generatePlan: async (request: PlanRequest): Promise<PlanResponse> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(MOCK_DELAY_MS);
            return MOCK_PLAN_RESPONSE;
        }

        const response = await fetch(`${BASE_URL}/api/plan-recommend/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`AI planner error: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Lấy gợi ý địa điểm theo điểm đến
     * BE: GET /api/plan-recommend/get-preferences?place=xxx
     */
    getPreferences: async (place: string): Promise<unknown[]> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return []; // mock → dùng MOCK_LIBRARY_ACTIVITIES
        }

        const response = await fetch(
            `${BASE_URL}/api/plan-recommend/get-preferences?place=${encodeURIComponent(place)}`
        );

        if (!response.ok) throw new Error('Failed to fetch preferences');
        return response.json();
    },

    // ─── NEW SHARE PLAN APIs (Match Contract) ──────────────────────

    savePlan: async (planData: Omit<import('@/types/aiPlanner.types').PlanData, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>): Promise<import('@/types/aiPlanner.types').PlanData> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return {
                id: crypto.randomUUID(),
                ownerId: 1,
                ...planData,
                title: planData.title || `Kế hoạch ${planData.destination} ${planData.days} ngày`,
                isPublic: false,
                isOwner: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(planData),
        });
        if (!response.ok) throw new Error('Failed to save plan');
        return response.json();
    },

    getPlan: async (planId: string): Promise<import('@/types/aiPlanner.types').PlanData> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            // Mock fetching a plan exactly
            return {
                id: planId,
                ownerId: 1,
                title: 'Ví dụ Kế hoạch AI Mock',
                destination: 'Hà Nội',
                days: 3,
                itinerary: MOCK_PLAN_RESPONSE.itinerary,
                isPublic: false,
                isOwner: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/plans/${planId}`, {
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Failed to fetch plan');
        return response.json();
    },

    updatePlanItinerary: async (planId: string, itinerary: import('@/types/aiPlanner.types').ItineraryDay[]): Promise<void> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(300);
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/plans/${planId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ itinerary }),
        });
        if (!response.ok) throw new Error('Failed to update plan');
    },

    toggleShare: async (planId: string, isPublic: boolean): Promise<{ isPublic: boolean; shareUrl?: string }> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(300);
            return { isPublic, shareUrl: `${window.location.origin}/ai-planner/${planId}` };
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/plans/${planId}/share`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ isPublic }),
        });
        if (!response.ok) throw new Error('Failed to toggle share plan');
        return response.json();
    }
};
