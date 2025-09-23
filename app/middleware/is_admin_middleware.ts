import type { HttpContext } from '@adonisjs/core/http'

export default class IsAdminMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.user
    if (!user || !user.is_admin) {
      return response.forbidden({ message: 'Admins only' })
    }
    await next()
  }
}


