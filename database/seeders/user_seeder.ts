import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { Role } from '@holoyan/adonisjs-permissions'
export default class UserSeeder extends BaseSeeder {
  public async run() {
    const superAdminRole = await Role.findBy('slug', 'super-admin')
    if (!superAdminRole) {
      console.log('superAdminRole not found. Please run the role seeder first.')
      return
    }
    const adminUser = await User.create({
      full_name: 'Super Admin',
      email: 'superadmin@admin.com',
      password: 'admin##123',
      is_active: true,
    })
    
    await adminUser.assignRole(superAdminRole.slug)

    await User.createMany(
      Array.from({ length: 10 }).map(() => ({
        full_name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        is_active: true,
      }))
    )
  }
}
