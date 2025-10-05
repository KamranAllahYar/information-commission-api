import vine from '@vinejs/vine'

export const createNewsValidator = vine.compile(
  vine.object({
    title: vine.string(),
    category: vine.enum(['announcement', 'press_release', 'campaign', 'event', 'report']),
    excerpt: vine.string(),
    content: vine.string(),
    status: vine.enum(['published', 'draft']),
    image: vine.file().optional(),
    featured: vine.boolean(),
    // Accept optional publish date inputs from dashboard
    publishDate: vine.string().optional(),
    published_at: vine.string().optional(),
  })
)

export const updateNewsValidator = vine.compile(
  vine.object({
    title: vine.string().optional(),
    category: vine
      .enum(['announcement', 'press_release', 'campaign', 'event', 'report'])
      .optional(),
    excerpt: vine.string().optional(),
    content: vine.string().optional(),
    status: vine.enum(['published', 'draft']).optional(),
    image: vine.file().optional(),
    featured: vine.boolean().optional(),
    publishDate: vine.string().optional(),
    published_at: vine.string().optional(),
  })
)
