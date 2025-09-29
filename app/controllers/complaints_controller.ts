import type { HttpContext } from '@adonisjs/core/http'
import Complaint from '#models/complaint'
import { createComplaintValidator, updateComplaintValidator } from '#validators/complaint'

export default class ComplaintsController {
  // Get all complaints
  async index({ request }: HttpContext) {
    const search = request.input('search')
    const page = request.input('page', 1)
    const pageSize = request.input('page_size', 10)

    const query = Complaint.query()
      .select([
        'id',
        'uuid',
        'type',
        'date_of_incident',
        'description',
        'remedy_sought',
        'full_name',
        'email',
        'phone',
        'address',
        'national_id',
        'passport_number',
        'priority',
        'status',
        'created_at',
      ])
      .if(search, (q) => {
        q.where((qb) => {
          qb.where('full_name', 'LIKE', `%${search}%`)
            .orWhere('email', 'LIKE', `%${search}%`)
            .orWhere('address', 'LIKE', `%${search}%`)
            .orWhere('national_id', 'LIKE', `%${search}%`)
            .orWhere('passport_number', 'LIKE', `%${search}%`)
        })
      })

    const status = request.input('status') as string | undefined
    const priority = request.input('priority') as string | undefined

    if (status) {
      // Normalize to DB values 'Open' | 'Investigating' | 'Resolved'
      const map: Record<string, string> = {
        open: 'Open',
        investigating: 'Investigating',
        resolved: 'Resolved',
      }
      const normalized = map[String(status).toLowerCase()]
      if (normalized) query.where('status', normalized)
    }
    if (priority) {
      // Normalize to DB values 'High' | 'Medium' | 'Low'
      const map: Record<string, string> = {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      }
      const normalized = map[String(priority).toLowerCase()]
      if (normalized) query.where('priority', normalized)
    }
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }

    const paginator = await query.paginate(page, pageSize)
    const json = paginator.toJSON()
    return {
      meta: {
        total: json.meta.total,
        per_page: json.meta.perPage,
        current_page: json.meta.currentPage,
        last_page: json.meta.lastPage,
        first_page: 1,
        first_page_url: `/?page=1`,
        last_page_url: `/?page=${json.meta.lastPage}`,
        next_page_url: json.meta.nextPage ? `/?page=${json.meta.nextPage}` : null,
        previous_page_url: json.meta.prevPage ? `/?page=${json.meta.prevPage}` : null,
      },
      data: json.data,
    }
  }

  // Create complaint (user side)
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createComplaintValidator)

    const complaint = new Complaint()
    complaint.fill({
      ...payload,
      priority: 'Low', // default
      status: 'Open', // default
    })

    await complaint.save()
    return response.created({ message: 'Complaint submitted successfully', data: complaint })
  }

  // Get by ID
  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const complaint = await Complaint.query().where('uuid', id).first()
    if (!complaint) {
      return response.notFound({ message: 'Complaint not found' })
    }
    return complaint
  }

  // Update (admin side for status/priority or user correction)
  async update({ request, response }: HttpContext) {
    const id = request.param('id')
    const complaint = await Complaint.query().where('uuid', id).first()
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
    const complaint = await Complaint.query().where('uuid', id).first()
    if (!complaint) {
      return response.notFound({ message: 'Complaint not found' })
    }

    await complaint.delete()
    return { message: 'Complaint deleted successfully' }
  }
}
