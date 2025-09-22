import Notification from '#models/notification'
import NotificationRead from '#models/notification_read'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class NotificationService {
  /**
   * Create a global notification for all users
   */
  async createGlobalNotification(data: {
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    metadata?: Record<string, any>
  }) {
    return await Notification.create({
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      is_global: true,
      metadata: data.metadata,
    })
  }

  /**
   * Create a user-specific notification
   */
  async createUserNotification(
    user_id: number,
    data: {
      title: string
      message: string
      type?: 'info' | 'success' | 'warning' | 'error'
      metadata?: Record<string, any>
    }
  ) {
    return await Notification.create({
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      is_global: false,
      user_id,
      metadata: data.metadata,
    })
  }

  /**
   * Get all notifications for a specific user (including global ones)
   */
  async getUserNotifications(
    userId: number,
    options: {
      page?: number
      limit?: number
      includeRead?: boolean
    } = {}
  ) {
    const { page = 1, limit = 20, includeRead = true } = options

    const query = Notification.query()
      .where((builder) => {
        builder.where('is_global', true).orWhere('user_id', userId)
      })
      .preload('read_by_users', (readQuery) => {
        readQuery.where('user_id', userId).select('id')
      })
      .orderBy('created_at', 'desc')

    if (!includeRead) {
      // Only get notifications that haven't been read by this user
      query.whereNotExists((subquery) => {
        subquery
          .from('notification_reads')
          .where('notification_reads.user_id', userId)
          .whereColumn('notification_reads.notification_id', 'notifications.id')
      })
    }

    const notifications = await query.paginate(page, limit)

    // Transform the data to include read status
    const transformedData = notifications.serialize()
    transformedData.data = transformedData.data.map((notification: any) => {
      const isRead = notification.read_by_users.length > 0
      const readAt = notification.read_by_users[0]?.meta?.pivot_read_at || null
      delete notification.read_by_users
      return {
        ...notification,
        is_read: isRead,
        read_at: readAt,
      }
    })

    return transformedData
  }

  /**
   * Mark a notification as read by a user
   */
  async markAsRead(notificationId: number, userId: number) {
    try {
      // Check if already marked as read
      const existingRead = await NotificationRead.query()
        .where('notification_id', notificationId)
        .where('user_id', userId)
        .first()

      if (existingRead) {
        return { success: true, message: 'Already marked as read' }
      }

      // Verify notification exists and user has access
      const notification = await Notification.query()
        .where('id', notificationId)
        .where((builder) => {
          builder.where('is_global', true).orWhere('user_id', userId)
        })
        .first()

      if (!notification) {
        return { success: false, message: 'Notification not found or access denied' }
      }

      await NotificationRead.create({
        notification_id: notificationId,
        user_id: userId,
        read_at: DateTime.now(),
      })

      return { success: true, message: 'Marked as read' }
    } catch (error) {
      console.error(error)
      return { success: false, message: 'Error marking notification as read' }
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: number[], userId: number) {
    const results = await Promise.allSettled(
      notificationIds.map((id) => this.markAsRead(id, userId))
    )

    return {
      success: results.filter((r) => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter((r) => r.status === 'rejected' || !r.value.success).length,
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    const count = await db
      .from('notifications')
      .leftJoin('notification_reads', (join) => {
        join
          .on('notifications.id', 'notification_reads.notification_id')
          .andOnVal('notification_reads.user_id', '=', userId)
      })
      .where((builder) => {
        builder.where('notifications.is_global', true).orWhere('notifications.user_id', userId)
      })
      .whereNull('notification_reads.id')
      .count('* as count')
      .first()

    return Number.parseInt(count.count)
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const deleted = await Notification.query().where('created_at', '<', cutoffDate).delete()

    return { deletedCount: deleted }
  }
}
