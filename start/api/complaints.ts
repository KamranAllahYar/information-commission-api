import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ComplaintsController = () => import('#controllers/complaints_controller')

router.post('/', [ComplaintsController, 'store']).prefix('api/complaints')     // Create complaint
router.put('/:id', [ComplaintsController, 'update']).prefix('api/complaints').use(middleware.auth())  // Update complaint
router.get('/:id', [ComplaintsController, 'show']).prefix('api/complaints').use(middleware.auth())    // Get complaint by ID
router.delete('/:id', [ComplaintsController, 'destroy']).prefix('api/complaints').use(middleware.auth()) // Delete complaint
router.get('/', [ComplaintsController, 'index']).prefix('api/complaints').use(middleware.auth()).use(middleware.is_admin())      // Get all complaints (paginated)

