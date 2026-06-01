import type { AvailabilityStatus, Currency, LeadDecision, TaskStatus } from './enums'
import type { ID, ISODateTime, Money } from './primitives'

/**
 * Operational entities: the work units (`Task`), their files
 * (`TaskAttachment`), and the user-availability ledger that gates submission.
 *
 * Optimistic locking: every mutating endpoint accepts the current
 * `Task.version`. Mismatch returns HTTP 409; the SPA must invalidate +
 * refetch (TanStack Query) and retry. `version` is monotonic, server-managed.
 *
 * Rate snapshot: `rate_id` references the `PlatformRate` row that was active
 * at submission time; `rate_snapshot` and `currency` freeze the actual value
 * so historical earnings don't move when rates change. Always read
 * `rate_snapshot` for money math, never re-derive from the platform.
 *
 * Status timeline fields (`platform_submitted_at`, `accepted_at`,
 * `escalated_at`) are set when the corresponding transition happens and
 * remain set thereafter. They are the canonical timestamps used by earnings
 * reporting and dashboard date filtering. (Whether we additionally need a
 * full `task_status_history` audit table is an open decision — see
 * PROGRESS.md.)
 */

export interface Task {
  id: ID
  project_id: ID
  platform_id: ID
  submitter_id: ID

  status: TaskStatus

  rate_id: ID
  rate_snapshot: Money
  currency: Currency

  reviewed_by: ID | null
  reviewer_decision: LeadDecision | null

  platform_submitted_at: ISODateTime | null
  accepted_at: ISODateTime | null
  escalated_at: ISODateTime | null

  version: number

  description: string
  notes: string | null

  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface TaskAttachment {
  id: ID
  task_id: ID
  uploaded_by: ID
  file_key: string
  file_name: string
  mime_type: string
  size_bytes: number
  uploaded_at: ISODateTime
}

export interface AvailabilityLog {
  id: ID
  user_id: ID
  status: AvailabilityStatus
  started_at: ISODateTime
  ended_at: ISODateTime | null
  reason: string | null
  recorded_by: ID
}
