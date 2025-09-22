import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateNotificationsTable extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').nullable()
      table.text('message').nullable()
      table.string('type').defaultTo('info') // info, success, warning, error
      table.boolean('is_global').defaultTo(false)
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.json('metadata').nullable() // For additional data like action URLs, etc.
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()

      // Indexes for better performance
      table.index(['user_id'])
      table.index(['is_global'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
