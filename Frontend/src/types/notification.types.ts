// src/types/notification.types.ts

export type NotificationType = 
    | 'PLAN_INVITATION' 
    | 'ORDER_ACCEPTED' 
    | 'ORDER_CREATED' 
    | 'ORDER_CANCELED' 
    | 'NEW_ORDER' 
    | 'REPORT_RESOLVED' 
    | 'SYSTEM';

export interface NotificationResponse {
    id: string;
    type: NotificationType;
    title: string;
    content: string;
    createdAt: string;
    referenceOrderId?: string;
    referenceInvitationID?: string;
    creatorId?: string;
    creatorName?: string;
    creatorAvatar?: string;
    read: boolean;
}

export interface NotiCreateRequest {
    type: NotificationType;
    receiverID: string;
    title: string;
    content: string;
    referenceOrderID?: string;
    referenceInvitationID?: string;
    createdAt?: string;
}
