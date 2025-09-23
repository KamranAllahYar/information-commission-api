import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const AdminsController = () => import('#controllers/admins_controller')

router
  .group(() => {
    router.get('/', [AdminsController, 'index'])
    router.post('/', [AdminsController, 'store'])
    router.get('/:id', [AdminsController, 'show'])
    router.put('/:id', [AdminsController, 'update'])
    router.delete('/:id', [AdminsController, 'destroy'])
  })
  .prefix('api/admins')
  .use(middleware.auth())
  .use(middleware.is_admin())
