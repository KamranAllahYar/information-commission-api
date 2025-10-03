import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const DashboardController = () => import('#controllers/dashboard_controller')

router
  .get('/', [DashboardController, 'index'])
  .prefix('api/dashboard')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin'] }))
