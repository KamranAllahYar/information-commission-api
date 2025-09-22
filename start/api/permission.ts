import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PermissionsController = () => import('#controllers/permissions_controller')

// Routes for managing roles
router
  .group(function () {
    router.get('/', [PermissionsController, 'getRoles'])
    router.get('/:id', [PermissionsController, 'getRole'])
    router.post('/', [PermissionsController, 'createRole'])
    router.put('/:id', [PermissionsController, 'updateRole'])
    router.delete('/:id', [PermissionsController, 'deleteRole'])
    router.post('/assign-permission', [PermissionsController, 'assignPermissionToRole'])
    router.post('/remove-permission', [PermissionsController, 'removePermissionFromRole'])
  })
  .prefix('api/roles')
  .use(middleware.auth())

// Routes for managing permissions
router
  .group(function () {
    router.get('/', [PermissionsController, 'getPermissions'])
    router.get('/:id', [PermissionsController, 'getPermission'])
    router.post('/', [PermissionsController, 'createPermission'])
    router.put('/:id', [PermissionsController, 'updatePermission'])
    router.delete('/:id', [PermissionsController, 'deletePermission'])
  })
  .prefix('api/permissions')
  .use(middleware.auth())

// Routes for user-role and user-permission management
router
  .group(function () {
    // User roles
    router.get('/roles/:id', [PermissionsController, 'getUserRoles'])
    router.post('/assign-role', [PermissionsController, 'assignRoleToUser'])
    router.post('/remove-role', [PermissionsController, 'removeRoleFromUser'])

    // User permissions
    router.get('/permissions/:id', [PermissionsController, 'getUserPermissions'])
    router.post('/assign-permission', [PermissionsController, 'assignPermissionToUser'])
    router.post('/remove-permission', [PermissionsController, 'removePermissionFromUser'])

    // Check user permissions and roles
    router.post('/check-permission', [PermissionsController, 'checkUserPermission'])
    router.post('/check-role', [PermissionsController, 'checkUserRole'])
  })
  .prefix('api/users')
  .use(middleware.auth())
