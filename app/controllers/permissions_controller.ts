import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { Acl, Permission, Role, ModelPermission } from '@holoyan/adonisjs-permissions'
import { HttpStatusMessages } from '#enums/http_status_messages'
import slugify from 'slugify'

export default class PermissionsController {
  /**
   * Get all roles
   */
  async getRoles({ request }: HttpContext) {
    const search = request.input('search')
    const query = Role.query()
    if (search) {
      query.where('title', 'LIKE', `%${search}%`)
    }
    const whereQuery = request.input('where')

    if (whereQuery) {
      try {
        const whereConditions = JSON.parse(whereQuery)
        if (whereConditions && typeof whereConditions === 'object') {
          Object.entries(whereConditions).forEach(([key, value]) => {
            if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              query.where(key, value)
            }
          })
        }
      } catch (error) {
        throw new Error('Invalid where query format')
        throw new Error('Invalid where query format')
      }
    }

    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  /**
   * Get a specific role
   */
  async getRole({ request, response }: HttpContext) {
    const role = await Role.query().where('id', request.param('id')).first()
    if (!role) {
      return response.notFound({
        message: `Role not found`,
      })
    }
    const permissions = await Acl.model(role).permissions()
    return {
      ...role.toJSON(),
      permissions,
    }
  }

