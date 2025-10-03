import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 36).notNullable().unique()

      table.string('full_name').nullable().index()
      table.string('email', 254).notNullable().unique().index()

      table.string('password').notNullable()

      table.boolean('is_admin').defaultTo(false).index()

      table.enum('gender', ['male', 'female']).nullable().index()
      table.date('date_of_birth').nullable()

      table.text('image_url').nullable()

      table.string('otp').nullable()
      table.timestamp('otp_expiry', { useTz: true }).nullable()
      table.string('reset_password_otp').nullable()
      table.timestamp('reset_password_otp_expiry', { useTz: true }).nullable()
      table.timestamp('verified_at', { useTz: true }).nullable().index()

      table.boolean('is_active').defaultTo(true).index()

      table.enum('role', ['super_admin', 'admin', 'editor', 'viewer']).defaultTo('viewer').index()

      table.timestamp('last_login_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).nullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
