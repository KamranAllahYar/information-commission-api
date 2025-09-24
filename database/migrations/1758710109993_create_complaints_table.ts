import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Complaints extends BaseSchema {
  protected tableName = 'complaints'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Complaint Details
      table.enum('type', [
        'Refusal to Domain Information',
        'Excessive Delay in Report',
        'Unreasonable Fees Charged',
        'Partial Information Provided',
      ]).notNullable()

      table.string('public_body').notNullable()
      table.date('date_of_incident').notNullable()
      table.text('description').notNullable()
      table.text('previous_attempts').nullable()

      // Contact Information
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.text('supporting_evidence').nullable() // could also use JSON if multiple

      // Admin Controlled Fields
      table.enum('priority', ['High', 'Medium', 'Low']).defaultTo('Low')
      table.enum('status', ['Open', 'Investigating', 'Resolved']).defaultTo('Open')

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
