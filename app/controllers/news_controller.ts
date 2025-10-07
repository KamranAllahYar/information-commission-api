import { HttpContext } from '@adonisjs/core/http'
import { createNewsValidator, updateNewsValidator } from '#validators/news'
import News from '#models/news'
import { DateTime } from 'luxon'
import MediaController from '#controllers/media_controller'
import drive from '@adonisjs/drive/services/main'

export default class NewsController {
  async index({ request }: HttpContext) {
    const query = News.query()
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    } else {
      // Default sorting: newest first
      query.orderBy('created_at', 'desc')
    }
    if (request.input('status')) {
      query.where('status', request.input('status'))
    }
    if (request.input('category')) {
      query.where('category', request.input('category'))
    }
    if (request.input('search')) {
      const raw = String(request.input('search') || '').trim()
      // Match formats: "NEWS-7", "news 7", or plain numeric "7"
      const newsIdMatch = raw.match(/^news[-\s]?(\d+)$/i)
      const numericOnlyMatch = raw.match(/^\d+$/)
      if (newsIdMatch) {
        const id = Number(newsIdMatch[1])
        if (!Number.isNaN(id)) query.where('id', id)
      } else if (numericOnlyMatch) {
        const id = Number(raw)
        if (!Number.isNaN(id)) query.where('id', id)
      } else {
        query.where('title', 'like', `%${raw}%`)
      }
    }

    const news: any = await query.paginate(request.input('page', 1), request.input('page_size', 10))

    const { meta, data } = news.toJSON()

    // stats queries
    const total = await News.query().count('* as total').first()
    const published = await News.query().where('status', 'Published').count('* as total').first()
    const draft = await News.query().where('status', 'Draft').count('* as total').first()

    return {
      meta,
      data: {
        stats: {
          total: total?.$extras.total || 0,
          published: published?.$extras.total || 0,
          draft: draft?.$extras.total || 0,
          total_views: 2000,
        },
        data,
      },
    }
  }

  async public({ request }: HttpContext) {
    const query = News.query()
    query.where('status', 'published')

    // Optional filters for public listing
    const category = request.input('category') as string | undefined
    const search = String(request.input('search') || '').trim()

    if (category) {
      query.where('category', category)
    }

    if (search) {
      query.where((builder) => {
        builder.where('title', 'like', `%${search}%`).orWhere('excerpt', 'like', `%${search}%`)
      })
    }

    // Default sort by newest first
    query.orderBy('created_at', 'desc')

    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }

  async publicShow({ request, response }: HttpContext) {
    const news = await News.query()
      .where('uuid', request.param('id'))
      .where('status', 'published')
      .first()
    if (!news) {
      return response.notFound({
        message: 'News not found',
      })
    }
    return response.ok({
      message: 'News found',
      data: news,
    })
  }

  async show({ request, response }: HttpContext) {
    const news = await News.query().where('uuid', request.param('id')).first()
    if (!news) {
      return response.notFound({
        message: 'News not found',
      })
    }
    news.view += 1
    await news.save()

    return response.ok({
      message: 'News found',
      data: news,
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createNewsValidator)
    const { title, excerpt, content, category, status, featured } = payload
    const image = request.file('image', {
      size: '5mb',
    })
    const mediaController = new MediaController()
    let imageUrl
    if (image) {
      imageUrl = await mediaController.saveMedia(image)
    }
    if (status === 'draft') {
      const news = await News.create({
        title,
        excerpt,
        image: image ? imageUrl!.path : null,
        content,
        category,
        status,
        featured,
      })
      return response.ok({
        message: 'News created successfully',
        data: news,
      })
    }
    if (status === 'published') {
      const explicitPublishedAt = request.input('published_at') || request.input('publishDate')
      const news = await News.create({
        title,
        excerpt,
        content,
        image: image ? imageUrl!.path : null,
        category,
        status,
        featured,
        published_at: explicitPublishedAt ? DateTime.fromISO(explicitPublishedAt) : DateTime.now(),
      })
      return response.ok({
        message: 'News created successfully',
        data: news,
      })
    }
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateNewsValidator)
    const { title, excerpt, content, category, status, featured } = payload
    const news = await News.query().where('uuid', request.param('id')).first()
    if (!news) {
      return response.notFound({
        message: 'News not found',
      })
    }

    const image = request.file('image', {
      size: '5mb',
    })
    const mediaController = new MediaController()
    let imageUrl
    if (image) {
      if (news.image) {
        const existingImage = await drive.use().exists(news.image)
        if (existingImage) {
          await drive.use().delete(news.image)
        }
      }
      imageUrl = await mediaController.saveMedia(image)
    }

    // Build update payload with only defined fields to avoid overwriting unintentionally
    const updates: Record<string, unknown> = {}
    if (typeof title !== 'undefined') updates.title = title
    if (typeof excerpt !== 'undefined') updates.excerpt = excerpt
    if (typeof content !== 'undefined') updates.content = content
    if (typeof category !== 'undefined') updates.category = category
    if (typeof featured !== 'undefined') updates.featured = featured
    if (typeof status !== 'undefined') updates.status = status
    // Only set image when a new file is provided; otherwise keep existing
    if (image && imageUrl) {
      updates.image = imageUrl.path
    }

    // Handle published_at only when status is explicitly provided
    if (typeof status !== 'undefined') {
      if (status === 'draft') {
        updates.published_at = null
      } else if (status === 'published') {
        const explicitPublishedAt = request.input('published_at') || request.input('publishDate')
        updates.published_at = explicitPublishedAt ? DateTime.fromISO(explicitPublishedAt) : DateTime.now()
      }
    }

    news.merge(updates)
    await news.save()
    return response.ok({
      message: 'News updated successfully',
      data: news,
    })
  }

  async destroy({ request, response }: HttpContext) {
    const news = await News.query().where('uuid', request.param('id')).first()
    if (!news) {
      return response.notFound({
        message: 'News not found',
      })
    }
    if (news.image) {
      const existingImage = await drive.use().exists(news.image)
      if (existingImage) {
        await drive.use().delete(news.image)
      }
    }
    await news.delete()
    return response.ok({
      message: 'News deleted successfully',
    })
  }

  async featured({ request }: HttpContext) {
    const query = News.query().where('featured', true)
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    } else {
      // Default sorting: newest first
      query.orderBy('created_at', 'desc')
    }
    if (request.input('status')) {
      query.where('status', request.input('status'))
    }
    if (request.input('category')) {
      query.where('category', request.input('category'))
    }
    if (request.input('search')) {
      const raw = String(request.input('search') || '').trim()
      // Match formats: "NEWS-7", "news 7", or plain numeric "7"
      const newsIdMatch = raw.match(/^news[-\s]?(\d+)$/i)
      const numericOnlyMatch = raw.match(/^\d+$/)
      if (newsIdMatch) {
        const id = Number(newsIdMatch[1])
        if (!Number.isNaN(id)) query.where('id', id)
      } else if (numericOnlyMatch) {
        const id = Number(raw)
        if (!Number.isNaN(id)) query.where('id', id)
      } else {
        query.where('title', 'like', `%${raw}%`)
      }
    }

    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }
}
