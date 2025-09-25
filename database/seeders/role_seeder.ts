import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Role } from '@holoyan/adonisjs-permissions'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    await Role.updateOrCreateMany('slug', [
      { title: 'Super Admin', slug: 'super_admin' },
      { title: 'Admin', slug: 'admin' },
      { title: 'Editor', slug: 'editor' },
      { title: 'Viewer', slug: 'viewer' },
    ])
  }
}
