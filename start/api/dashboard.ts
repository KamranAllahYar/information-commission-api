import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import DashboardController from '#controllers/dashboard_controller'

router.get('/', [DashboardController, 'index']).prefix('api/dashboard').use(middleware.auth())


