import type { Dashboard, Role, SessionUser } from '@types'

import { NotFoundError } from '@lib/errors'

import type { MockDatabase } from '../db'
import { USER_ADMIN_SARAH } from '../data/users'
import { respond } from './util'
import type { AuthApi } from '@lib/apiClient'

/**
 * For the static-build phase the "signed-in user" is hard-coded to the
 * Admin (Sarah) so screens that need a session render without a real
 * sign-in flow. The OIDC handshake lands later; this resolver does the
 * permission/dashboard derivation the real backend will do server-side.
 */
const CURRENT_USER_ID = USER_ADMIN_SARAH

export function createAuthApi(db: MockDatabase): AuthApi {
  return {
    async getSession(): Promise<SessionUser> {
      return respond(() => resolveSession(db, CURRENT_USER_ID))
    },

    async signOut(): Promise<void> {
      // No-op in the mock; the real backend will revoke the session token.
      return respond(() => undefined)
    },
  }
}

/**
 * Walks `user_roles` → `role_permissions` (and `role_dashboards`) to build
 * the flat per-request view the SPA consumes. Inactive grants
 * (`is_active = false`) are filtered out so historical rows don't leak
 * permissions to deactivated users.
 */
export function resolveSession(db: MockDatabase, userId: string): SessionUser {
  const user = db.users.find((u) => u.id === userId)
  if (!user) {
    throw new NotFoundError(`User ${userId} not found.`)
  }

  const activeUserRoles = db.user_roles.filter(
    (ur) => ur.user_id === userId && ur.is_active,
  )

  const roleIds = new Set(activeUserRoles.map((ur) => ur.role_id))
  const roles: Role[] = db.roles.filter((r) => roleIds.has(r.id))

  const permissionIds = new Set(
    db.role_permissions
      .filter((rp) => roleIds.has(rp.role_id))
      .map((rp) => rp.permission_id),
  )
  const permissionKeys = db.permissions
    .filter((p) => permissionIds.has(p.id))
    .map((p) => p.key)

  const dashboardIds = new Set(
    db.role_dashboards
      .filter((rd) => roleIds.has(rd.role_id) && rd.is_active)
      .map((rd) => rd.dashboard_id),
  )
  const dashboards: Dashboard[] = db.dashboards.filter((d) =>
    dashboardIds.has(d.id),
  )

  return { user, roles, dashboards, permissionKeys }
}

/** Exported so other handlers can model "the current user" consistently. */
export function currentUserIdFor(_db: MockDatabase): string {
  return CURRENT_USER_ID
}
