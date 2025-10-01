import { DateTime } from 'luxon'
import { BaseModel, column, computed, beforeCreate } from '@adonisjs/lucid/orm'
import { getMediaUrl } from '#lib/helpers'
import { randomUUID } from 'node:crypto'

export default class Commissioner extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare sampleID: string

  @beforeCreate()
  static async assignSampleID(model: Commissioner) {
    const lastCommissioner = await Commissioner.query().orderBy('id', 'desc').first()
    const nextId = lastCommissioner ? lastCommissioner.id + 1 : 1
    model.sampleID = `COM-${nextId}`
  }

  @beforeCreate()
  static assignUuid(model: Commissioner) {
    model.uuid = randomUUID()
  }

  @column()
  declare full_name: string

  @column()
  declare title: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare biography: string | null

  @column()
  declare qualifications: string | null

  @column()
  declare experience: string | null

  @column()
  declare profile_photo_url: string | null

  @column.date({ columnName: 'appointed_date' })
  declare appointed_date: DateTime

  @column.date()
  declare term_end_date: DateTime

  @column()
  declare status: 'active' | 'inactive'

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @computed()
  get profile_photo_web_url() {
    return getMediaUrl(this.profile_photo_url)
  }
}
