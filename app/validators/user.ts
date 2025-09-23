import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    user: vine.object({
      full_name: vine.string().optional(),
      email: vine.string().trim(),
      password: vine.string().minLength(8),
      dialing_code: vine.string().trim().optional(),
      phone: vine.string().optional(),
      date_of_birth: vine.string().optional(),
      gender: vine.enum(['Male', 'Female']).optional().nullable(),
      civil_number: vine.string().optional(),
      passport_number: vine.string().optional(),
      rob_license_number: vine.string().optional(),
      address: vine.string().trim().optional(),
      country_id: vine.string().trim().optional(),
      state_id: vine.string().trim().optional(),
      city_id: vine.string().trim().optional(),
      postal_code: vine.string().trim().optional(),
      organization_name: vine.string().trim().optional(),
    }),
    profile: vine.object({
      type: vine.enum(['admin', 'candidate', 'staff']),
      staff_type: vine.enum(['trainer', 'assessor', 'quality_manager', 'manager']).optional(),
    }),
    role_id: vine.number().positive().optional(),
    profile_fields: vine
      .array(
        vine.object({
          field_name: vine.string().trim(),
          field_value: vine.any(),
          field_type: vine.string().trim(),
        })
      )
      .optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    user: vine
      .object({
        full_name: vine.string().optional(),
        dialing_code: vine.string().trim().optional(),
        phone: vine.string().optional(),
        date_of_birth: vine.string().optional(),
        gender: vine.enum(['Male', 'Female']).optional(),
        civil_number: vine.string().optional(),
        passport_number: vine.string().optional(),
        rob_license_number: vine.string().optional(),
        address: vine.string().trim().optional(),
        country_id: vine.string().trim().optional(),
        state_id: vine.string().trim().optional(),
        city_id: vine.string().trim().optional(),
        postal_code: vine.string().trim().optional(),
        organization_name: vine.string().trim().optional(),
      })
      .optional(),
    profile: vine
      .object({
        uuid: vine.string(),
      })
      .optional(),
    role_id: vine.number().positive().optional(),
    profile_fields: vine
      .array(
        vine.object({
          field_name: vine.string().trim(),
          field_value: vine.any(),
          field_type: vine.string().trim(),
        })
      )
      .optional(),
  })
)

export const updateSelfUserValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().optional(),
    last_name: vine.string().trim().optional(),
    dialing_code: vine.string().trim().optional(),
    phone: vine.string().trim().optional(),
    civil_number: vine.string().trim().optional(),
    passport_number: vine.string().trim().optional(),
    rob_license_number: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    country_id: vine.string().trim().optional(),
    state_id: vine.string().trim().optional(),
    city_id: vine.string().trim().optional(),
    postal_code: vine.string().trim().optional(),
    organization_name: vine.string().trim().optional(),
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
