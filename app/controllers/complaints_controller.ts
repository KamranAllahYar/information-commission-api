import type { HttpContext } from '@adonisjs/core/http'
import Complaint from '#models/complaint'
import { createComplaintValidator, updateComplaintValidator } from '#validators/complaint'

export default class ComplaintsController {
  // Get all complaints
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = request.input('page_size', 10)
    const search = request.input('search')

    const query = Complaint.query()
      .select([
        'id',
        'type',
        'public_body',
        'date_of_incident',
        'description',
        'previous_attempts',
        'first_name',
        'last_name',
        'email',
        'phone',
        'supporting_evidence',
        'priority',
        'status',
        'created_at',
      ])
      .if(search, (q) => {
        q.where((qb) => {
          qb.where('first_name', 'LIKE', `%${search}%`)
            .orWhere('last_name', 'LIKE', `%${search}%`)
            .orWhere('email', 'LIKE', `%${search}%`)
            .orWhere('public_body', 'LIKE', `%${search}%`)
        })
      })

    return query.paginate(page, pageSize)
  }

  // Create complaint (user side)
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createComplaintValidator)

    const complaint = new Complaint()
    complaint.fill({
      ...payload,
      priority: 'Low', // default
      status: 'Open',  // default
    })

    await complaint.save()
    return response.created({ message: 'Complaint submitted successfully', data: complaint })
  }

  // Get by ID
  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const complaint = await Complaint.find(id)
    if (!complaint) {
      return response.notFound({ message: 'Complaint not found' })
    }
    return complaint
  }

  // Update (admin side for status/priority or user correction)
  async update({ request, response }: HttpContext) {
    const id = request.param('id')
    const complaint = await Complaint.find(id)
    if (!complaint) {
      return response.notFound({ message: 'Complaint not found' })
    }

    const payload = await request.validateUsing(updateComplaintValidator)
    complaint.merge(payload)

    await complaint.save()
    return { message: 'Complaint updated successfully', data: complaint }
  }

  // Delete (admin side)
  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const complaint = await Complaint.find(id)
    if (!complaint) {
      return response.notFound({ message: 'Complaint not found' })
    }

    await complaint.delete()
    return { message: 'Complaint deleted successfully' }
  }
}
