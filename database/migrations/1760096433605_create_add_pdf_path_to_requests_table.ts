import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requests'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pdf_path').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pdf_path')
    })
  }
}
