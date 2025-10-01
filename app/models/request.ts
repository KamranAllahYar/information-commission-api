import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

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
  declare status: 'pending' | 'inreview' | 'completed'

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

  // Timestamps
  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
