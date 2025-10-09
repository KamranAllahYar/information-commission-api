import vine from '@vinejs/vine'

export const createRequestValidator = vine.compile(
  vine.object({
    name_of_applicant: vine.string(),
    date_of_birth: vine.string().optional(),
    address: vine.string().optional(),
    telephone_number: vine.string().optional(),
    email: vine.string().email(),
    type_of_applicant: vine.enum(['individual', 'organization']),
    status: vine.enum(['pending', 'inreview', 'in_review', 'completed']).optional(),

    description_of_information: vine.string(),

    manner_of_access: vine.enum(['inspection', 'copy', 'viewing_listen', 'written_transcript']),

    is_life_liberty: vine.boolean(),
    life_liberty_details: vine.string().optional().nullable(),

    form_of_access: vine.enum(['hard_copy', 'electronic_copy']),

    date_of_submission: vine.string(),
    witness_signature: vine.string().optional().nullable(),
    witness_statement: vine.string().optional().nullable(),

    receipt_officer_name: vine.string().optional().nullable(),
    institution_stamp: vine.string().optional().nullable(),
    date_of_receipt: vine.string().optional().nullable(),
  })
)

export const updateRequestValidator = vine.compile(
  vine.object({
    name_of_applicant: vine.string().optional(),
    date_of_birth: vine.string().optional(),
    address: vine.string().optional(),
    telephone_number: vine.string().optional(),
    email: vine.string().email().optional(),
    status: vine.enum(['pending', 'inreview', 'in_review', 'completed']).optional(),
    type_of_applicant: vine.enum(['individual', 'organization']).optional(),

    description_of_information: vine.string().optional(),

    manner_of_access: vine
      .enum(['inspection', 'copy', 'viewing_listen', 'written_transcript'])
      .optional(),

    is_life_liberty: vine.boolean().optional(),
    life_liberty_details: vine.string().optional().nullable(),

    form_of_access: vine.enum(['hard_copy', 'electronic_copy']).optional(),

    date_of_submission: vine.string().optional(),

    witness_signature: vine.string().optional().nullable(),
    witness_statement: vine.string().optional().nullable(),

    receipt_officer_name: vine.string().optional().nullable(),
    institution_stamp: vine.string().optional().nullable(),
    date_of_receipt: vine.string().optional().nullable(),
  })
)
