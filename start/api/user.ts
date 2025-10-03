import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('#controllers/users_controller')

router
  .group(function () {
    router.get('/', [UsersController, 'index'])
    // router.get('/existing-user', [UsersController, 'existingUsers'])
    router.put('/', [UsersController, 'selfProfileUpdate'])
    router.post('/image', [UsersController, 'image'])
    router.post('/image/:id', [UsersController, 'updateImage'])
    router.post('/change-password', [UsersController, 'changePassword'])
  })
  .prefix('api/users')
  .use(middleware.auth())

router
  .group(function () {
    router.get('/:id', [UsersController, 'show'])
    router.put('/:id', [UsersController, 'update'])
    router.delete('/:id', [UsersController, 'destroy'])
  })
  .prefix('api/users')
  .use(middleware.auth({}))

router
  .group(function () {
    router.post('/', [UsersController, 'store'])
  })
  .prefix('api/users')
  .use(middleware.auth())
// .use(
//   middleware.acl({
//     roles: ['admin', 'super-admin'],
//   })
// )

router
  .get('/', [UsersController, 'existingUsers'])
  .prefix('api/existing-users')
  .use(middleware.auth())
