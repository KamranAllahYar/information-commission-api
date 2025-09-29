import type { HttpContext } from '@adonisjs/core/http'
import Commissioner from '#models/commissioner'
import drive from '@adonisjs/drive/services/main'
import { saveFile } from '#lib/helpers'
import { DateTime } from 'luxon'

import { createCommissionerValidator, updateCommissionerValidator } from '#validators/commissioner'

export default class CommissionerController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = request.input('page_size', 10)
    const search = request.input('search')
    const query = Commissioner.query()
      .select([
        'id',
        'uuid',
        'full_name',
        'title',
        'email',
        'phone',
        'biography',
        'qualifications',
        'experience',
        'profile_photo_url',
        'appointment_date',
        'term_end_date',
        'status',
        'created_at',
      ])
      .if(search, (q) => {
        q.where((qb) => {
          qb.where('full_name', 'LIKE', `%${search}%`)
            .orWhere('email', 'LIKE', `%${search}%`)
            .orWhere('title', 'LIKE', `%${search}%`)
        })
      })
    if (request.input('status')) {
      query.where('status', request.input('status'))
    }
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    return query.paginate(page, pageSize)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCommissionerValidator)
    const existing = await Commissioner.findBy('email', payload.email)
    if (existing) {
      return response.conflict({ message: 'This email is already in use' })
    }

    const commissioner = new Commissioner()
    commissioner.fill({
      full_name: payload.full_name,
      title: payload.title,
      email: payload.email,
      phone: payload.phone ?? null,
      biography: payload.biography ?? null,
      qualifications: payload.qualifications?.trim() || null,
      experience: payload.experience?.trim() || null,
      appointment_date: DateTime.fromISO(payload.appointment_date),
      term_end_date: DateTime.fromISO(payload.term_end_date),
      status: (payload.status as 'active' | 'inactive') || 'active',
    })

    const image = request.file('profile_photo')
    if (image) {
      const { key } = await saveFile(image, '/images/commissioners')
      commissioner.profile_photo_url = key
    }
    await commissioner.save()
    return { message: 'Commissioner created', data: commissioner }
  }

  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const commissioner = await Commissioner.query().where('uuid', id).first()
    if (!commissioner) {
      return response.notFound({ message: 'Commissioner not found' })
    }
    return commissioner
  }

  async update({ request, response }: HttpContext) {
    const id = request.param('id')
    const commissioner = await Commissioner.query().where('uuid', id).first()
    if (!commissioner) {
      return response.notFound({ message: 'Commissioner not found' })
    }
    const payload = await request.validateUsing(updateCommissionerValidator)
    commissioner.merge({
      ...(payload.full_name ? { full_name: payload.full_name } : {}),
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone ?? null } : {}),
      ...(payload.biography !== undefined ? { biography: payload.biography ?? null } : {}),
      ...(payload.qualifications !== undefined
        ? { qualifications: payload.qualifications?.trim() || null }
        : {}),
      ...(payload.experience !== undefined
        ? { experience: payload.experience?.trim() || null }
        : {}),
      ...(payload.appointment_date
        ? { appointment_date: DateTime.fromISO(payload.appointment_date) }
        : {}),
      ...(payload.term_end_date
        ? { term_end_date: DateTime.fromISO(payload.term_end_date) }
        : {}),
      ...(payload.status ? { status: payload.status as 'active' | 'inactive' } : {}),
    })

    const image = request.file('profile_photo')
    if (image) {
      if (commissioner.profile_photo_url) {
        const exists = await drive.use().exists(commissioner.profile_photo_url)
        if (exists) await drive.use().delete(commissioner.profile_photo_url)
      }
      const { key } = await saveFile(image, '/images/commissioners')
      commissioner.profile_photo_url = key
    }
    await commissioner.save()
    return { message: 'Commissioner updated', data: commissioner }
  }

  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const commissioner = await Commissioner.query().where('uuid', id).first()
    if (!commissioner) {
      return response.notFound({ message: 'Commissioner not found' })
    }
    if (commissioner.profile_photo_url) {
      const exists = await drive.use().exists(commissioner.profile_photo_url)
      if (exists) await drive.use().delete(commissioner.profile_photo_url)
    }
    await commissioner.delete()
    return { message: 'Commissioner Deleted' }
  }
}
