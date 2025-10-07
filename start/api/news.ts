import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NewsController = () => import('#controllers/news_controller')

router
  .group(() => {
    router.get('/public', [NewsController, 'public'])
    router.get('/public/:id', [NewsController, 'publicShow'])
  })
  .prefix('api/news')

router
  .group(() => {
    router.get('/', [NewsController, 'index'])
    router.get('/:id', [NewsController, 'show'])
  })
  .prefix('api/news')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin', 'admin', 'viewer', 'editor'] }))

router
  .group(() => {
    router.post('/', [NewsController, 'store'])
    router.put('/:id', [NewsController, 'update'])
  })
  .prefix('api/news')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin', 'admin'] }))

router
  .delete('/:id', [NewsController, 'destroy'])
  .prefix('api/news')
  .use(middleware.auth())
  .use(middleware.acl({ roles: ['super-admin'] }))
