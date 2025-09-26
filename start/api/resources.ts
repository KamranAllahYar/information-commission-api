import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ResourceController = () => import('#controllers/resources_controller')

router
  .group(() => {
    router.get('/', [ResourceController, 'index'])
    router.get('/:id', [ResourceController, 'show'])
    router.post('/', [ResourceController, 'store']).use(middleware.is_admin())
    router.put('/:id/status', [ResourceController, 'updateStatus']).use(middleware.is_admin())
    router.put('/:id', [ResourceController, 'update']).use(middleware.is_admin())
    router.delete('/:id', [ResourceController, 'destroy']).use(middleware.is_admin())
  })
  .prefix('api/resources')
  .use(middleware.auth())

router.get('/:id/download', [ResourceController, 'downloadFile']).prefix('api/resources')
