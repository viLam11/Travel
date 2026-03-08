// src/types/aiPlanner.types.ts

export interface Activity {
    name: string;
    description: string;
    duration: string;
    estimated_cost: string;
    location: string;
    // Runtime fields (added on FE, not from API)
    id?: string;
}

export interface ItineraryDay {
    day_label: string;
    morning_activities: Activity[];
    afternoon_activities: Activity[];
    evening_activities: Activity[];
}

export interface PlanResponse {
    itinerary: ItineraryDay[];
}

export interface PlanData {
    id: string;
    ownerId: number;
    title: string;
    destination: string;
    days: number;
    itinerary: ItineraryDay[];
    isPublic: boolean;
    isOwner?: boolean; // FE computed or BE returned
    createdAt: string;
    updatedAt: string;
}

export interface PlanRequest {
    place: string;
    numberOfDays: number;
    additionalInformation: string;
}

export type TimeSlot = 'morning_activities' | 'afternoon_activities' | 'evening_activities';

export interface LibraryActivity extends Activity {
    id: string;
}
