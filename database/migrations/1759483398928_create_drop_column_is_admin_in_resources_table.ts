import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_admin')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('is_admin').nullable()
    })
  }
}
