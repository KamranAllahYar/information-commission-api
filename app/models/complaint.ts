import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Complaint extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Complaint Details
  @column()
  declare type: string

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

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
