import vine from '@vinejs/vine'

export const createContactMessage = vine.compile(
  vine.object({
    name: vine.string(),
    email: vine.string(),
    subject: vine.string(),
    message: vine.string(),
  })
)
