import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'news'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table
        .enum('category', ['announcement', 'press_release', 'campaign', 'event', 'report'])
        .notNullable()
      table.string('excerpt').notNullable()
      table.text('content').notNullable()
      table.text('image').nullable()
      table.enum('status', ['draft', 'published']).defaultTo('draft').notNullable()
      table.timestamp('published_at').nullable()
      table.boolean('featured').defaultTo(false).notNullable()
      table.integer('view').defaultTo(0).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
