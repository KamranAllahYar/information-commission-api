import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import {
  changePasswordValidator,
  updateSelfUserValidator,
  updateUserValidator,
  createUserValidator,
} from '#validators/user'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import hash from '@adonisjs/core/services/hash'
import { Role } from '@holoyan/adonisjs-permissions'
import { DateTime } from 'luxon'
import { HttpStatusMessages } from '#enums/http_status_messages'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { generateToken } from '#lib/helpers'
import db from '@adonisjs/lucid/services/db'

export default class UsersController {
  async stats() {
    const [userResponse] = await db
      .from('users')
      .select(
        db.raw('COUNT(*) as total_users'),
        db.raw('SUM(CASE WHEN is_active = ? THEN 1 ELSE 0 END) as active_users', [1]),
        db.raw('SUM(CASE WHEN is_active = ? THEN 1 ELSE 0 END) as inactive_users', [0])
      )

    // Count users without any role
    const [usersWithoutRole] = await db
      .from('users as u')
      .leftJoin('model_roles as mr', 'mr.model_id', 'u.id')
      .whereNull('mr.model_id')
      .countDistinct('u.id as users_without_role')

    // Count super admins
    const [superAdminResult] = await db
      .from('users as u')
      .join('model_roles as mr', 'mr.model_id', 'u.id')
      .join('roles as r', 'r.id', 'mr.role_id')
      .where('r.slug', 'super-admin')
      .countDistinct('u.id as total_super_admins')

    // Count admins
    const [adminResult] = await db
      .from('users as u')
      .join('model_roles as mr', 'mr.model_id', 'u.id')
      .join('roles as r', 'r.id', 'mr.role_id')
      .where('r.slug', 'admin')
      .countDistinct('u.id as total_admins')

    // Count editors
    const [editorResult] = await db
      .from('users as u')
      .join('model_roles as mr', 'mr.model_id', 'u.id')
      .join('roles as r', 'r.id', 'mr.role_id')
      .where('r.slug', 'editor')
      .countDistinct('u.id as total_editors')

    // Count viewers
    const [viewerResult] = await db
      .from('users as u')
      .join('model_roles as mr', 'mr.model_id', 'u.id')
      .join('roles as r', 'r.id', 'mr.role_id')
      .where('r.slug', 'viewer')
      .countDistinct('u.id as total_viewers')

    return {
      ...userResponse,
      users_without_role: Number(usersWithoutRole.users_without_role),
      total_super_admins: Number(superAdminResult.total_super_admins),
      total_admins: Number(adminResult.total_admins),
      total_editors: Number(editorResult.total_editors),
      total_viewers: Number(viewerResult.total_viewers),
    }
  }

  async index({ request }: HttpContext) {
    const search = request.input('search')
    const status = request.input('status')
    const role = request.input('role')

    const query = User.query()
      .select([
        'id',
        'uuid',
        'email',
        'full_name',
        'image_url',
        'verified_at',
        'is_active',
        'last_login_at',
        'created_at',
      ])
      .preload('user_roles', (q) => {
        q.select('slug', 'title')
      })
      .if(search, (q) => {
        q.where((searchQuery) => {
          searchQuery
            .where('email', 'LIKE', `%${search}%`)
            .orWhere('full_name', 'LIKE', `%${search}%`)
            .orWhereHas('user_roles', (roleQuery: any) => {
              roleQuery.where('title', 'LIKE', `%${search}%`)
            })
        })
      })
      .if(status, (q) => {
        if (status === 'active') {
          q.where('is_active', true)
        } else if (status === 'inactive') {
          q.where('is_active', false)
        }
      })
      .if(role, (q) => {
        q.whereHas('user_roles', (roleQuery: any) => {
          roleQuery.where('slug', role)
        })
      })

    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }

    return query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    let existingUser = await User.findBy('email', payload.user.email)
    if (existingUser) {
      return response.conflict({
        error_code: HttpStatusMessages.ALREADY_EXISTS,
        message: 'This email is already in use',
      })
    }

    let role = null
    if (payload.role_id) {
      role = await Role.find(payload.role_id)
      if (!role) {
        return response.notFound({
          error_code: HttpStatusMessages.NOT_FOUND,
          message: `Role not found`,
        })
      }
    }

    // Ensure password is hashed when creating user

    const otp = generateToken({ length: 6, numbersOnly: true })

    const user = new User()
    user.fill({
      ...payload.user,
      // Normalize email casing on creation
      email: payload.user.email?.toLowerCase(),
      // Provide plain password; model hook will hash on save
      otp,
      otp_expiry: DateTime.now().plus({ minute: 10 }),
    })

    // Default is_active to true if not provided
    if (payload.user.is_active !== undefined) {
      user.is_active = payload.user.is_active
    }

    // Handle image upload
    if (payload.image) {
      const fileName = `user_${Date.now()}_${payload.image.clientName}`
      await payload.image.move('storage/images/users', {
        name: fileName,
      })
      user.image_url = `images/users/${fileName}`
    }

