import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const RequestsController = () => import('#controllers/requests_controller')
router.get('/:id', [RequestsController, 'show']).prefix('api/requests').use(middleware.auth()) // get by ID

router
  .group(() => {
    router.get('/', [RequestsController, 'index']).use(middleware.is_admin()) // get all
    router.post('/', [RequestsController, 'store']) // create
    router.put('/:id', [RequestsController, 'update']) // update
    router.delete('/:id', [RequestsController, 'destroy']) // delete
  })
  .prefix('api/requests')
  .use(middleware.auth())
