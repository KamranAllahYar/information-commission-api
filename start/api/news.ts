import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NewsController = () => import('#controllers/news_controller')

router
  .group(() => {
    router.post('/', [NewsController, 'store']).use(middleware.is_admin())
    router.put('/:id', [NewsController, 'update']).use(middleware.is_admin())
    router.delete('/:id', [NewsController, 'destroy']).use(middleware.is_admin())
    router.get('/', [NewsController, 'index'])
    router.get('/:id', [NewsController, 'show'])
  })
  .prefix('api/news')
  .use(middleware.auth())
