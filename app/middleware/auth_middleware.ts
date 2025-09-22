import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
      optional?: boolean
    } = {}
  ) {
    const { request, auth } = ctx
    const guards = options.guards || ['api']
    const cookiesList = request.cookiesList()

    // Check if token is provided in cookies
    let hasToken = !!cookiesList.token
    if (hasToken) {
      // Manually set the Authorization header to support bearer token from cookies
      request.request.headers.authorization = `Bearer ${cookiesList.token}`
    }
    hasToken = !!request.request.headers.authorization

    // If optional is true and no token is provided, skip authentication
    if (options.optional && !hasToken) {
      return next()
    }

    // If optional is true and token is provided, attempt authentication
    // If optional is false (default), always require authentication
    if (options.optional && hasToken) {
      try {
        await auth.authenticateUsing(guards, { loginRoute: this.redirectTo })
      } catch (error) {
        // If authentication fails with optional auth, continue without user
        // but remove the invalid token from headers to avoid confusion
        delete request.request.headers.authorization
      }
    } else {
      // Required authentication
      await auth.authenticateUsing(guards, { loginRoute: this.redirectTo })
    }

    return next()
  }
}
