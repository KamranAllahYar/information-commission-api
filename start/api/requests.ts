import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const RequestsController = () => import('#controllers/requests_controller')

router.post('/', [RequestsController, 'store']).prefix('api/requests') // create

router.get('/:id', [RequestsController, 'show']).prefix('api/requests').use(middleware.auth()) // get by ID
router.get('/stats', [RequestsController, 'stats']).prefix('api/requests').use(middleware.auth()) // get stats
router
  .group(() => {
    router
      .get('/', [RequestsController, 'index'])
      .use(middleware.acl({ roles: ['super-admin', 'admin', 'viewer', 'editor'] })) // get all
    router
      .get('/export/csv', [RequestsController, 'exportCsv'])
      .use(middleware.acl({ roles: ['super-admin', 'admin', 'viewer', 'editor'] })) // export CSV
    router
      .put('/:id', [RequestsController, 'update'])
      .use(middleware.acl({ roles: ['super-admin', 'admin'] })) // update
    router
      .delete('/:id', [RequestsController, 'destroy'])
      .use(middleware.acl({ roles: ['super-admin'] })) // delete
  })
  .prefix('api/requests')
  .use(middleware.auth())
