import vine from '@vinejs/vine'

export const createCommissionerValidator = vine.compile(
  vine.object({
    full_name: vine.string(),
    title: vine.string(),
    email: vine.string(),
    phone: vine.string().optional().nullable(),
    biography: vine.string().optional().nullable(),
    qualifications: vine.string().optional().nullable(),
    experience: vine.string().optional().nullable(),
    appointment_date: vine.string(),
    term_end_date: vine.string(),
    status: vine.enum(['active', 'inactive']).optional(),
  })
)

export const updateCommissionerValidator = vine.compile(
  vine.object({
    full_name: vine.string().optional(),
    title: vine.string().optional(),
    email: vine.string().optional(),
    phone: vine.string().optional().nullable(),
    biography: vine.string().optional().nullable(),
    qualifications: vine.string().optional().nullable(),
    experience: vine.string().optional().nullable(),
    appointment_date: vine.string().optional(),
    term_end_date: vine.string().optional(),
    status: vine.enum(['active', 'inactive']).optional(),
  })
)
