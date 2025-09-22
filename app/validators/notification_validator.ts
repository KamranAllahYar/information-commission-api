import vine from '@vinejs/vine'

export const createGlobalNotificationValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(1).maxLength(255),
    message: vine.string().minLength(1),
    type: vine.enum(['info', 'success', 'warning', 'error']).optional(),
    metadata: vine.record(vine.any()).optional(),
  })
)

export const createUserNotificationValidator = vine.compile(
  vine.object({
    user_id: vine.number().positive(),
    title: vine.string().minLength(1).maxLength(255),
    message: vine.string().minLength(1),
    type: vine.enum(['info', 'success', 'warning', 'error']).optional(),
    metadata: vine.record(vine.any()).optional(),
  })
)

export const markMultipleAsReadValidator = vine.compile(
  vine.object({
    notification_ids: vine.array(vine.string().uuid()).minLength(1),
  })
)
