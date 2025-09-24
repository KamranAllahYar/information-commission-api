import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Complaint extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // Complaint Details
  @column()
  public type: string

  @column()
  public publicBody: string

  @column.date()
  public dateOfIncident: Date

  @column()
  public description: string

  @column()
  public previousAttempts: string | null

  // Contact Information
  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public email: string

  @column()
  public phone: string | null

  @column()
  public supportingEvidence: string | null

  // Admin Controlled Fields
  @column()
  public priority: 'High' | 'Medium' | 'Low'

  @column()
  public status: 'Open' | 'Investigating' | 'Resolved'

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

}
