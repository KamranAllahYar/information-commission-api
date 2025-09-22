import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 36).notNullable().unique()
      table.string('full_name').nullable().index()
      table.string('email', 254).notNullable().unique().index()
      table.string('dialing_code', 10).nullable().index()
      table.string('phone', 254).nullable().index()
      table.string('civil_number').nullable().index()
      table.string('passport_number').nullable().index()
      table.string('password').notNullable()
      table.string('postal_code').nullable()
      table.text('address').nullable()
      table
        .integer('country_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('countries')
        .onDelete('SET NULL')
        .onUpdate('NO ACTION')
      table
        .integer('state_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('states')
        .onDelete('SET NULL')
        .onUpdate('NO ACTION')
      table
        .integer('city_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('cities')
        .onDelete('SET NULL')
        .onUpdate('NO ACTION')
      table.enum('gender', ['male', 'female']).index()
      table.date('date_of_birth').nullable()
      table.text('image_url').nullable()
      table.string('otp').nullable()
      table.timestamp('otp_expiry').nullable()
      table.string('reset_password_otp').nullable()
      table.timestamp('reset_password_otp_expiry').nullable()
      table.datetime('verified_at').nullable().index()
      table.boolean('is_active').defaultTo(true).index()
      table.string('rob_license_number').nullable()
      table.text('id_card_document_url').nullable()
      table.text('passport_document_url').nullable()
      table.text('rob_license_document_url').nullable()
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
