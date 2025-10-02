import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'

export default class Faq extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare sampleID: string

  @beforeCreate()
  static async assignSampleID(model: Faq) {
    const lastFaq = await Faq.query().orderBy('id', 'desc').first()
    const nextId = lastFaq ? lastFaq.id + 1 : 1
    model.sampleID = `FAQ-${nextId}`
  }

  @beforeCreate()
  static assignUuid(model: Faq) {
    model.uuid = randomUUID()
  }

  @column()
  declare question: string

  @column()
  declare answer: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
