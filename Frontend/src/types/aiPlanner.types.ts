// src/types/aiPlanner.types.ts

// The structure used by the UI (Existing logic)
export interface Activity {
    id: string;
    name: string;
    description: string;
    duration: string;
    estimated_cost: string;   // display string e.g. "50.000₫"
    cost_amount?: number;     // numeric VND amount for calculations
    location: string;
    // System service fields
    isSystemService?: boolean;
    serviceUrl?: string;
    serviceId?: string;
    thumbnailUrl?: string;
    serviceType?: string;
    // BE compat
    timeOfDay?: string;
    activityTitle?: string;
}

export interface PreferenceService {
    id: string;
    serviceName: string;
    serviceType: string;
    thumbnailUrl?: string;
    url?: string;
    averagePrice?: number;
    rating?: number;
}

export interface ItineraryDay {
    day_label: string;
    morning_activities: Activity[];
    afternoon_activities: Activity[];
    evening_activities: Activity[];
}

export interface PlanData {
    id: string;
    ownerId: string | number;
    title: string;
    overview?: string;
    destination: string;
    days: number;
    itinerary: ItineraryDay[];
    isPublic: boolean;
    isOwner?: boolean;
    createdAt: string;
    updatedAt: string;
    shareUrl?: string;
    members?: UserInfo[];
    preferenceServices?: PreferenceService[];
    budget?: number;
}

export interface PlanChatMessage {
    id: string;
    authorId: string | number;
    authorName: string;
    text: string;
    createdAt: string;
}

export interface PlanRequest {
    place: string;
    numberOfDays: number;
    additionalInformation: string;
}

export interface PlanResponse extends Partial<PlanData> {
    itinerary: ItineraryDay[];
}

export interface PlanUpdate {
    tripTitle: string;
    overview: string;
    itinerary: ItineraryDay[];
    destination?: string;
    budget?: number;
}

export type TimeSlot = 'morning_activities' | 'afternoon_activities' | 'evening_activities';

// ─── COLLABORATION TYPES ──────────────────────

export type Permission = 'EDIT' | 'READ_ONLY';
export type CollabStatus = 'PENDING' | 'ACCEPTED' | 'DENIED';

export interface PlanCollabInvitation {
    memberId: string;
    permission: Permission;
}

export interface PlanCollaboration {
    id: string;
    planId: string;
    ownerId: string;
    memberId: string;
    permission: Permission;
    status: CollabStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CollaboratorInfo {
    collabId?: string;
    user: UserInfo;
    permission: Permission;
    status: CollabStatus;
    invitedAt?: string;
}

export interface UserInfo {
    userID: string | number;
    fullname: string;
    email: string;
    avatar?: string;
}

export interface PlanOverallResponse {
    planId: string;
    place: string;
    tripTitle: string;
    overview: string;
    status: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    shareToken?: string;
    collaborationStatus: CollabStatus;
    owner: UserInfo;
    members: UserInfo[];
}
