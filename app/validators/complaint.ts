import vine from '@vinejs/vine'

export const createComplaintValidator = vine.compile(
  vine.object({
    // Complaint details

    type: vine.enum([
      'Refusal to Domain Information',
      'Excessive Delay in Report',
      'Unreasonable Fees Charged',
      'Partial Information Provided',
    ]),
    date_of_incident: vine.string(),
    description: vine.string(),
    remedy_sought: vine.string().optional().nullable(),

    // Contact Information
    full_name: vine.string(),
    email: vine.string().email().optional(),
    phone: vine.string().optional().nullable(),
    address: vine.string().optional().nullable(),
    national_id: vine.string().optional().nullable(),
    passport_number: vine.string().optional().nullable(),
  })
)

export const updateComplaintValidator = vine.compile(
  vine.object({
    // Complaint details
    type: vine
      .enum([
        'Refusal to Domain Information',
        'Excessive Delay in Report',
        'Unreasonable Fees Charged',
        'Partial Information Provided',
      ])
      .optional(),
    date_of_incident: vine.string().optional(),
    description: vine.string().optional(),
    remedy_sought: vine.string().optional().nullable(),

    // Contact Information
    full_name: vine.string().optional(),
    email: vine.string().email().optional(),
    phone: vine.string().optional().nullable(),
    address: vine.string().optional().nullable(),
    national_id: vine.string().optional().nullable(),
    passport_number: vine.string().optional().nullable(),

    // Admin controlled
    priority: vine.enum(['High', 'Medium', 'Low']).optional(),
    status: vine.enum(['Open', 'Investigating', 'Resolved']).optional(),
  })
)
