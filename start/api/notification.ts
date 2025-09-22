import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NotificationController = () => import('#controllers/notifications_controller')


// User notification routes
router
  .group(() => {
    router.get('/', [NotificationController, 'index'])
    router.get('/unread-count', [NotificationController, 'unreadCount'])
    router.post('/:id/mark-read', [NotificationController, 'markAsRead'])
    router.post('/mark-multiple-read', [NotificationController, 'markMultipleAsRead'])
  })
  .prefix('api/notifications')
  .middleware([middleware.auth()])

// Admin notification routes (create notifications)
router
  .group(() => {
    router.post('/global', [NotificationController, 'createGlobal'])
    router.post('/user', [NotificationController, 'createForUser'])
  })
  .prefix('api/notifications')
  .middleware([
    middleware.auth(),
  ])
