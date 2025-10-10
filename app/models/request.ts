import { BaseModel, column, beforeCreate, afterCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import AccessInfoFormPDFService from '#services/request_pdf'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import env from '#start/env'

export default class Request extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare sampleID: string

  @beforeCreate()
  static async assignSampleID(model: Request) {
    const lastRequest = await Request.query().select(['id']).orderBy('id', 'desc').first()
    const nextId = lastRequest ? lastRequest.id + 1 : 1
    model.sampleID = `REQ-${nextId}`
  }

  @beforeCreate()
  static assignUuid(model: Request) {
    model.uuid = randomUUID()
  }

  // Applicant info
  @column({ columnName: 'name_of_applicant' })
  declare nameOfApplicant: string

  @column()
  declare dateOfBirth: DateTime

  @column()
  declare address: string

  @column({ columnName: 'telephone_number' })
  declare telephoneNumber: string

  @column()
  declare email: string

  @column()
  declare status: 'pending' | 'in_review' | 'completed'

  @column({ columnName: 'type_of_applicant' })
  declare typeOfApplicant: 'individual' | 'organization'

  // Request details
  @column({ columnName: 'description_of_information' })
  declare description: string

  @column({ columnName: 'manner_of_access' })
  declare mannerOfAccess: 'inspection' | 'copy' | 'viewing_listen' | 'written_transcript'

  @column({ columnName: 'is_life_liberty' })
  declare isLifeLiberty: boolean

  @column({ columnName: 'life_liberty_details' })
  public lifeLibertyDetails?: string

  @column({ columnName: 'form_of_access' })
  declare formOfAccess: 'hard_copy' | 'electronic_copy'

  @column({ columnName: 'date_of_submission' })
  declare dateOfSubmission: string

  // Witness & officer section
  @column({ columnName: 'witness_signature' })
  public witnessSignature?: string

  @column({ columnName: 'witness_statement' })
  public witnessStatement?: string

  @column({ columnName: 'institution_stamp' })
  public institutionStamp?: string

  @column({ columnName: 'receipt_officer_name' })
  public officerName?: string

  @column({ columnName: 'date_of_receipt' })
  declare dateOfReceipt?: string

  @column({ columnName: 'pdf_path' })
  public pdfPath?: string

  // Timestamps
  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @afterCreate()
  static async generatePDF(model: Request) {
    try {
      const pdfService = new AccessInfoFormPDFService()

      // Prepare form data for PDF generation
      const formData = {
        sampleID: model.sampleID,
        nameOfApplicant: model.nameOfApplicant,
        dateOfBirth: model.dateOfBirth ? (typeof model.dateOfBirth === 'string' ? model.dateOfBirth : model.dateOfBirth.toISODate()) : undefined,
        address: model.address,
        telephoneNumber: model.telephoneNumber,
        email: model.email,
        typeOfApplicant: model.typeOfApplicant,
        description: model.description,
        mannerOfAccess: model.mannerOfAccess,
        isLifeLiberty: model.isLifeLiberty,
        lifeLibertyDetails: model.lifeLibertyDetails,
        formOfAccess: model.formOfAccess,
        dateOfSubmission: model.dateOfSubmission,
        witnessSignature: model.witnessSignature,
        witnessStatement: model.witnessStatement,
        institutionStamp: model.institutionStamp,
        officerName: model.officerName,
        dateOfReceipt: model.dateOfReceipt,
      }

      // Generate PDF
      const pdfBuffer = await pdfService.generateFormPDF(formData)

      // Save PDF to storage
      const fileName = `request_${model.sampleID}_${model.uuid}.pdf`
      const pdfPath = join('storage', 'pdfs', fileName)
      const fullPath = join(process.cwd(), pdfPath)

      // Ensure directory exists
      const { mkdir } = await import('node:fs/promises')
      await mkdir(join(process.cwd(), 'storage', 'pdfs'), { recursive: true })

      // Write PDF file
      await writeFile(fullPath, pdfBuffer)
      const appUrl = env.get('APP_URL')
      const fileUrl = `${appUrl}/${pdfPath.replace(/\\/g, '/')}`
      // Update model with PDF path
      model.pdfPath = fileUrl
      await model.save()

      // Close PDF service
      await pdfService.close()

      console.log(`PDF generated successfully for request ${model.sampleID}: ${pdfPath}`)
    } catch (error) {
      console.error(`Failed to generate PDF for request ${model.sampleID}:`, error)
      // Don't throw error to avoid breaking the request creation
    }
  }
}
