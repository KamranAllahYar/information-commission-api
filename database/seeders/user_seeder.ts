import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { faker } from '@faker-js/faker'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.createMany(
      Array.from({ length: 10 }).map(() => ({
        full_name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        role: 'admin' as 'admin',
        is_admin: true,
        is_active: true,
      }))
    )
  }
}
