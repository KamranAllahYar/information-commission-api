import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const contactMessageController = () => import('#controllers/contact_messages_controller')

router
  .group(() => {
    router.post('/', [contactMessageController, 'store'])
  })
  .prefix('api/contact-us')

router
  .group(() => {
    router.get('/', [contactMessageController, 'index'])
    router.get('/:id', [contactMessageController, 'show'])
  })
  .use(middleware.auth())
  .middleware(middleware.acl({ roles: ['super-admin'] }))
  .prefix('api/contact-us')
