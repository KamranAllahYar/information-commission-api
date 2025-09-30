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
    router.post('/', [NewsController, 'store'])
    router.put('/:id', [NewsController, 'update'])
    router.delete('/:id', [NewsController, 'destroy'])
  })
  .prefix('api/news')
  .use(middleware.auth())
  .use(middleware.is_admin())
