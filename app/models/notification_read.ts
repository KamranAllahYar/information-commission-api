import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Notification from './notification.js'

export default class NotificationRead extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare notification_id: number

  @column()
  declare user_id: number

  @column.dateTime()
  declare read_at: DateTime

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Notification)
  declare notification: BelongsTo<typeof Notification>
}
