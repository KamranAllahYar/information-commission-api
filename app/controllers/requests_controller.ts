import { HttpContext } from '@adonisjs/core/http'
import Request from '#models/request'

import { createRequestValidator, updateRequestValidator } from '#validators/request'
import { DateTime } from 'luxon'

export default class RequestsController {
  async index({ request }: HttpContext) {
    const query = Request.query()

    // Sorting functionality
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    } else {
      // Default sorting: newest first
      query.orderBy('created_at', 'desc')
    }

    // Filtering
    if (request.input('status')) {
      query.where('status', request.input('status'))
    }
    if (request.input('sample_id')) {
      query.where('sample_id', request.input('sample_id'))
    }
    if (request.input('type_of_applicant')) {
      query.where('type_of_applicant', request.input('type_of_applicant'))
    }
    if (request.input('search')) {
      query.where('name_of_applicant', 'like', `%${request.input('search')}%`)
      query.orWhere('email', 'like', `%${request.input('search')}%`)
      query.orWhere('address', 'like', `%${request.input('search')}%`)
    }

    const requests: any = await query.paginate(
      request.input('page', 1),
      request.input('page_size', 10)
    )

    const { meta, data } = requests.toJSON()

    // stats queries
    const total = await Request.query().count('* as total').first()
    const pending = await Request.query().where('status', 'pending').count('* as total').first()
    const inreview = await Request.query().where('status', 'inreview').count('* as total').first()
    const completed = await Request.query().where('status', 'completed').count('* as total').first()

