// ============================================
// NOTIFICATION SYSTEM API CLIENT (Task 15)
// ============================================

import { apiClient } from "./client";
import {
  Notification,
  SendNotificationDto,
  SendNotificationResponseDto,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  BulkActionResponse,
  NotificationFilters,
  NotificationType,
} from "../types/notifications";

const BASE_PATH = "/notifications";

/**
 * Send a notification
 */
export async function sendNotification(
  data: SendNotificationDto
): Promise<SendNotificationResponseDto> {
  const response = await apiClient.post<SendNotificationResponseDto>(
    `${BASE_PATH}/send`,
    data
  );
  return response.data;
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(
  filters?: NotificationFilters
): Promise<PaginatedNotificationsResponse> {
  const response = await apiClient.get<PaginatedNotificationsResponse>(
    BASE_PATH,
    {
      params: filters,
    }
  );
  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get<UnreadCountResponse>(
    `${BASE_PATH}/unread-count`
  );
  return response.data;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch<Notification>(
    `${BASE_PATH}/${id}/read`
  );
  return response.data;
}

/**
 * Mark a notification as unread
 */
export async function markAsUnread(id: string): Promise<Notification> {
  const response = await apiClient.patch<Notification>(
    `${BASE_PATH}/${id}/unread`
  );
  return response.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<BulkActionResponse> {
  const response = await apiClient.patch<BulkActionResponse>(
    `${BASE_PATH}/mark-all-read`
  );
  return response.data;
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(): Promise<BulkActionResponse> {
  const response = await apiClient.delete<BulkActionResponse>(
    `${BASE_PATH}/clear-all-read`
  );
  return response.data;
}
