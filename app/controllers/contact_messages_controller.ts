import type { HttpContext } from '@adonisjs/core/http'
import { createContactMessage } from '#validators/contact_message'
import ContactMessage from '#models/contact_message'
import { HttpStatusMessages } from '#enums/http_status_messages'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'

export default class ContactMessagesController {
  async index({ request }: HttpContext) {
    const search = request.input('search')
    const query = ContactMessage.query()
    // Sort whitelisting to avoid invalid columns
    const sortColumn = request.input('sort_column')
    const sortOrder = request.input('sort_order')
    const allowedSortColumns = ['id', 'name', 'email', 'phone_number', 'subject', 'created_at']
    if (sortColumn && sortOrder && allowedSortColumns.includes(String(sortColumn))) {
      query.orderBy(sortColumn, sortOrder)
    }
    if (search) {
      const num = Number(search)
      query
        .where((q) => {
          q.where('name', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`)
        })
      if (!Number.isNaN(num)) {
        query.orWhere('id', num)
      }
    }
    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createContactMessage)
    if (!payload.email) {
      return response.badRequest({
        error_code: HttpStatusMessages.BAD_REQUEST,
        message: 'Email is required',
      })
    }
    await ContactMessage.create(payload)

    if (env.get('NODE_ENV') === 'production') {
      await mail.send((message) => {
        message
          .to(env.get('SMTP_FROM'))
          .from(env.get('SMTP_FROM')) // Use a verified domain email here
          .replyTo(payload.email) // This makes reply go to user’s email
          .subject(payload.subject)
          .htmlView('emails/contact_form', {
            payload,
            submissionDate: new Date().toLocaleDateString(),
            submissionTime: new Date().toLocaleTimeString(),
          })
      })
    }
    return response.created({
      message: 'Thank you for contacting us!',
    })
  }

  async show({ request, response }: HttpContext) {
    const message = await ContactMessage.find(request.param('id'))
    if (!message) {
      return response.notFound({
        status_code: HttpStatusMessages.NOT_FOUND,
        message: 'User Query not found.',
      })
    }

    return response.ok({
      status_code: HttpStatusMessages.OK,
      message,
    })
  }

  async destroy({ request, response }: HttpContext) {
    const message = await ContactMessage.find(request.param('id'))
    if (!message) {
      return response.notFound({ message: 'Contact message not found' })
    }
    await message.delete()
    return response.ok({ message: 'Contact message deleted successfully' })
  }
}
