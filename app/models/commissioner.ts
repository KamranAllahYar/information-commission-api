import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
} from '@adonisjs/lucid/orm'

export default class Commissioner extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare full_name: string

  @column()
  declare title: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare biography: string | null

  @column.date()
  declare appointment_date: DateTime

  @column.date()
  declare term_end_date: DateTime

  @column()
  declare status: 'active' | 'inactive'

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
