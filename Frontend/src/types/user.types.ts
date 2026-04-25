// src/types/user.types.ts

export type UserRole = 'USER' | 'ADMIN' | 'PROVIDER_HOTEL' | 'PROVIDER_VENUE';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'GITHUB';

export interface User {
    userID: string;
    username: string;
    email: string;
    fullname?: string;
    phone?: string;
    avatarUrl?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    city?: string;
    country?: string;
    role: UserRole;
    active?: boolean;
    enabled?: boolean;
    authProvider?: AuthProvider;
}

export interface UserDTO {
    userID: string;
    username: string;
    email: string;
    fullname?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    city?: string;
    country?: string;
    role: UserRole;
    orderList?: any[]; // Link to OrderResponse if needed
}

export interface UserChatDTO {
    userId: string;
    username: string;
    fullname?: string;
    avatarUrl?: string;
}
