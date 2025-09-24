import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const CommissionersController = () => import('#controllers/commissioner_controller')

router
  .group(() => {
    router.get('/', [CommissionersController, 'index'])
    router.post('/', [CommissionersController, 'store'])
    router.get('/:id', [CommissionersController, 'show'])
    router.put('/:id', [CommissionersController, 'update'])
    router.delete('/:id', [CommissionersController, 'destroy'])
  })
  .prefix('api/commissioners')
  .use(middleware.auth())
  .use(middleware.is_admin())
