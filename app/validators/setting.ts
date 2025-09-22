import vine from '@vinejs/vine'

export const createSettingValidator = vine.compile(
  vine.object({
    key: vine.string().trim().minLength(2).maxLength(255),
    value: vine.string().trim(),
  })
)

export const updateSettingValidator = vine.compile(
  vine.object({
    key: vine.string().trim().minLength(2).maxLength(255).optional(),
    value: vine.string().trim().optional(),
  })
)
