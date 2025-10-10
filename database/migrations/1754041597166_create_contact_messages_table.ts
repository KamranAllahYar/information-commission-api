import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').nullable()
      table.string('email').notNullable()
      table.string('phone_number').nullable()
      table.string('subject').nullable()
      table.text('message').notNullable()
      table.enum('status', ['Pending', 'Assigned', 'Resolved']).defaultTo('Pending')
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