    await user.save()

    if (role) {
      await user.assignRole(role.slug)
    }

    try {
      if (env.get('NODE_ENV') === 'production') {
        mail
          .send((message) => {
            message
              .to(payload.user.email)
              .from(env.get('SMTP_FROM'))
              .subject(`Otp to verify your ${env.get('APP_NAME')} account`)
              .htmlView('emails/verify_email', {
                otp,
                url: `${env.get('WEB_URL')}/auth/sign-in`,
                appName: env.get('APP_NAME'),
              })
          })
          .then(console.log)
          .catch(console.error)
      }
    } catch (e) {}

    return response.ok({
      message: 'User created',
      data: user,
    })
  }

  async show({ request, response }: HttpContext) {
    const user = await User.query().where('uuid', request.param('id')).first()
    if (!user) {
      return response.notFound({
        message: `User not found`,
      })
    }

    await user.load('user_roles')
    return user
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const user = await User.query().where('uuid', request.param('id')).first()
    if (!user) {
      return response.notFound({
        message: `User not found`,
      })
    }

    let role = null
    if (payload.role_id) {
      role = await Role.find(payload.role_id)
      if (!role) {
        return response.notFound({
          message: `Role not found`,
        })
      }
    }
    // Normalize and apply updatable fields
    if (payload.user?.email !== undefined) {
      user.email = String(payload.user.email).toLowerCase()
    }
    if (payload.user?.password) {
      // Set plain; model hook will hash
      user.password = payload.user.password
    }

    if (payload.user?.is_active !== undefined) {
      user.is_active = payload.user.is_active
    }

    // Handle image upload
    if (payload.image) {
      const fileName = `user_${Date.now()}_${payload.image.clientName}`
      await payload.image.move('storage/images/users', {
        name: fileName,
      })
      user.image_url = `images/users/${fileName}`
    }

    await user.save()
    await user.load('user_roles')

    if (role) {
      if (user.user_roles[0]?.slug) {
        await user.revokeRole(user.user_roles[0].slug)
      }
      await user.assignRole(role.slug)
    } else if (payload.role_id === null) {
      if (user.user_roles && user.user_roles.length > 0) {
        for (const userRole of user.user_roles) {
          await user.revokeRole(userRole.slug)
        }
      }
    }
    return {
      message: 'User updated',
      data: user,
    }
  }

  async destroy({ request, response }: HttpContext) {
    const user = await User.query().where('uuid', request.param('id')).first()
    if (!user) {
      return response.notFound({
        message: `User not found`,
      })
    }
    await user.delete()
    return {
      message: 'User Deleted',
    }
  }

  async selfProfileUpdate({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(updateSelfUserValidator)
    const user = auth.user!
    user.merge({
      ...payload,
    })
    await user.save()
    return {
      message: 'User updated',
      data: user,
    }
  }

  async image({ request, response, auth }: HttpContext) {
    const image = request.file('image')

    if (!image) {
      return response.badRequest({
        message: 'No image uploaded',
      })
    }
    if (auth.user!.image_url) {
      const existingImage = await drive.use().exists(auth.user!.image_url)
      if (existingImage) {
        await drive.use().delete(auth.user!.image_url)
      }
    }
    const key = `/images/${cuid()}.${image.extname}`
    await image.moveToDisk(key)
    auth.user!.image_url = key
    await auth.user!.save()

    return {
      message: 'Image uploaded',
      url: await drive.use().getUrl(key),
    }
  }

  async updateImage({ request, response }: HttpContext) {
    const image = request.file('image')
    const user = await User.query().where('uuid', request.param('id')).first()
    if (!image) {
      return response.badRequest({
        message: 'No image uploaded',
      })
    }

    if (!user) {
      return response.notFound({
        message: `User not found`,
      })
    }

    if (user.image_url) {
      const existingImage = await drive.use().exists(user.image_url)
      if (existingImage) {
        await drive.use().delete(user.image_url)
      }
    }
    const key = `/images/${cuid()}.${image.extname}`
    await image.moveToDisk(key)
    user.image_url = key
    await user.save()

    return {
      message: 'Image uploaded',
      url: await drive.use().getUrl(key),
    }
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(changePasswordValidator)
    if (!(await hash.verify(user.password, payload.current_password))) {
      return response.unprocessableEntity({
        message: 'Incorrect password',
      })
    }
    // Let model hook hash on save
    user.password = payload.password
    await user.save()
    return {
      message: 'Your password has been updated successfully.',
    }
  }

  async existingUsers({ request }: HttpContext) {
    const search = request.input('search')
    const query = User.query()
      .select(['id', 'uuid', 'email', 'full_name', 'civil_number'])
      .if(search, (q) => {
        q.where('email', search)
        q.orWhere('civil_number', search)
        // q.orWhere('passport_number', search)
      })

    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    return query.paginate(request.input('page', 1), request.input('page_size', 10))
  }
}
