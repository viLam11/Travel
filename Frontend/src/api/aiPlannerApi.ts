import type { PlanRequest, PlanResponse, PlanData, ItineraryDay, Activity } from '@/types/aiPlanner.types';
import apiClient from '../services/apiClient';

// ─── Toggle mock vs real API ───────────────────────────────────────────────────
export const USE_MOCK_AI_PLANNER = false; // ← đổi thành false để gọi API thật
// ──────────────────────────────────────────────────────────────────────────────

const MOCK_DELAY_MS = 2000; // Giả lập độ trễ AI
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CACHE_KEY = 'travollo_mock_plans';
const getCache = (): Record<string, PlanData> => {
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveToCache = (cache: Record<string, PlanData>) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const mockPlansCache = getCache();

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
    getPreferences: async (place: string): Promise<Activity[]> => {
        return apiClient.get<Activity[]>('/api/plan-recommend/get-preferences', {
            params: { place }
        });
    },

    // ─── NEW SHARE PLAN APIs ──────────────────────

    savePlan: async (planData: Omit<PlanData, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>): Promise<PlanData> => {
        // Return mock data since BE api/plans is missing
        console.warn("Mocking savePlan: BE API is missing");
        const newPlan = {
            ...planData,
            id: `mock-${Date.now()}`,
            ownerId: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOwner: true
        } as PlanData;
        mockPlansCache[newPlan.id] = newPlan;
        saveToCache(mockPlansCache);
        return newPlan;
    },

    getPlan: async (planId: string): Promise<PlanData> => {
        if (planId.startsWith('mock-')) {
            if (mockPlansCache[planId]) {
                return mockPlansCache[planId];
            }
            throw new Error("Local mock plan not found in cache");
        }
        return apiClient.get<PlanData>(`/api/plans/${planId}`);
    },

    updatePlanItinerary: async (planId: string, itinerary: ItineraryDay[]): Promise<void> => {
        if (planId.startsWith('mock-')) {
            if (mockPlansCache[planId]) {
                mockPlansCache[planId].itinerary = itinerary;
                saveToCache(mockPlansCache);
            }
            console.log("Mock updatePlanItinerary success (cached)");
            return;
        }
        return apiClient.patch(`/api/plans/${planId}`, { itinerary });
    },

    toggleShare: async (planId: string, isPublic: boolean): Promise<{ isPublic: boolean; shareUrl?: string }> => {
        if (planId.startsWith('mock-')) {
            return { isPublic, shareUrl: `https://travollo.com/share/${planId}` };
        }
        return apiClient.patch<{ isPublic: boolean; shareUrl?: string }>(`/api/plans/${planId}/share`, { isPublic });
    }
};
