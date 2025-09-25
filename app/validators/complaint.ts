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
    public_body: vine.string(),
    date_of_incident: vine.string(),
    description: vine.string(),
    previous_attempts: vine.string().optional().nullable(),

    // Contact Information
    first_name: vine.string(),
    last_name: vine.string(),
    email: vine.string().email(),
    phone: vine.string().optional().nullable(),
    supporting_evidence: vine.string().optional().nullable(),
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
    public_body: vine.string().optional(),
    date_of_incident: vine.string().optional(),
    description: vine.string().optional(),
    previous_attempts: vine.string().optional().nullable(),

    // Contact Information
    first_name: vine.string().optional(),
    last_name: vine.string().optional(),
    email: vine.string().email().optional(),
    phone: vine.string().optional().nullable(),
    supporting_evidence: vine.string().optional().nullable(),

    // Admin controlled
    priority: vine.enum(['High', 'Medium', 'Low']).optional(),
    status: vine.enum(['Open', 'Investigating', 'Resolved']).optional(),
  })
)
