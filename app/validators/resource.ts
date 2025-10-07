import vine from '@vinejs/vine'

export const createResourceValidator = vine.compile(
  vine.object({
    title: vine.string(),
    description: vine.string(),
    category: vine.enum(['legislation', 'reports', 'guidelines', 'financial', 'policies']),
    status: vine.enum(['draft', 'published']),
    type: vine.enum(['laws_regulations', 'guides_manuals', 'video_resources']),
    file: vine.file().optional(),
    url: vine.string().optional(),
  })
)

export const updateResourceValidator = vine.compile(
  vine.object({
    title: vine.string().optional(),
    description: vine.string().optional(),
    category: vine
      .enum(['legislation', 'reports', 'guidelines', 'financial', 'policies'])
      .optional(),
    status: vine.enum(['draft', 'published']).optional(),
    type: vine.enum(['laws_regulations', 'guides_manuals', 'video_resources']).optional(),
    file: vine.file().optional(),
    url: vine.string().optional(),
  })
)

export const updateStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['draft', 'published']),
  })
)
