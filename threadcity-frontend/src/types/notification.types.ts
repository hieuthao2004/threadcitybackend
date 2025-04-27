export interface Notification {
    id: string;
    type: string;
    senderId: string;
    message: string;
    postId?: string | null;
    createdAt: Date;
}

export interface NotificationData {
    receiverId: string;
    senderId: string;
    type: string;
    postId?: string | null;
    message: string;
}