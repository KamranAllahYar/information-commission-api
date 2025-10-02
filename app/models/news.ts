import { BaseModel, column, computed, beforeCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { getMediaUrl } from '#lib/helpers'
import { randomUUID } from 'node:crypto'

export default class News extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare sampleID: string

  @beforeCreate()
  static async assignSampleID(model: News) {
    const lastNews = await News.query().orderBy('id', 'desc').first()
    const nextId = lastNews ? lastNews.id + 1 : 1
    model.sampleID = `ARTICLE-${nextId}`
  }

  @beforeCreate()
  static assignUuid(model: News) {
    model.uuid = randomUUID()
  }

  @column()
  declare title: string

  @column()
  declare category: 'announcement' | 'press_release' | 'campaign' | 'event' | 'report'

  @column()
  declare excerpt: string

  @column()
  declare content: string

  @column()
  declare status: 'draft' | 'published'

  @column.dateTime()
  declare published_at: DateTime | null

  @column({ serializeAs: null })
  declare image: string | null | undefined

  @computed()
  get image_url() {
    return getMediaUrl(this.image)
  }

  @column()
  declare featured: boolean

  @column()
  declare view: number

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
