import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AclManager } from '@holoyan/adonisjs-permissions'
import { joinArrayWithCommasAnd } from '#lib/helpers'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    acl: AclManager
  }
}

export default class AclMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { permissions?: string[]; roles?: string[] } = {}
  ) {
    if (options.roles && options.permissions) {
      const hasRoles = await ctx.auth.user!.hasAnyRole(...options.roles)
      const hasPermission = await ctx.auth.user!.hasAnyPermission(options.permissions)
      if (!(hasRoles && hasPermission)) {
        ctx.response.abort(
          {
            message: `You do not have the required roles or permissions to access this resource. Required roles: ${joinArrayWithCommasAnd(options.roles)} and permissions: ${joinArrayWithCommasAnd(options.permissions)}`,
          },
          403
        )
      }
    }

    if (options.roles) {
      const hasRoles = await ctx.auth.user!.hasAnyRole(...options.roles)
      if (!hasRoles) {
        ctx.response.abort(
          { message: `Only ${joinArrayWithCommasAnd(options.roles)} can access this resource` },
          403
        )
      }
    }
    if (options.permissions) {
      const hasPermission = await ctx.auth.user!.hasAnyPermission(options.permissions)
      if (!hasPermission) {
        ctx.response.abort(
          {
            message: `You do not have permission to access this resource. Required permissions: ${joinArrayWithCommasAnd(options.permissions)}`,
          },
          403
        )
      }
    }

    return await next()
  }
}
