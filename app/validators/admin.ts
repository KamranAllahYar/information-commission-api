import vine from '@vinejs/vine'

export const createAdminValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
    full_name: vine.string().trim(),
    role: vine.enum(['super_admin', 'admin', 'editor', 'viewer'] as const),
    is_active: vine.boolean(),
  })
)

export const updateAdminValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().optional(),
    password: vine.string().minLength(6).optional(),
    full_name: vine.string().trim().optional(),
    role: vine.enum(['super_admin', 'admin', 'editor', 'viewer'] as const).optional(),
    is_active: vine.boolean().optional(),
  })
)


