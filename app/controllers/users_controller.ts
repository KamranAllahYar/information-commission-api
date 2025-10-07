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
    const [result] = await db
      .from('users as u')
      .join('model_roles as mr', 'mr.model_id', 'u.id')
      .join('roles as r', 'r.id', 'mr.role_id')
      .where('r.slug', 'super-admin')
      .countDistinct('u.id as total_super_admins')
    const totalSuperAdmins = Number(result.total_super_admins)
    return {
      ...userResponse,
      total_super_admins: totalSuperAdmins,
    }
  }

  async index({ request }: HttpContext) {
    const search = request.input('search')
    if (search) {
    }
    const query = User.query()
      .select(['id', 'uuid', 'email', 'full_name', 'image_url', 'verified_at'])
      .preload('user_roles')
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
              query.where(key, 'LIKE', `%${value}%`)
            }
          })
        }
      } catch (error) {
        console.error('Error parsing whereQuery:', error)
        throw new Error('Invalid where query format')
      }
    }

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

    const otp = generateToken({ length: 6, numbersOnly: true })

    const user = new User()
    user.fill({
      ...payload.user,
      otp,
      otp_expiry: DateTime.now().plus({ minute: 10 }),
    })
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
    } catch (e) {
      console.log(e)
    }

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
    user.merge({
      ...payload.user,
    })
    await user.save()
    await user.load('user_roles')
    if (role) {
      if (user.user_roles[0]?.slug) {
        await user.revokeRole(user.user_roles[0].slug)
      }
      await user.assignRole(role.slug)
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
