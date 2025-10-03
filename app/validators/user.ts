import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    user: vine.object({
      full_name: vine.string().optional(),
      email: vine.string().trim(),
      password: vine.string().minLength(8),
      date_of_birth: vine.string().optional(),
      gender: vine.enum(['Male', 'Female']).optional().nullable(),
    }),
    role_id: vine.number().positive().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    user: vine
      .object({
        full_name: vine.string().optional(),
        email: vine.string().trim().optional(),
        date_of_birth: vine.string().optional(),
        gender: vine.enum(['Male', 'Female']).optional(),
      })
      .optional(),
    role_id: vine.number().positive().optional(),
  })
)

export const updateSelfUserValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().optional(),
    last_name: vine.string().trim().optional(),
    gender: vine.enum(['Male', 'Female']).optional(),
  })
)
export const changePasswordValidator = vine.compile(
  vine.object({
    current_password: vine.string().trim(),
    password: vine.string().trim().minLength(8),
    confirm_password: vine.string().trim().sameAs('password'),
  })
)
