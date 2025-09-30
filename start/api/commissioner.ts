import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const CommissionersController = () => import('#controllers/commissioner_controller')

router
  .group(() => {
    router.get('/', [CommissionersController, 'index'])
    router.get('/:id', [CommissionersController, 'show'])
  })
  .prefix('api/commissioners')

router
  .group(() => {
    router.post('/', [CommissionersController, 'store'])
    router.put('/:id', [CommissionersController, 'update'])
    router.delete('/:id', [CommissionersController, 'destroy'])
  })
  .prefix('api/commissioners')
  .use(middleware.auth())
  .use(middleware.is_admin())
