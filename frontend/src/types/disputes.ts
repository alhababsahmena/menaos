import type { DisputeOutcome, LeadDecision } from './enums'
import type { ID, ISODateTime } from './primitives'

/**
 * Dispute chain: when a Lead rejects a task, the submitter can post a
 * `CounterArgument`; the Lead can then accept the counter (back to `pending`)
 * or escalate to the platform via a `PlatformDispute`, which the platform
 * adjudicates (won / lost).
 *
 * Whether a single task may be rejected more than once across its lifetime —
 * i.e. whether the chain is strictly one-shot — is an open decision tracked
 * in PROGRESS.md. The shape below supports either: nothing here assumes
 * one-shot.
 */

export interface RejectionCategory {
  id: ID
  key: string
  label: string
  description: string | null
  is_active: boolean
}

export interface Rejection {
  id: ID
  task_id: ID
  lead_id: ID
  category_id: ID
  reason: string
  decision: LeadDecision
  created_at: ISODateTime
}

export interface CounterArgument {
  id: ID
  rejection_id: ID
  submitter_id: ID
  argument: string
  created_at: ISODateTime
}

export interface PlatformDispute {
  id: ID
  task_id: ID
  rejection_id: ID
  escalated_by: ID
  outcome: DisputeOutcome
  platform_response: string | null
  escalated_at: ISODateTime
  resolved_at: ISODateTime | null
}
