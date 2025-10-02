import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'resources'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 36).notNullable().unique()
      table.string('sample_id').nullable().unique()
      table.string('title').notNullable()
      table.text('description').notNullable()
      table
        .enum('category', ['legislation', 'reports', 'guidelines', 'financial', 'policies'])
        .notNullable()
      table.enum('status', ['draft', 'published']).notNullable()
      table.enum('type', ['laws_regulations', 'guides_manuals', 'video_resources']).notNullable()
      table.string('file').notNullable()
      table.string('url').nullable().defaultTo(null)
      table.string('mime').notNullable()
      table.string('size').notNullable()
      table.integer('download').defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
