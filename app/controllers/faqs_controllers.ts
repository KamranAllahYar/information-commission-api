import { HttpContext } from '@adonisjs/core/http'
import Faq from '#models/faq'

export default class FaqsControllers {
  async public({ request }: HttpContext) {
    const query = Faq.query().orderBy('created_at', 'desc')
    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  async publicShow({ request, response }: HttpContext) {
    const faq = await Faq.query().where('uuid', request.param('id')).first()
    if (!faq) {
      return response.notFound({ message: 'FAQ not found' })
    }
    return response.ok({ message: 'FAQ found', data: faq })
  }

  async index({ request }: HttpContext) {
    const query = Faq.query()
    if (request.input('search')) {
      const term = `%${request.input('search')}%`
      query.where((q) => {
        q.where('question', 'like', term)
          .orWhere('answer', 'like', term)
          .orWhere('sample_id', 'like', term)
      })
    }
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    } else {
      query.orderBy('created_at', 'desc')
    }
    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  async show({ request, response }: HttpContext) {
    const faq = await Faq.query().where('uuid', request.param('id')).first()
    if (!faq) {
      return response.notFound({ message: 'FAQ not found' })
    }
    return response.ok({ message: 'FAQ found', data: faq })
  }

  async store({ request, response }: HttpContext) {
    const question = String(request.input('question') || '').trim()
    const answer = String(request.input('answer') || '').trim()
    if (!question || !answer) {
      return response.badRequest({ message: 'Question and answer are required' })
    }
    const faq = await Faq.create({ question, answer })
    return response.created({ message: 'FAQ created successfully', data: faq })
  }

  async update({ request, response }: HttpContext) {
    const question = request.input('question')
    const answer = request.input('answer')
    const faq = await Faq.query().where('uuid', request.param('id')).first()
    if (!faq) {
      return response.notFound({ message: 'FAQ not found' })
    }
    faq.merge({
      ...(typeof question === 'string' ? { question: question.trim() } : {}),
      ...(typeof answer === 'string' ? { answer: answer.trim() } : {}),
    })
    await faq.save()
    return response.ok({ message: 'FAQ updated successfully', data: faq })
  }

  async destroy({ request, response }: HttpContext) {
    const faq = await Faq.query().where('uuid', request.param('id')).first()
    if (!faq) {
      return response.notFound({ message: 'FAQ not found' })
    }
    await faq.delete()
    return response.ok({ message: 'FAQ deleted successfully' })
  }
}
