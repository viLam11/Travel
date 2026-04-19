// src/types/aiPlanner.types.ts

// The structure used by the UI (Existing logic)
export interface Activity {
    id: string;
    name: string;
    description: string;
    duration: string;
    estimated_cost: string;
    location: string;
    // Optional BE fields if they leak into UI
    timeOfDay?: string;
    activityTitle?: string;
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

export interface UserInfo {
    userID: number;
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
    collaborationStatus: CollabStatus;
    owner: UserInfo;
    members: UserInfo[];
}
