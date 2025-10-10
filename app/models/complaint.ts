import { BaseModel, column, beforeCreate, afterCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import AccessInfoFormPDFService from '#services/complaint_pdf'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import env from '#start/env'

export default class Complaint extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Complaint Details
  @column()
  declare type: string

  @column()
  declare uuid: string

  @column()
  declare sampleID: string

  @beforeCreate()
  static async assignSampleID(model: Complaint) {
    const lastComplaint = await Complaint.query().orderBy('id', 'desc').first()
    const nextId = lastComplaint ? lastComplaint.id + 1 : 1
    model.sampleID = `COMP-${nextId}`
  }

  @beforeCreate()
  static assignUuid(model: Complaint) {
    model.uuid = randomUUID()
  }

  // @column()
  // declare publicBody: string

  @column.date()
  declare dateOfIncident: DateTime | null

  @column()
  declare description: string

  // @column()
  // declare previousAttempts: string | null

  // Contact Information
  @column()
  declare fullName: string
  @column()
  declare remedySought: string | null

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare address: string | null

  @column()
  declare nationalId: string | null

  @column()
  declare passportNumber: string | null

  // @column()
  // declare supportingEvidence: string | null

  // Admin Controlled Fields
  @column()
  declare priority: 'High' | 'Medium' | 'Low'

  @column()
  declare status: 'Open' | 'Investigating' | 'Resolved'

  @column({ columnName: 'pdf_path' })
  public pdfPath?: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @afterCreate()
  static async generatePDF(model: Complaint) {
    try {
      const pdfService = new AccessInfoFormPDFService()

      // Prepare form data for PDF generation
      const formData = {
        sampleID: model.sampleID,
        type: model.type,
        dateOfIncident: model.dateOfIncident?.toFormat('yyyy-MM-dd'),
        description: model.description,
        fullName: model.fullName,
        remedySought: model.remedySought || '',
        email: model.email,
        phone: model.phone || '',
        address: model.address || '',
        nationalId: model.nationalId || '',
        passportNumber: model.passportNumber || '',
        priority: model.priority,
        status: model.status,
      }

      // Generate PDF
      const pdfBuffer = await pdfService.generateFormPDF(formData)

      // Save PDF to storage
      const fileName = `complaint_${model.sampleID}_${model.uuid}.pdf`
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

      console.log(`PDF generated successfully for complaint ${model.sampleID}: ${pdfPath}`)
    } catch (error) {
      console.error(`Failed to generate PDF for complaint ${model.sampleID}:`, error)
      // Don't throw error to avoid breaking the complaint creation
    }
  }
}
