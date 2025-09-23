import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Role } from '@holoyan/adonisjs-permissions'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    await Role.updateOrCreateMany('name', [
      { name: 'Super Admin', slug: 'super_admin' },
      { name: 'Admin', slug: 'admin' },
      { name: 'Editor', slug: 'editor' },
      { name: 'Viewer', slug: 'viewer' },
    ])
  }
}
