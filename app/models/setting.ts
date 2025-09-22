import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import { tryJson } from '#lib/helpers'

export default class Setting extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare uuid: string

  @beforeCreate()
  static assignUuid(model: Setting) {
    model.uuid = randomUUID()
  }

  @column()
  declare key: string

  @column()
  declare value: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updated_at: DateTime

  static async json() {
    const settings = await Setting.query()
    const structuredSettings: Record<string, any> = {}
    settings.forEach((setting) => {
      structuredSettings[setting.key] = tryJson(setting.value)
    })
    return structuredSettings
  }
}
