import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  BaseModel,
  beforeCreate,
  column,
  computed,
  manyToMany,
} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { getMediaUrl } from '#lib/helpers'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import { hasPermissions, MorphMap, Role } from '@holoyan/adonisjs-permissions'
import type { AclModelInterface } from '@holoyan/adonisjs-permissions/types'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'civil_number', 'passport_number'],
  passwordColumnName: 'password',
})

@MorphMap('users')
export default class User
  extends compose(BaseModel, AuthFinder, hasPermissions())
  implements AclModelInterface
{
  serializeExtras = true

  getModelId(): number {
    return this.id
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeCreate()
  static assignUuid(model: User) {
    model.uuid = randomUUID()
  }

  @column()
  declare email: string

  // Exclude password from being serialized
  @column({ serializeAs: null })
  declare password: string

  @column()
  declare full_name: string

  @computed()
  get first_name(): string {
    const nameParts = this.full_name?.trim().split(' ') || []
    return nameParts[0] || ''
  }

  @computed()
  get last_name(): string {
    const nameParts = this.full_name?.trim().split(' ') || []
    return nameParts.slice(1).join(' ') || ''
  }

  @column()
  declare dialing_code: string

  @column()
  declare phone: string

  @column()
  declare organization_name: string

  @column()
  declare gender: 'male' | 'female'

  @column()
  declare date_of_birth: DateTime

  @column()
  declare civil_number: string | null

  @column()
  declare passport_number: string | null

  @column()
  declare rob_license_number: string | null

  // Missing fields from migration
  @column()
  declare postal_code: string | null

  @column()
  declare address: string | null

  @column()
  declare country_id: number | null

  @column()
  declare state_id: number | null

  @column()
  declare city_id: number | null

  @column()
  declare is_active: boolean

  @column({ serializeAs: null })
  declare id_card_document_url: string | null

  @column({ serializeAs: null })
  declare passport_document_url: string | null

  @column({ serializeAs: null })
  declare rob_license_document_url: string | null

  @column({ serializeAs: null })
  declare image_url: string | null | undefined

  @column()
  declare verified_at: DateTime | null

  @column({ serializeAs: null })
  declare otp: string | null

  @column.dateTime({ columnName: 'otp_expiry', serializeAs: null })
  declare otp_expiry: DateTime | null

  @column({ serializeAs: null })
  declare reset_password_otp: string | null

  @column.dateTime({ serializeAs: null })
  declare reset_password_otp_expiry: DateTime | null

  @computed()
  get image() {
    return getMediaUrl(this.image_url)
  }

  @computed()
  get id_card_document() {
    return getMediaUrl(this.id_card_document_url)
  }

  @computed()
  get passport_document() {
    return getMediaUrl(this.passport_document_url)
  }

  @computed()
  get rob_license_document() {
    return getMediaUrl(this.rob_license_document_url)
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updated_at: DateTime

  @manyToMany(() => Role, {
    pivotTable: 'model_roles',
    pivotForeignKey: 'model_id',
    pivotRelatedForeignKey: 'role_id',
    onQuery: (query) => {
      query.where('model_roles.model_type', 'users')
    },
  })
  declare user_roles: ManyToMany<typeof Role>
}
