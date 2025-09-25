import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Requests extends BaseSchema {
  protected tableName = 'requests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Applicant info
      table.string('name_of_applicant').notNullable()
      table.date('date_of_birth').notNullable()
      table.text('address').notNullable()
      table.string('telephone_number').notNullable()
      table.string('email').notNullable()
      table.enum('type_of_applicant', ['individual', 'organization']).notNullable()

      // Request details
      table.text('description_of_information').notNullable()
      table
        .enum('manner_of_access', ['inspection', 'copy', 'viewing_listen', 'written_transcript'])
        .notNullable()
      table.boolean('is_life_liberty').notNullable().defaultTo(false)
      table.text('life_liberty_details').nullable()
      table.enum('form_of_access', ['hard_copy', 'electronic_copy']).notNullable()
      table.date('date_of_submission').notNullable()

      // Witness & officer section
      table.string('witness_signature').nullable()
      table.text('witness_statement').nullable()
      table.string('institution_stamp').nullable()
      table.string('receipt_officer_name').nullable()

      table.date('date_of_receipt').nullable()

      // timestamps
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
