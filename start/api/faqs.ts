import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const FaqsControllers = () => import('#controllers/faqs_controllers')

router
  .group(() => {
    router.get('/public', [FaqsControllers, 'public'])
    router.get('/public/:id', [FaqsControllers, 'publicShow'])
  })
  .prefix('api/faqs')

router
  .group(() => {
    router.get('/', [FaqsControllers, 'index'])
    router.get('/:id', [FaqsControllers, 'show'])
  })
  .prefix('api/faqs')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin', 'admin', 'editor', 'viewer'] }))

router
  .group(() => {
    router.post('/', [FaqsControllers, 'store'])
    router.put('/:id', [FaqsControllers, 'update'])
  })
  .prefix('api/faqs')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin', 'admin', 'editor'] }))

router
  .group(() => {
    router.delete('/:id', [FaqsControllers, 'destroy'])
  })
  .prefix('api/faqs')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin'] }))
