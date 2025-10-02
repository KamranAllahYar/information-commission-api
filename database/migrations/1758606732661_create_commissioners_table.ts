import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Commissioners extends BaseSchema {
  protected tableName = 'commissioners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 36).notNullable().unique()
      table.string('sample_id').nullable().unique()
      table.string('full_name').notNullable()
      table.string('title').notNullable()
      table.string('email').notNullable().unique()
      table.string('phone').nullable()
      table.text('biography').nullable()
      table.text('qualifications').nullable()
      table.text('experience').nullable()
      table.string('profile_photo_url').nullable()
      table.date('appointed_date').notNullable()
      table.date('term_end_date').notNullable()
      table.enum('status', ['active', 'inactive']).defaultTo('active')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
