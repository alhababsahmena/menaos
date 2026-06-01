import type { Currency } from './enums'
import type { ID, ISODate, ISODateTime, Money } from './primitives'

/**
 * Organisation-level entities: platforms (external work sources), the rate
 * history attached to each platform, the projects we run on top of them, and
 * project membership.
 *
 * Currency rule (locked, MENAOS-wide): one currency per platform. `Task` and
 * `EarningsSummary` carry `Currency` denormalized so reporting can group
 * without re-joining, but the source of truth is `Platform.currency`. Never
 * sum across currencies.
 *
 * Rate history: `PlatformRate.effective_to` is `null` for the currently
 * active rate. When a new rate is recorded, the prior row gets `effective_to`
 * set to one second before the new `effective_from` (enforced by an EXCLUDE
 * constraint server-side; see CLAUDE.md).
 */

export interface Platform {
  id: ID
  name: string
  currency: Currency
  is_active: boolean
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface PlatformRate {
  id: ID
  platform_id: ID
  rate: Money
  effective_from: ISODate
  effective_to: ISODate | null
  created_by: ID
  created_at: ISODateTime
}

export interface Project {
  id: ID
  name: string
  platform_id: ID
  requires_review: boolean
  is_active: boolean
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface ProjectMember {
  id: ID
  project_id: ID
  user_id: ID
  assigned_by: ID
  assigned_at: ISODateTime
  unassigned_at: ISODateTime | null
  is_active: boolean
}
