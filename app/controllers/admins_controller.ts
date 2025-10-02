// app/controllers/admins_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'
import { createAdminValidator, updateAdminValidator } from '../validators/admin.js'

export default class AdminsController {
  async index({ request }: HttpContext) {
    const search = request.input('search')

    const query = User.query()
      .where('is_admin', true)
      .select([
        'id',
        'uuid',
        'email',
        'full_name',
        'image_url',
        'verified_at',
        'is_active',
        'role',
        'last_login_at',
        'created_at',
      ])
      .if(search, (q) => {
        q.where((searchQuery) => {
          searchQuery
            .where('email', 'LIKE', `%${search}%`)
            .orWhere('full_name', 'LIKE', `%${search}%`)
            .orWhere('role', 'LIKE', `%${search}%`)
        })
      })

    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }

    return query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAdminValidator)
    console.log("admin created")
    const existing = await User.findBy('email', payload.email.toLowerCase())
    if (existing) {
      return response.conflict({
        message: 'This email is already in use',
      })
    }

    const user = new User()
    user.fill({
      email: payload.email.toLowerCase(),
      password: payload.password,
      full_name: payload.full_name,
      role: payload.role,
      is_active: payload.is_active,
      is_admin: true,
      verified_at: DateTime.now(),
    })
    await user.save()

    return response.created({
      message: 'Admin created',
      data: user,
    })
  }

  async show({ request, response }: HttpContext) {
    const user = await User.query()
      .where('uuid', request.param('id'))
      .where('is_admin', true)
      .first()
    if (!user) {
      return response.notFound({ message: 'Admin not found' })
    }
    return user
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateAdminValidator)
    const user = await User.query()
      .where('uuid', request.param('id'))
      .where('is_admin', true)
      .first()
    if (!user) {
      return response.notFound({ message: 'Admin not found' })
    }

    if (payload.email && payload.email.toLowerCase() !== user.email) {
      const exists = await User.findBy('email', payload.email.toLowerCase())
      if (exists) {
        return response.conflict({ message: 'This email is already in use' })
      }
      user.email = payload.email.toLowerCase()
    }

    if (payload.password) {
      // Let lucid hook hash on save (password column configured with auth finder)
      user.password = payload.password
    }

    if (payload.full_name !== undefined) user.full_name = payload.full_name
    if (payload.role !== undefined) user.role = payload.role
    if (payload.is_active !== undefined) user.is_active = payload.is_active

    await user.save()
    return { message: 'Admin updated', data: user }
  }

  async destroy({ request, response }: HttpContext) {
    const user = await User.query()
      .where('uuid', request.param('id'))
      .where('is_admin', true)
      .first()
    if (!user) {
      return response.notFound({ message: 'Admin not found' })
    }
    await user.delete()
    return { message: 'Admin deleted' }
  }
}
