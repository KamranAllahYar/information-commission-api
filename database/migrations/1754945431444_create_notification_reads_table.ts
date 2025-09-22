import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateNotificationReadsTable extends BaseSchema {
  protected tableName = 'notification_reads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('notification_id')
        .unsigned()
        .references('id')
        .inTable('notifications')
        .onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('read_at').nullable()
      table.timestamp('created_at').nullable()

      // Composite unique constraint to prevent duplicate reads
      table.unique(['notification_id', 'user_id'])

      // Indexes
      table.index(['user_id'])
      table.index(['notification_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
