import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const SettingsController = () => import('#controllers/settings_controller')

router
  .group(function () {
    router.get('/json', [SettingsController, 'settings'])
  })
  .prefix('api/settings')

router
  .group(function () {
    router.get('/', [SettingsController, 'index'])
    router.post('/', [SettingsController, 'store'])
    router.get('/:id', [SettingsController, 'show'])
    router.get('/key/:key', [SettingsController, 'getByKey'])
    router.put('/:id', [SettingsController, 'update'])
    router.delete('/:id', [SettingsController, 'destroy'])
  })
  .prefix('api/settings')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin', 'admin'] }))
