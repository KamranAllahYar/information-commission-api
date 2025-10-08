import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ResourceController = () => import('#controllers/resources_controller')

router
  .group(() => {
    router.get('/', [ResourceController, 'index'])
    router.get('/public', [ResourceController, 'public'])
    router.get('/:id/download', [ResourceController, 'downloadFile'])
    router.get('/:id', [ResourceController, 'show'])
  })
  .prefix('api/resources')
router.get('/stats', [ResourceController, 'stats']).prefix('api/resources').use(middleware.auth()) // get stats
router
  .group(() => {
    router.post('/', [ResourceController, 'store'])
    router.put('/:id/status', [ResourceController, 'updateStatus'])
    router.put('/:id', [ResourceController, 'update'])
  })
  .prefix('api/resources')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin', 'admin'] }))

router
  .delete('/:id', [ResourceController, 'destroy'])
  .prefix('api/resources')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin'] }))
