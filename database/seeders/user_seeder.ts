import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { faker } from '@faker-js/faker'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    await User.createMany(
      Array.from({ length: 10 }).map((_, i) => ({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123', // 🔒 you can hash automatically via User model hooks
        role: 'Admin', // since you want 10 admin users
        status: true, // assuming boolean active
      }))
    )
  }
}
