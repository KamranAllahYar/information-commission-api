import { HttpContext } from '@adonisjs/core/http'
import NotificationService from '#services/notification_service'
import { inject } from '@adonisjs/core'
import {
  createGlobalNotificationValidator,
  createUserNotificationValidator,
} from '#validators/notification_validator'

@inject()
export default class NotificationsController {
  constructor(private notificationService: NotificationService) {}

  /**
   * Get user's notifications
   */
  async index({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const page = request.input('page', 1)
    const limit = request.input('page_size', 20)
    const includeRead = request.input('include_read', true)

    const notifications = await this.notificationService.getUserNotifications(user.id, {
      page,
      limit,
      includeRead,
    })

    return response.ok(notifications)
  }

  /**
   * Mark notification as read
   */
  async markAsRead({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const result = await this.notificationService.markAsRead(params.id, user.id)

    if (result.success) {
      return response.ok(result)
    } else {
      return response.badRequest(result)
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const notificationIds = request.input('notification_ids', [])

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return response.badRequest({ message: 'Invalid notification_ids provided' })
    }

    const result = await this.notificationService.markMultipleAsRead(notificationIds, user.id)
    return response.ok(result)
  }

  /**
   * Get unread count
   */
  async unreadCount({ auth, response }: HttpContext) {
    const user = auth.user!
    const count = await this.notificationService.getUnreadCount(user.id)

    return response.ok({ unread_count: count })
  }

  /**
   * Create global notification (Admin only)
   */
  async createGlobal({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createGlobalNotificationValidator)
    const { title, message, type, metadata } = payload

    const notification = await this.notificationService.createGlobalNotification({
      title,
      message,
      type,
      metadata,
    })

    return response.created(notification)
  }

  /**
   * Create user-specific notification (Admin only)
   */
  async createForUser({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserNotificationValidator)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { user_id, title, message, type, metadata } = payload

    const notification = await this.notificationService.createUserNotification(user_id, {
      title,
      message,
      type,
      metadata,
    })

    return response.created(notification)
  }
}
