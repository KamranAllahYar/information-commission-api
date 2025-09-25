import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Complaints extends BaseSchema {
  protected tableName = 'complaints'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Complaint Details
      table
        .enum('type', [
          'Refusal to Domain Information',
          'Excessive Delay in Report',
          'Unreasonable Fees Charged',
          'Partial Information Provided',
        ])
        .notNullable()

      table.date('date_of_incident').notNullable()
      table.text('description').notNullable()

      // Contact Information
      table.string('full_name').notNullable()
      table.string('remedy_sought').nullable()
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.text('address').nullable()
      table.string('national_id').nullable()
      table.string('passport_number').nullable()

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
