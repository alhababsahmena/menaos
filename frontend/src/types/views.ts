import type { Currency, TaskStatus } from './enums'
import type { ID, ISODateTime, Money } from './primitives'

/**
 * Frontend-shaped DTOs derived from one or more domain entities. The backend
 * computes these server-side so the SPA never has to join across tables on
 * the client. Naming: domain entities and their direct columns stay
 * snake_case; derived collections / display fields use camelCase to mark them
 * as frontend-shaped (matches `SessionUser.permissionKeys`).
 */

/**
 * A single row as the Tasks list page renders it: the task plus the joined
 * display fields the row needs so it never triggers follow-up requests.
 * `amount` / `currency` are the rate snapshot at submission — historical,
 * not the platform's current rate.
 */
export interface TaskListItem {
  id: ID
  status: TaskStatus

  project_id: ID
  projectName: string

  platform_id: ID
  platformName: string
  platformCurrency: Currency

  submitter_id: ID
  submitterDisplayName: string

  reviewer_id: ID | null
  reviewerDisplayName: string | null

  amount: Money
  currency: Currency

  version: number

  platform_submitted_at: ISODateTime | null
  accepted_at: ISODateTime | null
  escalated_at: ISODateTime | null

  created_at: ISODateTime
  updated_at: ISODateTime
}

/**
 * A single currency bucket in an earnings rollup. Aggregates are always
 * per-currency; never sum JOD + USD into one number (CLAUDE.md: "one
 * currency per platform; never SUM(JOD + USD)").
 */
export interface EarningsSummary {
  currency: Currency
  /** Number of tasks counted toward `totalAmount` in this bucket. */
  taskCount: number
  /** Sum of `Task.rate_snapshot` for the counted tasks, in `currency`. */
  totalAmount: Money
}
