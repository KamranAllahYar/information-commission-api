import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_messages'

  async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'phone_number')
    if (!hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('phone_number').nullable()
      })
    }
  }

  async down() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'phone_number')
    if (hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('phone_number')
      })
    }
  }
}


