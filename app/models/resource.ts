import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { getMediaUrl } from '#lib/helpers'

export default class Resource extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare category: 'legislation' | 'reports' | 'guidelines' | 'financial' | 'policies'

  @column()
  declare status: 'draft' | 'published'

  @column()
  declare description: string

  @column()
  declare type: 'laws_regulations' | 'guides_manuals' | 'video_resources'

  @column()
  declare file: string

  @computed()
  get file_url() {
    return getMediaUrl(this.file)
  }

  @column()
  declare mime: string

  @column()
  declare size: number

  @column()
  declare download: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
