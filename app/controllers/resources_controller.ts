import { HttpContext } from '@adonisjs/core/http'
import {
  createResourceValidator,
  updateResourceValidator,
  updateStatusValidator,
} from '#validators/resource'
import MediaController from '#controllers/media_controller'
import Resource from '#models/resource'
import drive from '@adonisjs/drive/services/main'

export default class ResourcesController {
  async index({ request }: HttpContext) {
    const query = Resource.query()
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    if (request.input('status')) {
      query.where('status', request.input('status'))
    }
    if (request.input('category')) {
      query.where('category', request.input('category'))
    }
    if (request.input('type')) {
      query.where('type', request.input('type'))
    }
    if (request.input('search')) {
      query.where('title', 'like', `%${request.input('search')}%`)
      query.orWhere('description', 'like', `%${request.input('search')}%`)
    }

    const resources: any = await query.paginate(
      request.input('page', 1),
      request.input('page_size', 10)
    )

    const { meta, data } = resources.toJSON()

    // stats queries
    const total = await Resource.query().count('* as total').first()
    const draft = await Resource.query().where('status', 'draft').count('* as total').first()
    const published = await Resource.query()
      .where('status', 'published')
      .count('* as total')
      .first()
    const totalDownloads = await Resource.query().sum('download as total').first()

    return {
      meta,
      data: {
        stats: {
          total: total?.$extras.total || 0,
          draft: draft?.$extras.total || 0,
          published: published?.$extras.total || 0,
          totalDownloads: totalDownloads?.$extras.total || 0,
        },
        data,
      },
    }
  }

  async public({ request }: HttpContext) {
    const query = Resource.query().where('status', 'published')
    if (request.input('sort_column') && request.input('sort_order')) {
      query.orderBy(request.input('sort_column'), request.input('sort_order'))
    }
    if (request.input('category')) {
      query.where('category', request.input('category'))
    }
    if (request.input('type')) {
      query.where('type', request.input('type'))
    }
    if (request.input('search')) {
      query.where('title', 'like', `%${request.input('search')}%`)
      query.orWhere('description', 'like', `%${request.input('search')}%`)
    }

    return await query.paginate(request.input('page', 1), request.input('page_size', 10))
  }
  async show({ request, response }: HttpContext) {
    const resource = await Resource.query().where('uuid', request.param('id')).first()
    if (!resource) {
      return response.notFound({
        message: 'Resource not found',
      })
    }
    return resource
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createResourceValidator)
    const { title, description, type, category, status, url } = payload
    const file = request.file('file', {
      size: '10mb',
    })
    if (!file) {
      response.badRequest({ message: 'File is required' })
    }

    const mediaController = new MediaController()
    const media = await mediaController.saveMedia(file)
    const resource = await Resource.create({
      title,
      description,
      category,
      status,
      type,
      url: url ? url : null,
      file: media.path,
      size: media.size,
      mime: media.mime,
    })
    return response.ok({
      message: 'Resource created successfully',
      data: resource,
    })
  }
  async update({ request, response }: HttpContext) {
    const resource = await Resource.query().where('uuid', request.param('id')).first()
    if (!resource) {
      return response.notFound({
        message: 'Resource not found',
      })
    }
    const payload = await request.validateUsing(updateResourceValidator)
    const { title, description, category, type, status, url } = payload
    const file = request.file('file', {
      size: '10mb',
    })
    if (file) {
      const existingFile = await drive.use().exists(resource.file)
      if (existingFile) {
        await drive.use().delete(resource.file)
      }
      const mediaController = new MediaController()
      const media = await mediaController.saveMedia(file)
      resource.merge({
        file: media.path,
        size: media.size,
        mime: media.mime,
      })
    }
    resource.merge({
      title,
      description,
      type,
      url: url ? url : null,
      category,
      status,
    })
    await resource.save()
    return response.ok({
      message: 'Resource updated successfully',
      data: resource,
    })
  }

  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const resource = await Resource.query().where('uuid', id).first()
    if (!resource) {
      return response.notFound({
        message: 'Resource not found',
      })
    }
    const exists = await drive.use().exists(resource.file)
    if (exists) {
      await drive.use().delete(resource.file)
      await resource.delete()
      return response.ok({
        message: 'Resource deleted successfully',
      })
    }
  }

  async updateStatus({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateStatusValidator)

    const resource = await Resource.query().where('uuid', request.param('id')).first()
    if (!resource) {
      return response.notFound({
        message: 'Resource not found',
      })
    }
    resource.merge(payload)
    await resource.save()
    return {
      message: 'Resource status updated successfully',
    }
  }

  async downloadFile({ request, response }: HttpContext) {
    const id = request.param('id')

    const resource = await Resource.query().where('uuid', id).first()
    if (!resource) {
      return response.notFound({
        message: 'Resource not found',
      })
    }
    resource.download += 1
    await resource.save()
    return response.ok({
      message: 'Resource downloaded successfully',
      data: resource.file_url,
    })
  }
}
