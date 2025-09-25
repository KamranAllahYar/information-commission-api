import type { HttpContext } from '@adonisjs/core/http'
import Request from '#models/request'

import { createRequestValidator, updateRequestValidator } from '#validators/request'

export default class RequestsController {
  // Get all requests (with optional search on applicant name/email/address)
  async index({ request, response }: HttpContext) {
    const id = request.input('id')
    if (id) {
      const req = await Request.find(id)
      if (!req) {
        return response.notFound({ message: 'Request not found' })
      }
      return req
    }

    const search = request.input('search')
    const query = Request.query()
      .select([
        'id',
        'name_of_applicant',
        'age',
        'address',
        'telephone_number',
        'email',
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
      ])
      .if(search, (q) => {
        q.where((qb) => {
          qb.where('name_of_applicant', 'LIKE', `%${search}%`)
            .orWhere('email', 'LIKE', `%${search}%`)
            .orWhere('address', 'LIKE', `%${search}%`)
        })
      })

    return query // returns all requests (array)
  }

  // Create request
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createRequestValidator)

    const payload = {
      nameOfApplicant: data.name_of_applicant,
      age: data.age,
      address: data.address,
      telephoneNumber: data.telephone_number,
      email: data.email,
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
    return response.created({ message: 'Request submitted successfully', data: req })
  }

  // Get by ID
  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const req = await Request.find(id)
    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }
    return req
  }

  // Update request
  async update({ request, response }: HttpContext) {
    const id = request.param('id')
    const req = await Request.find(id)

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    const data = await request.validateUsing(updateRequestValidator)
    const payload = {
      ...(data.name_of_applicant ? { nameOfApplicant: data.name_of_applicant } : {}),
      ...(data.age !== undefined ? { age: data.age } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.telephone_number ? { telephoneNumber: data.telephone_number } : {}),
      ...(data.email ? { email: data.email } : {}),
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
    req.merge(payload)

    await req.save()
    return { message: 'Request updated successfully', data: req }
  }

  // Delete request
  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const req = await Request.find(id)
    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    await req.delete()
    return { message: 'Request deleted successfully' }
  }
}
