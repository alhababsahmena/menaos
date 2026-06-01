import type { User } from '@types'

import { ValidationError } from '@lib/errors'
import type {
  UserCreateInput,
  UserListParams,
  UserUpdateInput,
  UsersApi,
} from '@lib/apiClient'

import type { MockDatabase } from '../db'
import { currentUserIdFor } from './auth'
import { nowIso, paginate, requireById, respond } from './util'

export function createUsersApi(db: MockDatabase): UsersApi {
  return {
    async list(params: UserListParams = {}) {
      return respond(() => {
        const { page = 1, page_size = 50, is_active, search } = params
        let rows: readonly User[] = db.users
        if (is_active !== undefined) {
          rows = rows.filter((u) => u.is_active === is_active)
        }
        if (search) {
          const needle = search.toLowerCase()
          rows = rows.filter(
            (u) =>
              u.display_name.toLowerCase().includes(needle) ||
              u.email.toLowerCase().includes(needle),
          )
        }
        return paginate(rows, page, page_size, '/users/')
      })
    },

    async get(id) {
      return respond(() => requireById(db.users, id, 'User'))
    },

    async create(input: UserCreateInput) {
      return respond(() => {
        if (db.users.some((u) => u.oid === input.oid)) {
          throw new ValidationError('A user with this oid already exists.', {
            oid: ['Already exists.'],
          })
        }
        if (db.users.some((u) => u.email === input.email)) {
          throw new ValidationError('A user with this email already exists.', {
            email: ['Already exists.'],
          })
        }
        const now = nowIso()
        const user: User = {
          id: crypto.randomUUID(),
          oid: input.oid,
          email: input.email,
          display_name: input.display_name,
          is_active: true,
          unassigned_at: null,
          photo_url: null,
          last_login_at: null,
          created_at: now,
          updated_at: now,
        }
        db.users.push(user)
        return user
      })
    },

    async update(id, input: UserUpdateInput) {
      return respond(() => {
        const user = requireById(db.users, id, 'User')
        if (input.display_name !== undefined) {
          user.display_name = input.display_name
        }
        if (input.photo_url !== undefined) {
          user.photo_url = input.photo_url
        }
        user.updated_at = nowIso()
        return user
      })
    },

    async deactivate(id) {
      return respond(() => {
        const user = requireById(db.users, id, 'User')
        if (!user.is_active) return user
        const now = nowIso()
        user.is_active = false
        user.unassigned_at = now
        user.updated_at = now
        // Revoke active role assignments to mirror the real backend.
        for (const ur of db.user_roles) {
          if (ur.user_id === id && ur.is_active) {
            ur.is_active = false
            ur.unassigned_at = now
          }
        }
        // Touch the "actor" so audit lines stay grounded in a real user.
        const _actor = currentUserIdFor(db)
        void _actor
        return user
      })
    },
  }
}
