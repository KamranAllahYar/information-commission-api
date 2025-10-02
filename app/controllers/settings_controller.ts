import type { HttpContext } from '@adonisjs/core/http'
import Setting from '#models/setting'
import { createSettingValidator, updateSettingValidator } from '#validators/setting'
import { tryJson } from '#lib/helpers'

export default class SettingsController {
  async index({ request }: HttpContext) {
    const query = Setting.query()
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    if (request.input('is_active') !== undefined) {
      query.where('is_active', request.input('is_active'))
    }
    if (request.input('key')) {
      query.where('key', 'LIKE', `%${request.input('key')}%`)
    }
    if (request.input('type')) {
      query.where('type', request.input('type'))
    }
    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  // @ts-ignore
  async settings({ request }: HttpContext) {
    const query = Setting.query()
    if (request.input('key')) {
      query.where('key', 'LIKE', `%${request.input('key')}%`)
    }
    const settings = await query

    if (!settings) {
      return []
    }

    const structuredSettings: Record<string, any> = {}

    settings.forEach((setting) => {
      structuredSettings[setting.key] = tryJson(setting.value)
    })
    return structuredSettings
  }

  async show({ request, response }: HttpContext) {
    const setting = await Setting.query().where('uuid', request.param('id')).first()
    if (!setting) {
      return response.notFound({
        message: `Setting not found`,
      })
    }
    return setting
  }

  async getByKey({ request, response }: HttpContext) {
    const setting = await Setting.query().where('key', request.param('key')).first()
    if (!setting) {
      return response.notFound({
        message: `Setting not found`,
      })
    }
    return setting
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createSettingValidator)
    let setting = await Setting.query().where('key', payload.key).first()

    // Convert boolean to string for database storage
    const valueAsString = typeof payload.value === 'boolean' ? payload.value.toString() : payload.value

    if (setting) {
      setting.value = valueAsString
    } else {
      setting = new Setting()
      setting.merge({
        key: payload.key,
        value: valueAsString
      })
    }
    await setting.save()
    return response.created({
      message: 'Settings updated',
      data: {
        ...setting.toJSON(),
        value: tryJson(setting.value),
      },
    })
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateSettingValidator)
    const setting = await Setting.query().where('uuid', request.param('id')).first()
    if (!setting) {
      return response.notFound({
        message: `Setting not found`,
      })
    }

    // Convert boolean to string for database storage
    const updateData = {
      ...(payload.key && { key: payload.key }),
      value: typeof payload.value === 'boolean' ? payload.value.toString() : payload.value
    }

    setting.merge(updateData)
    await setting.save()
    return {
      message: 'Setting updated',
      data: {
        ...setting.toJSON(),
        value: tryJson(setting.value),
      },
    }
  }

  async destroy({ request, response }: HttpContext) {
    const setting = await Setting.query().where('uuid', request.param('id')).first()
    if (!setting) {
      return response.notFound({
        message: `Setting not found`,
      })
    }
    await setting.delete()
    return {
      message: 'Setting deleted',
    }
  }
}
