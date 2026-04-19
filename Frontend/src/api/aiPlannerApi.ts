import type { 
    PlanRequest, PlanResponse, PlanData, Activity, ItineraryDay,
    PlanCollabInvitation, PlanCollaboration, PlanOverallResponse,
    CollabStatus, PlanUpdate
} from '@/types/aiPlanner.types';
import apiClient from '../services/apiClient';
import { MOCK_PLAN_RESPONSE } from '@/mocks/aiPlanner';
import { shouldUseMock } from '@/config/mockConfig';

// ─── CẤU HÌNH MOCK DỮ LIỆU CỤC BỘ ──────────────────────────────────────────────
// Điền `true` để ép file này dùng mock.
// Điền `false` để ép file này dùng real API.
// Điền `null` để kế thừa từ biến GLOBAL_MOCK_ENABLED trong config.
const LOCAL_MOCK_OVERRIDE: boolean | null = null; 
export const USE_MOCK_AI_PLANNER = shouldUseMock(LOCAL_MOCK_OVERRIDE);
// ──────────────────────────────────────────────────────────────────────────────

// ─── Backend → Frontend Data Mappers ─────────────────────────────────────────

// Map backend Activity → frontend Activity
const mapBackendActivity = (a: any): Activity => ({
    id: a.id || `act-${Math.random().toString(36).slice(2, 8)}`,
    name: a.activityTitle || a.name || 'Hoạt động',
    description: a.description || '',
    duration: a.duration || '1-2 giờ',
    estimated_cost: a.estimatedPrice != null
        ? `${Number(a.estimatedPrice).toLocaleString('vi-VN')}₫`
        : (a.estimated_cost || 'Miễn phí'),
    location: a.location || '',
    timeOfDay: a.timeOfDay,
    activityTitle: a.activityTitle,
});

// Map backend DailyItinerary (day + activities[]) → frontend ItineraryDay
const mapBackendDay = (day: any, idx: number): ItineraryDay => {
    const acts: any[] = day.activities || [];
    // Normalize timeOfDay values (backend may use 'Morning','morning','MORNING', etc.)
    const normalize = (v: string) => (v || '').toLowerCase();
    return {
        day_label: day.day_label || `Ngày ${day.day ?? idx + 1}`,
        morning_activities: acts
            .filter(a => normalize(a.timeOfDay) === 'morning')
            .map(mapBackendActivity),
        afternoon_activities: acts
            .filter(a => normalize(a.timeOfDay) === 'afternoon')
            .map(mapBackendActivity),
        evening_activities: acts
            .filter(a => ['evening', 'night'].includes(normalize(a.timeOfDay)))
            .map(mapBackendActivity),
    };
};

// Map backend TravelPlan → frontend PlanData
const mapBackendPlan = (raw: any): PlanData => ({
    id: raw.id || raw.planId || '',
    ownerId: raw.userId || raw.ownerId || 0,
    title: raw.tripTitle || raw.title || `Kế hoạch ${raw.place || ''}`,
    overview: raw.overview || '',
    destination: raw.place || raw.destination || '',
    days: (raw.itinerary || []).length,
    itinerary: (raw.itinerary || []).map(mapBackendDay),
    isPublic: raw.isPublic ?? false,
    isOwner: raw.isOwner ?? true,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    shareUrl: raw.shareUrl,
    members: raw.members,
});

// Map frontend ItineraryDay[] → backend format for PATCH
const mapFrontendDayToBackend = (day: ItineraryDay, idx: number): any => ({
    day: idx + 1,
    day_label: day.day_label,
    activities: [
        ...day.morning_activities.map(a => ({ ...a, timeOfDay: 'Morning', activityTitle: a.name, estimatedPrice: 0 })),
        ...day.afternoon_activities.map(a => ({ ...a, timeOfDay: 'Afternoon', activityTitle: a.name, estimatedPrice: 0 })),
        ...day.evening_activities.map(a => ({ ...a, timeOfDay: 'Evening', activityTitle: a.name, estimatedPrice: 0 })),
    ],
});

