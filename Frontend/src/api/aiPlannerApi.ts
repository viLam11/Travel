import type {
    PlanRequest, PlanResponse, PlanData, Activity, ItineraryDay,
    PlanCollabInvitation, PlanCollaboration, PlanOverallResponse,
    CollabStatus, PlanUpdate, PreferenceService, UserInfo, CollaboratorInfo, Permission
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

// Reset mock state only in mock mode so real API mode is not polluted
if (typeof window !== 'undefined' && shouldUseMock(LOCAL_MOCK_OVERRIDE)) {
    localStorage.removeItem('travollo_mock_invitation_status');
    localStorage.removeItem('travollo_mock_invitation_read');
}
// ──────────────────────────────────────────────────────────────────────────────

// ─── Backend → Frontend Data Mappers ─────────────────────────────────────────

// Map backend Activity → frontend Activity
const mapBackendActivity = (a: any): Activity => ({
    id: a.id || `act-${Math.random().toString(36).slice(2, 8)}`,
    name: a.activityTitle || a.serviceName || a.name || 'Hoạt động',
    description: a.description || '',
    duration: a.duration || '1-2 giờ',
    estimated_cost: a.estimatedPrice != null
        ? `${Number(a.estimatedPrice).toLocaleString('vi-VN')}₫`
        : (a.estimated_cost || 'Miễn phí'),
    location: a.location || '',
    timeOfDay: a.timeOfDay,
    activityTitle: a.activityTitle,
    isSystemService: a.isSystemService ?? false,
    serviceUrl: a.serviceUrl || undefined,
    serviceId: a.serviceId || undefined,
    thumbnailUrl: a.thumbnailUrl || undefined,
    serviceType: a.serviceType || undefined,
});

// Map backend DailyItinerary (day + activities[]) → frontend ItineraryDay
const mapBackendDay = (day: any, idx: number): ItineraryDay => {
    const dayLabel = day.day_label || day.dayLabel || `Ngày ${day.day ?? idx + 1}`;

    // Format frontend: day đã có sẵn morning_activities / afternoon_activities / evening_activities
    if (day.morning_activities != null || day.afternoon_activities != null || day.evening_activities != null) {
        return {
            day_label: dayLabel,
            morning_activities: (day.morning_activities || []).map(mapBackendActivity),
            afternoon_activities: (day.afternoon_activities || []).map(mapBackendActivity),
            evening_activities: (day.evening_activities || []).map(mapBackendActivity),
        };
    }

    // Format backend: flat activities[] phân loại bởi timeOfDay
    const acts: any[] = day.activities || day.dailyActivities || [];
    const normalize = (v: string) => (v || '').toLowerCase();
    return {
        day_label: dayLabel,
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
// Handles:
//   - Wrapped format: { plan: { id, place, tripTitle, itinerary, ... }, preferenceServices: [...] }
//   - Flat format: { id, place, tripTitle, itinerary, ... }
const mapBackendPlan = (raw: any): PlanData => {
    // Support both wrapped ({ plan: {...} }) and flat formats
    const p = raw.plan || raw;
    const itinerary = p.itinerary ?? p.dailyItinerary ?? [];
    return {
        id: p.id || raw.id || raw.planId || '',
        ownerId: p.userId || p.ownerId || raw.userId || raw.ownerId || 0,
        title: p.tripTitle || p.title || raw.tripTitle || `Kế hoạch ${p.place || ''}`,
        overview: p.overview || raw.overview || '',
        destination: p.place || p.destination || raw.place || '',
        days: itinerary.length,
        itinerary: itinerary.map(mapBackendDay),
        isPublic: p.visibility === 'PUBLIC' || p.isPublic || raw.isPublic || false,
        isOwner: raw.isOwner ?? p.isOwner ?? true,
        createdAt: p.createdAt || raw.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || raw.updatedAt || new Date().toISOString(),
        shareUrl: p.shareToken || p.shareUrl || raw.shareUrl,
        members: raw.members || p.members,
        preferenceServices: (raw.preferenceServices || p.preferenceServices || []) as PreferenceService[],
    };
};

// Map frontend ItineraryDay[] → backend format for PATCH
const getEstimatedPrice = (a: Activity): number => {
    if (a.cost_amount != null) return a.cost_amount;
    if (!a.estimated_cost || a.estimated_cost === 'Miễn phí' || a.estimated_cost === 'Liên hệ') return 0;
    return parseInt(a.estimated_cost.replace(/[^\d]/g, ''), 10) || 0;
};

const mapFrontendDayToBackend = (day: ItineraryDay, idx: number): any => ({
    day: idx + 1,
    day_label: day.day_label,
    activities: [
        ...day.morning_activities.map(a => ({ ...a, timeOfDay: 'Morning', activityTitle: a.name, estimatedPrice: getEstimatedPrice(a) })),
        ...day.afternoon_activities.map(a => ({ ...a, timeOfDay: 'Afternoon', activityTitle: a.name, estimatedPrice: getEstimatedPrice(a) })),
        ...day.evening_activities.map(a => ({ ...a, timeOfDay: 'Evening', activityTitle: a.name, estimatedPrice: getEstimatedPrice(a) })),
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

const MOCK_SHARED_PLAN_DALAT: PlanData = {
    id: 'mock-shared-plan-dalat',
    ownerId: 99,
    title: 'Đà Lạt săn mây cùng nhóm 12A1',
    overview: 'Lịch trình khám phá các địa điểm hoang sơ ở Đà Lạt, cắm trại săn mây trên đồi Đa Phú.',
    destination: 'Đà Lạt',
    days: 2,
    isPublic: true,
    isOwner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
        { userID: 99, fullname: 'Minh Khánh', email: 'khanh@gmail.com' },
        { userID: 1, fullname: 'Bạn', email: 'me' },
        { userID: 4, fullname: 'Tuấn', email: 't' }
    ],
    itinerary: [
        {
            day_label: 'Ngày 1',
            morning_activities: [
                {
                    id: 'act-dalat-1',
                    name: 'Săn mây đồi Đa Phú',
                    description: 'Thức dậy sớm đón bình minh và săn mây ngập lối đi.',
                    duration: '2 giờ',
                    estimated_cost: 'Miễn phí',
                    location: 'Đồi Đa Phú, Đà Lạt',
                    timeOfDay: 'Morning'
                }
            ],
            afternoon_activities: [
                {
                    id: 'act-dalat-2',
                    name: 'Check-in Quảng trường Lâm Viên',
                    description: 'Chụp ảnh với bông hoa dã quỳ khổng lồ và nụ hoa Atiso.',
                    duration: '1.5 giờ',
                    estimated_cost: 'Miễn phí',
                    location: 'Quảng trường Lâm Viên, Đà Lạt',
                    timeOfDay: 'Afternoon'
                }
            ],
            evening_activities: [
                {
                    id: 'act-dalat-3',
                    name: 'Chợ đêm Đà Lạt',
                    description: 'Thưởng thức sữa đậu nành nóng, bánh tráng nướng và khoai nướng.',
                    duration: '3 giờ',
                    estimated_cost: '100.000₫',
                    location: 'Chợ đêm Đà Lạt',
                    timeOfDay: 'Evening'
                }
            ]
        },
        {
            day_label: 'Ngày 2',
            morning_activities: [
                {
                    id: 'act-dalat-4',
                    name: 'Cà phê Mê Linh',
                    description: 'Thưởng thức cà phê chồn hảo hạng ngắm cảnh đồi chè thơ mộng.',
                    duration: '2.5 giờ',
                    estimated_cost: '80.000₫',
                    location: 'Mê Linh Coffee Garden',
                    timeOfDay: 'Morning'
                }
            ],
            afternoon_activities: [
                {
                    id: 'act-dalat-5',
                    name: 'Thác Datanla',
                    description: 'Trải nghiệm máng trượt xuyên qua cánh rừng thông đại ngàn.',
                    duration: '3 giờ',
                    estimated_cost: '150.000₫',
                    location: 'Thác Datanla, Đà Lạt',
                    timeOfDay: 'Afternoon'
                }
            ],
            evening_activities: []
        }
    ]
};

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
            isOwner: true,
        } as PlanData;
        mockPlansCache[newPlan.id] = newPlan;
        saveToCache(mockPlansCache);
        return newPlan;
    },

    getPlan: async (planId: string): Promise<PlanData> => {
        if (planId === 'mock-shared-plan-dalat') {
            return MOCK_SHARED_PLAN_DALAT;
        }
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
                if (data.destination) {
                    mockPlansCache[planId].destination = data.destination;
                }
                saveToCache(mockPlansCache);
            }
            return;
        }
        // Convert frontend ItineraryDay[] → backend DailyItinerary[] before sending
        const backendItinerary = data.itinerary.map(mapFrontendDayToBackend);
        const requestBody = {
            tripTitle: data.tripTitle,
            overview: data.overview,
            itinerary: backendItinerary,
            place: data.destination,
            budget: data.budget,
        };
        console.log('[updatePlan] request body:', JSON.stringify(requestBody, null, 2));
        return apiClient.patch(`/api/plan-recommend/${planId}`, requestBody);
    },

    toggleShare: async (planId: string, isPublic: boolean): Promise<{ isPublic: boolean; shareToken?: string }> => {
        if (planId.startsWith('mock-')) {
            return { isPublic, shareToken: planId };
        }
        
        // Cập nhật chế độ hiển thị (visibility) qua PATCH /api/plan-recommend/{planID}/visibility
        await apiClient.patch(`/api/plan-recommend/${planId}/visibility`, {
            visibility: isPublic ? 'PUBLIC' : 'PRIVATE'
        });
        
        let shareToken = undefined;
        if (isPublic) {
            try {
                // Lấy link chia sẻ qua POST /api/plan-recommend/{planID}/share-link
                const linkRes = await apiClient.post<Record<string, string>>(`/api/plan-recommend/${planId}/share-link`, {});
                const rawUrl = linkRes?.shareUrl || linkRes?.shareLink || Object.values(linkRes || {})[0];
                if (rawUrl) {
                    const parts = rawUrl.split('/share/');
                    shareToken = parts.length > 1 ? parts[1] : rawUrl.split('/').pop();
                }
            } catch (err) {
                console.error("Failed to generate share link:", err);
            }
        }
        
        return { isPublic, shareToken };
    },

    updateVisibility: async (planId: string, visibility: 'PUBLIC' | 'PRIVATE'): Promise<PlanData> => {
        if (planId.startsWith('mock-')) {
            await sleep(300);
            if (mockPlansCache[planId]) {
                mockPlansCache[planId].isPublic = visibility === 'PUBLIC';
                saveToCache(mockPlansCache);
                return mockPlansCache[planId];
            }
            throw new Error("Mock plan not found");
        }
        const raw = await apiClient.patch<any>(`/api/plan-recommend/${planId}/visibility`, { visibility });
        return mapBackendPlan(raw);
    },

    generateShareLink: async (planId: string): Promise<string> => {
        if (planId.startsWith('mock-')) {
            return `https://travollo.com/share/${planId}`;
        }
        const res = await apiClient.post<Record<string, string>>(`/api/plan-recommend/${planId}/share-link`, {});
        return res?.shareUrl || res?.shareLink || Object.values(res || {})[0] || '';
    },

    getPlanByShareToken: async (shareToken: string): Promise<PlanData> => {
        if (shareToken.startsWith('mock-')) {
            return MOCK_SHARED_PLAN_DALAT;
        }
        const raw = await apiClient.get<any>(`/api/plan-recommend/view/share/${shareToken}`);
        return mapBackendPlan(raw);
    },

    getPublicPlans: async (page = 0, size = 10): Promise<{ content: PlanData[]; totalElements: number; totalPages: number }> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return {
                content: [MOCK_SHARED_PLAN_DALAT],
                totalElements: 1,
                totalPages: 1
            };
        }
        const response = await apiClient.get<any>('/api/plan-recommend/public', {
            params: { page, size }
        });
        const content = Array.isArray(response?.content) ? response.content.map(mapBackendPlan) : [];
        return {
            content,
            totalElements: response?.totalElements || content.length,
            totalPages: response?.totalPages || 1
        };
    },

    getPlanMembers: async (planId: string): Promise<UserInfo[]> => {
        if (planId.startsWith('mock-')) {
            return MOCK_SHARED_PLAN_DALAT.members || [];
        }
        return apiClient.get<UserInfo[]>(`/api/plan-recommend/${planId}/members`);
    },

    getCollaborators: async (planId: string): Promise<CollaboratorInfo[]> => {
        if (planId.startsWith('mock-')) {
            await sleep(300);
            return [
                { collabId: 'collab-1', user: { userID: 'mock-uid-101', fullname: 'Nguyễn Văn A', email: 'vana@gmail.com' }, permission: 'EDIT', status: 'ACCEPTED', invitedAt: new Date().toISOString() },
                { collabId: 'collab-2', user: { userID: 'mock-uid-102', fullname: 'Trần Thị B', email: 'thib@gmail.com' }, permission: 'READ_ONLY', status: 'ACCEPTED', invitedAt: new Date().toISOString() },
                { collabId: 'collab-3', user: { userID: 'mock-uid-103', fullname: 'Lê Văn C', email: 'vanc@gmail.com' }, permission: 'READ_ONLY', status: 'ACCEPTED', invitedAt: new Date().toISOString() },
            ];
        }
        // GET /api/plan-recommend/{planId}/members — returns accepted members of the plan
        const raw = await apiClient.get<any>(`/api/plan-recommend/${planId}/members`);
        const list: any[] = Array.isArray(raw) ? raw : [];
        return list.map(r => ({
            collabId: undefined,
            user: {
                userID: r.userID,                                    // UUID string from backend
                fullname: r.fullname || r.username || 'Người dùng', // fullname can be null
                email: r.email || '',
                avatar: r.avatarUrl || r.avatar,                     // backend field is avatarUrl
            },
            permission: 'READ_ONLY' as Permission,  // not provided by /members endpoint
            status: 'ACCEPTED' as CollabStatus,      // /members only returns accepted members
            invitedAt: r.createdAt,
        }));
    },

    getAllPlans: async (): Promise<PlanData[]> => {
        if (USE_MOCK_AI_PLANNER) {
            return Object.values(mockPlansCache);
        }
        const rawList = await apiClient.get<any[]>('/api/plan-recommend/all');
        return Array.isArray(rawList) ? rawList.map(mapBackendPlan) : [];
    },

    getAllPlansOfUser: async (): Promise<PlanData[]> => {
        if (USE_MOCK_AI_PLANNER) {
            return Object.values(mockPlansCache);
        }
        const rawList = await apiClient.get<any[]>('/api/plan-recommend');
        return Array.isArray(rawList) ? rawList.map(mapBackendPlan) : [];
    },


    clonePlan: async (planId: string): Promise<PlanData> => {
        if (USE_MOCK_AI_PLANNER || planId.startsWith('mock-')) {
            await sleep(500);
            const sourcePlan = planId.startsWith('mock-') ? mockPlansCache[planId] : MOCK_SHARED_PLAN_DALAT;
            const newPlan = {
                ...sourcePlan,
                id: `mock-${Date.now()}`,
                ownerId: 0,
                title: `${sourcePlan.title} (Bản sao)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isOwner: true,
                isPublic: false,
                members: []
            } as PlanData;
            mockPlansCache[newPlan.id] = newPlan;
            saveToCache(mockPlansCache);
            return newPlan;
        }
        const raw = await apiClient.post<any>(`/api/plan-recommend/${planId}/clone`, {});
        return mapBackendPlan(raw);
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
        
        const payload = {
            memberId: invitation.memberId,
            permission: invitation.permission
        };
        
        return apiClient.post(`/api/plan-recommend/${planId}/share`, payload);
    },

    handleInvitation: async (collabId: string, status: CollabStatus): Promise<PlanCollaboration> => {
        if (collabId === 'mock-collab-123' || collabId.startsWith('mock-')) {
            await sleep(500);
            localStorage.setItem('travollo_mock_invitation_status', status);
            localStorage.setItem('travollo_mock_invitation_read', 'true');
            return {
                id: collabId,
                planId: 'mock-shared-plan-dalat',
                ownerId: '99',
                memberId: 'me',
                permission: 'READ_ONLY',
                status: status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as any;
        }
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return { id: collabId, status } as PlanCollaboration;
        }
        // Backend expects raw string enum: "ACCEPTED" | "DENIED" (not an object)
        return apiClient.post(`/api/plan-recommend/collab/${collabId}/handle`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getSharedPlans: async (): Promise<PlanOverallResponse[]> => {
        const isMockAccepted = localStorage.getItem('travollo_mock_invitation_status') === 'ACCEPTED';
        const mockSharedPlan: PlanOverallResponse = {
            planId: 'mock-shared-plan-dalat',
            place: 'Đà Lạt',
            tripTitle: 'Đà Lạt săn mây cùng nhóm 12A1',
            overview: 'Lịch trình khám phá các địa điểm hoang sơ ở Đà Lạt, cắm trại săn mây trên đồi Đa Phú.',
            status: 'ACTIVE',
            collaborationStatus: 'ACCEPTED',
            owner: { userID: 99, fullname: 'Minh Khánh', email: 'khanh@gmail.com' },
            members: [{ userID: 1, fullname: 'Bạn', email: 'me' }, { userID: 4, fullname: 'Tuấn', email: 't' }]
        };

        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            return isMockAccepted ? [mockSharedPlan] : [];
        }

        try {
            const response = await apiClient.get<PlanOverallResponse[]>('/api/plan-recommend/my-shared-plans');
            if (isMockAccepted && Array.isArray(response)) {
                return [mockSharedPlan, ...response];
            }
            return response;
        } catch (error) {
            console.error("Failed to fetch shared plans:", error);
            return isMockAccepted ? [mockSharedPlan] : [];
        }
    },

    revokeAccess: async (planId: string, memberId: string): Promise<string> => {
        if (planId === 'mock-shared-plan-dalat') {
            await sleep(500);
            localStorage.setItem('travollo_mock_invitation_status', 'DENIED');
            return "Success";
        }
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
            const invitationStatus = localStorage.getItem('travollo_mock_invitation_status') || 'PENDING';
            const invitationRead = localStorage.getItem('travollo_mock_invitation_read') === 'true';
            return (invitationStatus === 'PENDING' && !invitationRead) ? 1 : 0;
        }
        try {
            const response = await apiClient.get<number>('/api/notifications/unread-count');
            return response || 0;
        } catch (err) {
            console.error("Failed to fetch unread count", err);
            return 0;
        }
    },

    getUserNotifications: async (page: number = 0, size: number = 10): Promise<any> => {
        if (USE_MOCK_AI_PLANNER) {
            await sleep(500);
            const invitationStatus = localStorage.getItem('travollo_mock_invitation_status') || 'PENDING';
            const invitationRead = localStorage.getItem('travollo_mock_invitation_read') === 'true';
            const mockNotification = invitationStatus === 'PENDING' ? {
                id: 'mock-noti-collab',
                type: 'PLAN_INVITATION',
                title: 'Lời mời cộng tác',
                content: 'vừa mời bạn tham gia chỉnh sửa lịch trình đi Đà Lạt 4N3Đ.',
                createdAt: new Date().toISOString(),
                creatorName: 'Minh Khánh',
                read: invitationRead,
                referenceInvitationID: 'mock-collab-123'
            } : null;
            return {
                content: mockNotification ? [mockNotification] : [],
                totalElements: mockNotification ? 1 : 0
            };
        }

        try {
            const response = await apiClient.get<any>('/api/notifications', { params: { page, size } });
            return response;
        } catch (error) {
            console.error("Failed to fetch user notifications:", error);
            return { content: [], totalElements: 0 };
        }
    },

    markNotificationAsRead: async (id: string): Promise<void> => {
        if (id === 'mock-noti-collab') {
            localStorage.setItem('travollo_mock_invitation_read', 'true');
            return;
        }
        if (USE_MOCK_AI_PLANNER || id.startsWith('mock-')) return;
        return apiClient.put(`/api/notifications/${id}/read`, {});
    },

    markAllNotificationsAsRead: async (): Promise<void> => {
        if (USE_MOCK_AI_PLANNER) return;
        return apiClient.put('/api/notifications/read-all', {});
    }
};
