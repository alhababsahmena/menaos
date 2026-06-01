import type { Dashboard, Role, User } from './identity'

/**
 * Resolved view of the signed-in user. The backend resolves roles →
 * permissions and roles → dashboards server-side per request (cached in the
 * Django DatabaseCache) and ships the flattened result, so the SPA never has
 * to re-derive the matrix.
 *
 * Naming: domain entities (`user`, `roles`, `dashboards`) stay snake_case
 * where they mirror columns; derived collections use camelCase to mark them
 * as frontend-shaped (`permissionKeys`).
 *
 * `permissionKeys` is the deduplicated set of `Permission.key` values granted
 * to the user — match against these for authorization checks, never against
 * role names.
 */

export interface SessionUser {
  user: User
  roles: Role[]
  dashboards: Dashboard[]
  permissionKeys: string[]
}