const MOCK_DELAY_MS = 1500; 
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
            // Return mock response based on requested days
            const mockData = { ...MOCK_PLAN_RESPONSE };
            if (request.numberOfDays < mockData.itinerary.length) {
                mockData.itinerary = mockData.itinerary.slice(0, request.numberOfDays);
            }
            return mockData;
        }
        // Backend returns TravelPlan shape — map it to frontend shape
        const raw = await apiClient.post<any>('/api/plan-recommend/generate', request);
        const mapped = mapBackendPlan(raw);
        return { ...mapped, itinerary: mapped.itinerary } as unknown as PlanResponse;
    },

    /**
     * Lấy gợi ý địa điểm theo điểm đến
     */
    getPreferences: async (place: string): Promise<Activity[]> => {
        try {
            const raw = await apiClient.get<any[]>('/api/plan-recommend/get-preferences', {
                params: { place }
            });
            // Nếu backend trả về mảng, ta chạy qua hàm mapBackendActivity đã viết trước đó
            return Array.isArray(raw) ? raw.map(mapBackendActivity) : [];
        } catch (error) {
            console.error("Lỗi khi fetch get-preferences:", error);
            return []; // Fallback trả về mảng rỗng nếu lỗi
        }
    },

    // Mock save because BE might not have a generic save for local edited plans yet
    savePlan: async (planData: Omit<PlanData, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>): Promise<PlanData> => {
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
            if (mockPlansCache[planId]) return mockPlansCache[planId];
            throw new Error("Local mock plan not found in cache");
        }
        // Backend returns TravelPlan shape with flat activities — map to frontend shape
        const raw = await apiClient.get<any>(`/api/plan-recommend/${planId}`);
        return mapBackendPlan(raw);
    },

    updatePlan: async (planId: string, data: PlanUpdate): Promise<void> => {
        if (planId.startsWith('mock-')) {
            if (mockPlansCache[planId]) {
                mockPlansCache[planId].title = data.tripTitle;
                mockPlansCache[planId].itinerary = data.itinerary;
                saveToCache(mockPlansCache);
            }
            return;
        }
        // Convert frontend ItineraryDay[] → backend DailyItinerary[] before sending
        const backendItinerary = data.itinerary.map(mapFrontendDayToBackend);
        return apiClient.patch(`/api/plan-recommend/${planId}`, {
            tripTitle: data.tripTitle,
            overview: data.overview,
            itinerary: backendItinerary,
        });
    },

    toggleShare: async (planId: string, isPublic: boolean): Promise<{ isPublic: boolean; shareUrl?: string }> => {
        if (planId.startsWith('mock-')) {
            return { isPublic, shareUrl: `https://travollo.com/share/${planId}` };
        }
        return apiClient.patch<{ isPublic: boolean; shareUrl?: string }>(`/api/plan-recommend/${planId}`, { isPublic });
    },

    getUserPlans: async (): Promise<PlanOverallResponse[]> => {
        if (USE_MOCK_AI_PLANNER) {
            return Object.values(mockPlansCache).map(p => ({
                planId: p.id,
                place: p.destination,
                tripTitle: p.title,
                overview: "Mock plan summary",
                status: "ACTIVE",
                collaborationStatus: "ACCEPTED" as CollabStatus,
                owner: { userID: 0, fullname: "Bạn", email: "me@travollo.com" },
                members: []
            }));
        }
        return apiClient.get<PlanOverallResponse[]>('/api/plan-recommend/my-plans');
    },

    deletePlan: async (planId: string): Promise<void> => {
        if (planId.startsWith('mock-')) {
            delete mockPlansCache[planId];
            saveToCache(mockPlansCache);
            return;
        }
        return apiClient.delete(`/api/plan-recommend/${planId}`, { params: { planID: planId } });
    },

    // ─── COLLABORATION APIs ──────────────────────

    inviteMember: async (planId: string, invitation: PlanCollabInvitation): Promise<any> => {
        if (USE_MOCK_AI_PLANNER || planId.startsWith('mock-')) {
            await sleep(500);
            return { success: true };
        }
        return apiClient.post(`/api/plan-recommend/${planId}/share`, invitation);
    },

    handleInvitation: async (collabId: string, status: CollabStatus): Promise<PlanCollaboration> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return { id: collabId, status } as PlanCollaboration;
        }
        return apiClient.post(`/api/plan-recommend/collab/${collabId}/handle`, status, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getSharedPlans: async (): Promise<PlanOverallResponse[]> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return [{
                planId: 'mock-shared-1', place: 'Đà Lạt', tripTitle: 'Đà Lạt săn mây cùng nhóm 12A1',
                overview: 'Lịch trình khám phá các địa điểm hoang sơ ở Đà Lạt, cắm trại săn mây trên đồi Đa Phú.',
                status: 'ACTIVE', collaborationStatus: 'ACCEPTED',
                owner: { userID: 99, fullname: 'Minh Khánh', email: 'khanh@gmail.com' },
                members: [{ userID: 1, fullname: 'Bạn', email: 'me' }, { userID: 4, fullname: 'Tuấn', email: 't' }]
            }];
        }
        return apiClient.get<PlanOverallResponse[]>('/api/plan-recommend/my-shared-plans');
    },

    revokeAccess: async (planId: string, memberId: string): Promise<string> => {
        if (USE_MOCK_AI_PLANNER || planId.startsWith('mock-')) {
            await sleep(500);
            return "Success";
        }
        return apiClient.delete(`/api/plan-recommend/${planId}/revoke/${memberId}`);
    },

    // ─── NOTIFICATION APIs ──────────────────────

    getUnreadNotificationsCount: async (): Promise<number> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(300);
            return 1; // Luôn giả lập 1 thông báo chưa đọc
        }
        try {
            const response = await apiClient.get<number>('/api/notifications/unread-count');
            return response;
        } catch (err) {
            console.error("Failed to fetch unread count", err);
            return 0;
        }
    },

    getUserNotifications: async (page: number = 0, size: number = 10): Promise<any> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return {
                content: [
                    {
                        id: 'mock-1',
                        type: 'PLAN_INVITATION',
                        title: 'Lời mời cộng tác',
                        content: 'vừa mời bạn tham gia chỉnh sửa lịch trình đi Đà Lạt 4N3Đ.',
                        createdAt: new Date().toISOString(),
                        creatorName: 'Minh Khánh',
                        read: false
                    }
                ],
                totalElements: 1
            };
        }
        return apiClient.get('/api/notifications', { params: { page, size } });
    },

    markNotificationAsRead: async (id: string): Promise<void> => {
        if (USE_MOCK_AI_PLANNER) return;
        return apiClient.put(`/api/notifications/${id}/read`, {});
    },

    markAllNotificationsAsRead: async (): Promise<void> => {
        if (USE_MOCK_AI_PLANNER) return;
        return apiClient.put('/api/notifications/read-all', {});
    }
};
