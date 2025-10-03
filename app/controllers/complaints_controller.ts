import { HttpContext } from '@adonisjs/core/http'
import Complaint from '#models/complaint'
import { createComplaintValidator, updateComplaintValidator } from '#validators/complaint'
import { DateTime } from 'luxon'

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
    if (request.input('type')) {
      query.where('type', request.input('type'))
    }
    if (request.input('search')) {
      const searchTerm = request.input('search')
      query.where((subQuery) => {
        subQuery
          .where('full_name', 'like', `%${searchTerm}%`)
          .orWhere('email', 'like', `%${searchTerm}%`)
          .orWhere('address', 'like', `%${searchTerm}%`)
          .orWhere('national_id', 'like', `%${searchTerm}%`)
          .orWhere('passport_number', 'like', `%${searchTerm}%`)
          .orWhere('type', 'like', `%${searchTerm}%`)
          .orWhere('sample_id', 'like', `%${searchTerm}%`)

        // Handle COMP- prefix and numeric searches
        if (searchTerm.toLowerCase().startsWith('comp-')) {
          const numericPart = searchTerm.substring(5) // Remove "comp-" prefix
          if (!isNaN(Number(numericPart))) {
            subQuery.orWhereRaw(`CAST(SUBSTRING(sample_id, 6) AS UNSIGNED) = ?`, [Number(numericPart)])
          }
        } else if (!isNaN(Number(searchTerm))) {
          // If search term is purely numeric, search by numeric part of sample_id
          subQuery.orWhereRaw(`CAST(SUBSTRING(sample_id, 6) AS UNSIGNED) = ?`, [Number(searchTerm)])
        }
      })
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

  // Export complaints to CSV
  async exportCsv({ response }: HttpContext) {
    const complaints = await Complaint.query()
      .select([
        'id',
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
      ])
      .orderBy('id', 'asc')

    // CSV headers
    const headers = [
      'Complaint ID',
      'Type',
      'Date of Incident',
      'Description',
      'Remedy Sought',
      'Full Name',
      'Email',
      'Phone',
      'Address',
      'National ID',
      'Passport Number',
      'Priority',
      'Status',
    ]

    // Convert data to CSV format
    const csvRows = [headers.join(',')]

    complaints.forEach((complaint) => {
      const row = [
        `COMP-${complaint.id}`,
        complaint.type || '',
        complaint.dateOfIncident || '',
        `"${(complaint.description || '').replace(/"/g, '""')}"`,
        `"${(complaint.remedySought || '').replace(/"/g, '""')}"`,
        `"${(complaint.fullName || '').replace(/"/g, '""')}"`,
        complaint.email || '',
        complaint.phone || '',
        `"${(complaint.address || '').replace(/"/g, '""')}"`,
        complaint.nationalId || '',
        complaint.passportNumber || '',
        complaint.priority || '',
        complaint.status || '',
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')
    const filename = `complaints_${timestamp}.csv`

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', `attachment; filename="${filename}"`)
    return response.send(csvContent)
  }
}