  /**
   * Create a new role
   */
  async createRole({ request, response }: HttpContext) {
    const { title, scope = 'default' } = request.body()

    // Validate required fields
    if (!title) {
      return response.badRequest({
        message: 'Title is required',
      })
    }

    // @ts-ignore
    let baseSlug = slugify(title, {
      lower: true, // Convert to lowercase
      strict: true, // Remove special characters
      locale: 'en', // Use English locale
    })

    let finalSlug = baseSlug
    let counter = 1

    // Check for existing slugs and increment if necessary
    while (await Role.query().where('slug', finalSlug).first()) {
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Check if role with same title already exists
    const existingRole = await Role.query().where('title', title).first()
    if (existingRole) {
      return response.conflict({
        status_code: HttpStatusMessages.CONFLICT,
        message: `Role with title "${title}" already exists`,
      })
    }

    const role = new Role()
    role.title = title
    role.slug = finalSlug
    role.scope = scope
    await role.save()

    return {
      status_code: 201,
      message: 'Role created successfully',
      data: role,
    }
  }

  /**
   * Update a role
   */
  async updateRole({ request, response }: HttpContext) {
    const role = await Role.find(request.param('id'))
    if (!role) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Role not found`,
      })
    }

    const { title, scope } = request.body()

    if (title) role.title = title
    if (scope) role.scope = scope

    await role.save()

    return {
      status_code: HttpStatusMessages.OK,
      message: 'Role updated successfully',
      data: role,
    }
  }

  /**
   * Delete a role
   */
  async deleteRole({ request, response }: HttpContext) {
    const role = await Role.find(request.param('id'))
    if (!role) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Role not found`,
      })
    }

    await role.delete()

    return {
      message: 'Role deleted successfully',
    }
  }

  /**
   * Get all permissions
   */
  async getPermissions({ request }: HttpContext) {
    const query = Permission.query()
    const whereQuery = request.input('where')

    if (whereQuery) {
      try {
        const whereConditions = JSON.parse(whereQuery)
        if (whereConditions && typeof whereConditions === 'object') {
          Object.entries(whereConditions).forEach(([key, value]) => {
            if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              query.where(key, value)
            }
          })
        }
      } catch (error) {
        throw new Error('Invalid where query format')
        throw new Error('Invalid where query format')
      }
    }

    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  /**
   * Get a specific permission
   */
  async getPermission({ request, response }: HttpContext) {
    const permission = await Permission.find(request.param('id'))
    if (!permission) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Permission not found`,
      })
    }
    return permission
  }

  /**
   * Create a new permission
   */
  async createPermission({ request, response }: HttpContext) {
    const { title, scope = 'default' } = request.body()

    // @ts-ignore
    let baseSlug = slugify(title, {
      lower: true, // Convert to lowercase
      strict: true, // Remove special characters
      locale: 'en', // Use English locale
    })

    let finalSlug = baseSlug
    let counter = 1

    // Check for existing slugs and increment if necessary
    while (await Permission.query().where('slug', finalSlug).first()) {
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Check if permission already exists
    const existingPermission = await Permission.query().where('slug', finalSlug).first()
    if (existingPermission) {
      return response.conflict({
        status_code: HttpStatusMessages.CONFLICT,
        message: `Permission with slug "${finalSlug}" already exists`,
      })
    }

    const permission = new Permission()
    permission.slug = finalSlug
    permission.title = title
    permission.scope = scope
    await permission.save()

    return {
      message: 'Permission created successfully',
      data: permission,
    }
  }

  /**
   * Update a permission
   */
  async updatePermission({ request, response }: HttpContext) {
    const permission = await Permission.find(request.param('id'))
    if (!permission) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Permission not found`,
      })
    }

    const { title, scope } = request.body()

    if (title) permission.title = title
    if (scope) permission.scope = scope

    await permission.save()

    return {
      message: 'Permission updated successfully',
      data: permission,
    }
  }

  /**
   * Delete a permission
   */
  async deletePermission({ request, response }: HttpContext) {
    const permission = await Permission.find(request.param('id'))
    if (!permission) {
      return response.notFound({
        message: `Permission not found`,
      })
    }

    await permission.delete()

    return {
      message: 'Permission deleted successfully',
    }
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser({ request, response }: HttpContext) {
    const { userId, roleId } = request.body()

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    const role = await Role.find(roleId)
    if (!role) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Role not found`,
      })
    }

    await user.assignRole(role.slug)

    return {
      message: 'Role assigned to user successfully',
    }
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser({ request, response }: HttpContext) {
    const { userId, roleId } = request.body()

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    const role = await Role.find(roleId)
    if (!role) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Role not found`,
      })
    }

    await user.revokeRole(role.slug)

    return {
      message: 'Role removed from user successfully',
    }
  }

  /**
   * Assign a permission to a role
   */
  async assignPermissionToRole({ request, response }: HttpContext) {
    const { roleId, permissionId } = request.body()

    try {
      const role = await Role.find(roleId)

      if (!role) {
        return response.notFound({
          status_code: HttpStatusMessages.NOT_FOUND,
          message: `Role not found`,
        })
      }

      const permission = await Permission.find(permissionId)
      if (!permission) {
        return response.notFound({
          status_code: HttpStatusMessages.NOT_FOUND,
          message: `Permission not found`,
        })
      }

      await Acl.role(role).allow(permission.slug)

      return {
        message: 'Permission assigned to role successfully',
      }
    } catch (e) {
    }
  }
  /**
   * Remove a permission to a role
   */
  async removePermissionFromRole({ request, response }: HttpContext) {
    const { roleId, permissionId } = request.body()

    const role = await Role.find(roleId)
    if (!role) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Role not found`,
      })
    }

    const permission = await Permission.find(permissionId)
    if (!permission) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Permission not found`,
      })
    }

    // from ModelPermission check if the permission is assigned to the role
    const assignedPermission = await ModelPermission.query()
      .where('model_type', 'roles')
      .where('model_id', roleId)
      .where('permission_id', permissionId)
      .first()

    if (!assignedPermission) {
      return response.conflict({
        error_code: HttpStatusMessages.NOT_FOUND,
        message: `Permission is not assigned to role`,
      })
    }

    await Acl.role(role).revokePermission(permission.slug)

    return {
      message: 'Permission removed from role successfully',
    }
  }

  /**
   * Assign a permission to a user
   */
  async assignPermissionToUser({ request, response }: HttpContext) {
    const { userId, permissionId } = request.body()

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    const permission = await Permission.find(permissionId)
    if (!permission) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Permission not found`,
      })
    }

    await user.allow(permission.slug)

    return {
      message: 'Permission assigned to user successfully',
    }
  }

  /**
   * Remove a permission from a user
   */
  async removePermissionFromUser({ request, response }: HttpContext) {
    const { userId, permissionId } = request.body()

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    const permission = await Permission.find(permissionId)
    if (!permission) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `Permission not found`,
      })
    }

    await user.revokePermission(permission.slug)

    return {
      message: 'Permission removed from user successfully',
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles({ request, response }: HttpContext) {
    const user = await User.find(request.param('id'))
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }
    return await user.roles()
  }

  /**
   * Get user permissions
   */
  async getUserPermissions({ request, response }: HttpContext) {
    const user = await User.find(request.param('id'))
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    return await user.permissions()
  }

  /**
   * Check if user has a specific permission
   */
  async checkUserPermission({ request, response }: HttpContext) {
    const { userId, permission } = request.body()

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    const hasPermission = await user.hasPermission(permission)

    return {
      hasPermission,
    }
  }

  /**
   * Check if user has a specific role
   */
  async checkUserRole({ request, response }: HttpContext) {
    const { userId, role } = request.body()

    const user = await User.find(userId)
    if (!user) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: `User not found`,
      })
    }

    const hasRole = await user.hasRole(role)

    return {
      hasRole,
    }
  }
}
