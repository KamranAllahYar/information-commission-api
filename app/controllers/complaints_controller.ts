import { HttpContext } from '@adonisjs/core/http'
import Complaint from '#models/complaint'
import { createComplaintValidator, updateComplaintValidator } from '#validators/complaint'

export default class ComplaintsController {
  async index({ request }: HttpContext) {
    const query = Complaint.query()

    if (request.input('sort_column') && request.input('sort_order')) {
      const sortColumn = request.input('sort_column')
      const sortOrder = request.input('sort_order')

      // Handle sample_id sorting with numerical order (for COMP-XX format)
      if (sortColumn === 'sample_id') {
        query.orderByRaw(`CAST(SUBSTRING(sample_id, 6) AS UNSIGNED) ${sortOrder.toUpperCase()}`)
      } else {
        query.orderBy(sortColumn, sortOrder)
      }
    } else {
      // Default sorting: highest complaint ID first
      query.orderByRaw('CAST(SUBSTRING(sample_id, 6) AS UNSIGNED) DESC')
    }

    // Filtering
    if (request.input('status')) {
      query.where('status', request.input('status'))
    }
    if (request.input('priority')) {
      query.where('priority', request.input('priority'))
    }
    if (request.input('category')) {
      query.where('category', request.input('category'))
    }
    if (request.input('search')) {
      query.where('full_name', 'like', `%${request.input('search')}%`)
      query.orWhere('email', 'like', `%${request.input('search')}%`)
      query.orWhere('address', 'like', `%${request.input('search')}%`)
      query.orWhere('national_id', 'like', `%${request.input('search')}%`)
      query.orWhere('passport_number', 'like', `%${request.input('search')}%`)
    }

    const complaints: any = await query.paginate(
      request.input('page', 1),
      request.input('page_size', 10)
    )

    const { meta, data } = complaints.toJSON()

    // stats queries
    const total = await Complaint.query().count('* as total').first()
    const open = await Complaint.query().where('status', 'Open').count('* as total').first()
    const investigating = await Complaint.query()
      .where('status', 'Investigating')
      .count('* as total')
      .first()
    const resolved = await Complaint.query().where('status', 'Resolved').count('* as total').first()

    return {
      meta,
      data: {
        stats: {
          total: total?.$extras.total || 0,
          open: open?.$extras.total || 0,
          investigating: investigating?.$extras.total || 0,
          resolved: resolved?.$extras.total || 0,
        },
        data,
      },
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
    return response.ok({ message: 'Complaint submitted successfully', data: complaint })
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
    return response.ok({ message: 'Complaint updated successfully', data: complaint })
  }

  // Delete (admin side)
  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const complaint = await Complaint.query().where('uuid', id).first()
    if (!complaint) {
      return response.notFound({ message: 'Complaint not found' })
    }

    await complaint.delete()
    return response.ok({ message: 'Complaint deleted successfully' })
  }
}
