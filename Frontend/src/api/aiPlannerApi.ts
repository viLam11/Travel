import type { PlanRequest, PlanResponse, PlanData, ItineraryDay } from '@/types/aiPlanner.types';
import apiClient from '../services/apiClient';

// ─── Toggle mock vs real API ───────────────────────────────────────────────────
export const USE_MOCK_AI_PLANNER = false; // ← đổi thành false để gọi API thật
// ──────────────────────────────────────────────────────────────────────────────

const MOCK_DELAY_MS = 2000; // Giả lập độ trễ AI
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiPlannerApi = {
    /**
     * Tạo kế hoạch du lịch từ AI
     */
    generatePlan: async (request: PlanRequest): Promise<PlanResponse> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(MOCK_DELAY_MS);
            // Returns mock data if needed, but we focus on real API
            throw new Error("Mock not implemented for refactored version");
        }

        return apiClient.post<PlanResponse>('/api/plan-recommend/generate', request);
    },

    /**
     * Lấy gợi ý địa điểm theo điểm đến
     */
    getPreferences: async (place: string): Promise<unknown[]> => {
        return apiClient.get<unknown[]>('/api/plan-recommend/get-preferences', {
            params: { place }
        });
    },

    // ─── NEW SHARE PLAN APIs ──────────────────────

    savePlan: async (planData: Omit<PlanData, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>): Promise<PlanData> => {
        return apiClient.post<PlanData>('/api/plans', planData);
    },

    getPlan: async (planId: string): Promise<PlanData> => {
        return apiClient.get<PlanData>(`/api/plans/${planId}`);
    },

    updatePlanItinerary: async (planId: string, itinerary: ItineraryDay[]): Promise<void> => {
        return apiClient.patch(`/api/plans/${planId}`, { itinerary });
    },

    toggleShare: async (planId: string, isPublic: boolean): Promise<{ isPublic: boolean; shareUrl?: string }> => {
        return apiClient.patch<{ isPublic: boolean; shareUrl?: string }>(`/api/plans/${planId}/share`, { isPublic });
    }
};
