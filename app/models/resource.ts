import { BaseModel, column, computed, beforeCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { getMediaUrl } from '#lib/helpers'

export default class Resource extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare sampleID: string

  static async assignSampleID(model: Resource) {
    const lastResource = await Resource.query().orderBy('id', 'desc').first()
    const nextId = lastResource ? lastResource.id + 1 : 1
    model.sampleID = `RES-${nextId}`
  }

  @beforeCreate()
  static assignUuid(model: Resource) {
    model.uuid = randomUUID()
  }

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

  @column({ serializeAs: null })
  declare url: string | null

  @computed()
  get file_url() {
    // Prefer returning an external URL when present; otherwise return the stored media URL.
    if (this.url && this.url.trim() !== '') {
      return this.url
    }
    return this.file ? getMediaUrl(this.file) : ''
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