    return {
      meta,
      data: {
        stats: {
          total: total?.$extras.total || 0,
          pending: pending?.$extras.total || 0,
          inreview: inreview?.$extras.total || 0,
          completed: completed?.$extras.total || 0,
        },
        data,
      },
    }
  }

  // Create request
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createRequestValidator)

    const payload = {
      nameOfApplicant: data.name_of_applicant,
      dateOfBirth: data.date_of_birth as unknown as DateTime,
      address: data.address,
      telephoneNumber: data.telephone_number,
      email: data.email,
      status: data.status as 'pending' | 'inreview' | 'completed',
      typeOfApplicant: data.type_of_applicant,
      description: data.description_of_information,
      mannerOfAccess: data.manner_of_access,
      isLifeLiberty: data.is_life_liberty,
      lifeLibertyDetails: data.life_liberty_details ?? undefined,
      formOfAccess: data.form_of_access,
      dateOfSubmission: data.date_of_submission,
      witnessSignature: data.witness_signature ?? undefined,
      witnessStatement: data.witness_statement ?? undefined,
      institutionStamp: data.institution_stamp ?? undefined,
      officerName: data.receipt_officer_name ?? undefined,
      dateOfReceipt: data.date_of_receipt ?? undefined,
    }

    const req = new Request()
    req.fill(payload)

    await req.save()
    return response.ok({ message: 'Request submitted successfully', data: req })
  }

  // Get by ID
  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const req = await Request.query()
      .select([
        'id',
        'uuid',
        'sample_id',
        'name_of_applicant',
        'date_of_birth',
        'address',
        'telephone_number',
        'email',
        'status',
        'type_of_applicant',
        'description_of_information',
        'manner_of_access',
        'is_life_liberty',
        'life_liberty_details',
        'form_of_access',
        'date_of_submission',
        'witness_signature',
        'witness_statement',
        'receipt_officer_name',
        'institution_stamp',
        'date_of_receipt',
        'created_at',
        'updated_at',
      ])
      .where('uuid', id)
      .first()
    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }
    return req
  }

  // Update request
  async update({ request, response }: HttpContext) {
    const id = request.param('id')
    const req = await Request.query()
      .select([
        'id',
        'uuid',
        'sample_id',
        'name_of_applicant',
        'date_of_birth',
        'address',
        'telephone_number',
        'email',
        'status',
        'type_of_applicant',
        'description_of_information',
        'manner_of_access',
        'is_life_liberty',
        'life_liberty_details',
        'form_of_access',
        'date_of_submission',
        'witness_signature',
        'witness_statement',
        'receipt_officer_name',
        'institution_stamp',
        'date_of_receipt',
        'created_at',
        'updated_at',
      ])
      .where('uuid', id)
      .first()

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    const data = await request.validateUsing(updateRequestValidator)
    const payload = {
      ...(data.name_of_applicant ? { nameOfApplicant: data.name_of_applicant } : {}),
      ...(data.date_of_birth !== undefined ? { dateOfBirth: data.date_of_birth ?? undefined } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.telephone_number ? { telephoneNumber: data.telephone_number } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.status ? { status: data.status as 'pending' | 'inreview' | 'completed' } : {}),
      ...(data.type_of_applicant ? { typeOfApplicant: data.type_of_applicant } : {}),
      ...(data.description_of_information ? { description: data.description_of_information } : {}),
      ...(data.manner_of_access ? { mannerOfAccess: data.manner_of_access } : {}),
      ...(data.is_life_liberty !== undefined ? { isLifeLiberty: data.is_life_liberty } : {}),
      ...(data.life_liberty_details !== undefined
        ? { lifeLibertyDetails: data.life_liberty_details ?? undefined }
        : {}),
      ...(data.form_of_access ? { formOfAccess: data.form_of_access } : {}),
      ...(data.date_of_submission ? { dateOfSubmission: data.date_of_submission } : {}),
      ...(data.witness_signature !== undefined
        ? { witnessSignature: data.witness_signature ?? undefined }
        : {}),
      ...(data.witness_statement !== undefined
        ? { witnessStatement: data.witness_statement ?? undefined }
        : {}),
      ...(data.institution_stamp !== undefined
        ? { institutionStamp: data.institution_stamp ?? undefined }
        : {}),
      ...(data.receipt_officer_name !== undefined
        ? { officerName: data.receipt_officer_name ?? undefined }
        : {}),
      ...(data.date_of_receipt !== undefined
        ? { dateOfReceipt: data.date_of_receipt ?? undefined }
        : {}),
    }

    if (Object.keys(payload).length === 0) {
      return response.badRequest({ message: 'No fields provided to update' })
    }
    req.merge(payload as any)

    await req.save()
    return response.ok({ message: 'Request updated successfully', data: req })
  }

  // Delete request
  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const req = await Request.query().select(['id', 'uuid']).where('uuid', id).first()
    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    await req.delete()
    return response.ok({ message: 'Request deleted successfully' })
  }

  // Export requests to CSV
  async exportCsv({ response }: HttpContext) {
    const requests = await Request.query()
      .select([
        'id',
        'name_of_applicant',
        'date_of_birth',
        'address',
        'telephone_number',
        'email',
        'status',
        'type_of_applicant',
        'description_of_information',
        'manner_of_access',
        'is_life_liberty',
        'life_liberty_details',
        'form_of_access',
        'date_of_submission',
        'witness_signature',
        'witness_statement',
        'receipt_officer_name',
        'institution_stamp',
        'date_of_receipt',
      ])
      .orderBy('id', 'asc')

    // CSV headers
    const headers = [
      'Request ID',
      'Applicant Name',
      'Date of Birth',
      'Address',
      'Telephone Number',
      'Email',
      'Status',
      'Type of Applicant',
      'Description of Information',
      'Manner of Access',
      'Is Life Liberty',
      'Life Liberty Details',
      'Form of Access',
      'Date of Submission',
      'Witness Signature',
      'Witness Statement',
      'Receipt Officer Name',
      'Institution Stamp',
      'Date of Receipt',
    ]

    // Convert data to CSV format
    const csvRows = [headers.join(',')]

    requests.forEach((request) => {
      const row = [
        `REQ-${request.id}`,
        `"${(request.nameOfApplicant || '').replace(/"/g, '""')}"`,
        request.dateOfBirth || '',
        `"${(request.address || '').replace(/"/g, '""')}"`,
        request.telephoneNumber || '',
        request.email || '',
        request.status || '',
        request.typeOfApplicant || '',
        `"${(request.description || '').replace(/"/g, '""')}"`,
        request.mannerOfAccess || '',
        request.isLifeLiberty ? 'Yes' : 'No',
        `"${(request.lifeLibertyDetails || '').replace(/"/g, '""')}"`,
        request.formOfAccess || '',
        request.dateOfSubmission || '',
        `"${(request.witnessSignature || '').replace(/"/g, '""')}"`,
        `"${(request.witnessStatement || '').replace(/"/g, '""')}"`,
        `"${(request.officerName || '').replace(/"/g, '""')}"`,
        `"${(request.institutionStamp || '').replace(/"/g, '""')}"`,
        request.dateOfReceipt || '',
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')
    const filename = `information_requests_${timestamp}.csv`

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', `attachment; filename="${filename}"`)
    return response.send(csvContent)
  }
}
