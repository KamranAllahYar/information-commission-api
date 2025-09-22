import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, computed } from '@adonisjs/lucid/orm'
import { getMediaUrl } from '#lib/helpers'
import { randomUUID } from 'node:crypto'

export default class Media extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: string

  @column()
  declare uuid: string

  @beforeCreate()
  static assignUuid(model: Media) {
    model.uuid = randomUUID()
  }

  @column()
  declare name: string

  @column()
  declare path: string

  @column()
  declare mime: string

  @column()
  declare size: number

  @computed()
  get url() {
    return getMediaUrl(this.path)
  }

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
