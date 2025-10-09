import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  BaseModel,
  beforeCreate,
  beforeSave,
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
  uids: ['email'],
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

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare full_name: string

  @computed()
  get first_name(): string {
    const parts = this.full_name?.trim().split(' ') || []
    return parts[0] || ''
  }

  @computed()
  get last_name(): string {
    const parts = this.full_name?.trim().split(' ') || []
    return parts.slice(1).join(' ') || ''
  }

  @column()
  declare gender: 'male' | 'female' | null

  @column()
  declare date_of_birth: DateTime | null

  @column.dateTime()
  declare last_login_at: DateTime | null

  @column()
  declare is_active: boolean

  @column({ serializeAs: null })
  declare image_url: string | null

  @computed()
  get image() {
    return getMediaUrl(this.image_url)
  }

  @column()
  declare otp: string | null

  @column.dateTime()
  declare otp_expiry: DateTime | null

  @column.dateTime()
  declare verified_at: DateTime | null

  @column()
  declare reset_password_otp: string | null

  @column.dateTime()
  declare reset_password_otp_expiry: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
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

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      const plain = (user.password || '').trim()

      if (!plain.startsWith('$scrypt')) {
        user.password = await hash.make(plain)
      }
    }
  }
}
