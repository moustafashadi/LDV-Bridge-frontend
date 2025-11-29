// ============================================
// NOTIFICATION SYSTEM TYPES (Task 15)
// ============================================
// These types match the backend DTOs exactly

export enum NotificationType {
  REVIEW_ASSIGNED = 'REVIEW_ASSIGNED',
  REVIEW_APPROVED = 'REVIEW_APPROVED',
  REVIEW_REJECTED = 'REVIEW_REJECTED',
  CHANGE_REQUESTED = 'CHANGE_REQUESTED',
  DEPLOYMENT_SUCCESS = 'DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_MENTION = 'COMMENT_MENTION',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // Additional metadata
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface SendNotificationDto extends CreateNotificationDto {
  channels?: ('email' | 'websocket' | 'in-app')[];
  emailOptions?: {
    cc?: string[];
    bcc?: string[];
    priority?: 'high' | 'normal' | 'low';
    attachments?: Array<{
      filename: string;
      content: string;
      encoding?: string;
    }>;
  };
}

export interface SendNotificationResponseDto {
  success: boolean;
  notification: Notification;
  channelsUsed: ('email' | 'websocket' | 'in-app')[];
  emailSent: boolean;
  websocketSent: boolean;
}

export interface PaginatedNotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface BulkActionResponse {
  success: boolean;
  affected: number;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}
