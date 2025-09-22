import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import Media from '#models/media'
import drive from '@adonisjs/drive/services/main'

export default class MediaController {
  async saveMedia(file: any) {
    const key = `/media/${DateTime.now().toFormat('dd-MM-yyyy')}/${cuid()}.${file.extname}`
    await file.moveToDisk(key)
    const media = new Media()
    media.path = key
    media.name = file.clientName
    media.mime = file.headers['content-type']
    media.size = file.size
    await media.save()
    return media
  }

  async create({ request }: HttpContext) {
    const files = request.files('files')
    for (let file of files) {
      const key = `/media/${DateTime.now().toFormat('dd-MM-yyyy')}/${cuid()}.${file.extname}`
      await file.moveToDisk(key)
      const media = new Media()
      media.path = key
      media.name = file.clientName
      media.mime = file.headers['content-type']
      media.size = file.size
      await media.save()
    }
    return {
      message: 'success',
    }
  }

  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const media = await Media.find(id)
    if (!media) {
      return response.notFound({
        message: 'Media not found',
      })
    }
    const disk = drive.use()
    await disk.delete(media.path)
    await media.delete()
    return {
      message: 'Media Deleted',
    }
  }
}
