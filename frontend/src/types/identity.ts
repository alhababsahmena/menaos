import type { ID, ISODateTime } from './primitives'

/**
 * Identity and table-driven RBAC entities. Field names are snake_case to
 * mirror the Postgres columns exactly — DRF's default serializer maps 1:1.
 *
 * Soft-removal pattern: link tables (`UserRole`, `RoleDashboard`) keep their
 * rows and set `unassigned_at` + `is_active = false` rather than deleting.
 * Active relationships are filtered server-side; the SPA may rely on
 * `is_active` for display.
 *
 * Audit pattern: every grant carries `granted_by` / `assigned_by` (the actor's
 * user ID) and a timestamp. Revocations carry `unassigned_at` (no separate
 * `revoked_by` today — the actor lives in the audit log).
 *
 * SSO match key: `User.oid` is the immutable Microsoft Entra object id. Look
 * up / link users by `oid`, never by `email`.
 */

export interface User {
  id: ID
  oid: string
  email: string
  display_name: string
  is_active: boolean
  /** Set when the user is soft-removed from the org; null while active. */
  unassigned_at: ISODateTime | null
  /**
   * Opaque signed URL to the user's avatar, or null. When null the SPA falls
   * back to initials computed from `display_name`. Never a public/raw path.
   */
  photo_url: string | null
  last_login_at: ISODateTime | null
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface Permission {
  id: ID
  key: string
  label: string
  description: string | null
}

export interface Role {
  id: ID
  name: string
  description: string | null
  is_system: boolean
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface Dashboard {
  id: ID
  key: string
  label: string
  description: string | null
}

export interface RolePermission {
  id: ID
  role_id: ID
  permission_id: ID
  granted_by: ID
  granted_at: ISODateTime
}

export interface UserRole {
  id: ID
  user_id: ID
  role_id: ID
  assigned_by: ID
  assigned_at: ISODateTime
  unassigned_at: ISODateTime | null
  is_active: boolean
}

export interface RoleDashboard {
  id: ID
  role_id: ID
  dashboard_id: ID
  assigned_by: ID
  assigned_at: ISODateTime
  unassigned_at: ISODateTime | null
  is_active: boolean
}
