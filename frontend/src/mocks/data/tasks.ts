import type { Task } from '@types'

import {
  PLATFORM_CLOUD_AUDIT_JOD,
  PLATFORM_TAGGING_GLOBAL_USD,
} from './platforms'
import {
  PLATFORM_RATE_CLOUD_CLOSED_2025,
  PLATFORM_RATE_CLOUD_CURRENT_2026,
  PLATFORM_RATE_TAGGING_CURRENT_2026,
} from './platform_rates'
import {
  PROJECT_CROWD_TAG_2026,
  PROJECT_QUICK_TAG_EXPRESS,
  PROJECT_SENTINEL_AUDIT,
} from './projects'
import {
  USER_STAFF_HALA,
  USER_STAFF_REEM,
  USER_STAFF_YUSUF,
  USER_TL_KAREEM,
} from './users'

// Task IDs use the `00000000-000c-…` namespace. The eight current-year
// tasks cover every TaskStatus value and every dispute-chain outcome
// (open work, won, lost, terminal-rejected, mid-flight escalation).
// One additional task is dated 2025 to exercise the closed rate window.

export const TASK_PENDING_AWAITING_REVIEW = '00000000-000c-4000-9000-000000000001'
export const TASK_PENDING_AWAITING_PLATFORM = '00000000-000c-4000-9000-000000000002'
export const TASK_ACCEPTED_2026 = '00000000-000c-4000-9000-000000000003'
export const TASK_REJECTED_OPEN = '00000000-000c-4000-9000-000000000004'
export const TASK_DISPUTE_WON = '00000000-000c-4000-9000-000000000005'
export const TASK_DISPUTE_LOST = '00000000-000c-4000-9000-000000000006'
export const TASK_COUNTER_REJECTED_BY_LEAD = '00000000-000c-4000-9000-000000000007'
export const TASK_ESCALATED_IN_FLIGHT = '00000000-000c-4000-9000-000000000008'
export const TASK_ACCEPTED_2025_LEGACY_RATE = '00000000-000c-4000-9000-000000000009'

export const tasks: readonly Task[] = [
  // 1. pending — just submitted, awaiting Lead review.
  {
    id: TASK_PENDING_AWAITING_REVIEW,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_YUSUF,
    status: 'pending',
    rate_id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    rate_snapshot: '14.50',
    currency: 'JOD',
    reviewed_by: null,
    reviewer_decision: null,
    platform_submitted_at: null,
    accepted_at: null,
    escalated_at: null,
    version: 1,
    description: 'Daily audit batch — bucket east-3.',
    notes: null,
    created_at: '2026-06-01T08:05:00.000Z',
    updated_at: '2026-06-01T08:05:00.000Z',
  },

  // 2. pending — Lead accepted internally, forwarded to platform.
  {
    id: TASK_PENDING_AWAITING_PLATFORM,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_REEM,
    status: 'pending',
    rate_id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    rate_snapshot: '14.50',
    currency: 'JOD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: null,
    platform_submitted_at: '2026-06-01T08:40:00.000Z',
    accepted_at: null,
    escalated_at: null,
    version: 2,
    description: 'Daily audit batch — bucket west-1.',
    notes: 'Reviewer note: clean submission.',
    created_at: '2026-06-01T08:10:00.000Z',
    updated_at: '2026-06-01T08:40:00.000Z',
  },

  // 3. accepted — platform accepted on the 2026 rate.
  {
    id: TASK_ACCEPTED_2026,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_YUSUF,
    status: 'accepted',
    rate_id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    rate_snapshot: '14.50',
    currency: 'JOD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: null,
    platform_submitted_at: '2026-05-30T11:00:00.000Z',
    accepted_at: '2026-05-30T15:32:00.000Z',
    escalated_at: null,
    version: 3,
    description: 'Daily audit batch — bucket north-2.',
    notes: null,
    created_at: '2026-05-30T10:00:00.000Z',
    updated_at: '2026-05-30T15:32:00.000Z',
  },

  // 4. rejected by the Lead — no counter-argument filed yet (open work for
  //    the submitter).
  {
    id: TASK_REJECTED_OPEN,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_REEM,
    status: 'rejected',
    rate_id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    rate_snapshot: '14.50',
    currency: 'JOD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: 'rejected',
    platform_submitted_at: null,
    accepted_at: null,
    escalated_at: null,
    version: 2,
    description: 'Daily audit batch — bucket south-4.',
    notes: 'Reviewer note: quality below threshold.',
    created_at: '2026-05-31T09:20:00.000Z',
    updated_at: '2026-05-31T13:45:00.000Z',
  },

  // 5. dispute chain — won at platform, task ended ACCEPTED.
  {
    id: TASK_DISPUTE_WON,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_YUSUF,
    status: 'accepted',
    rate_id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    rate_snapshot: '14.50',
    currency: 'JOD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: 'escalated',
    platform_submitted_at: '2026-05-22T11:00:00.000Z',
    accepted_at: '2026-05-26T10:18:00.000Z',
    escalated_at: '2026-05-23T09:00:00.000Z',
    version: 5,
    description: 'Daily audit batch — bucket east-1.',
    notes: 'Won at platform after appeal evidence attached.',
    created_at: '2026-05-21T08:00:00.000Z',
    updated_at: '2026-05-26T10:18:00.000Z',
  },

  // 6. dispute chain — lost at platform, task stayed REJECTED.
  {
    id: TASK_DISPUTE_LOST,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_HALA,
    status: 'rejected',
    rate_id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    rate_snapshot: '14.50',
    currency: 'JOD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: 'escalated',
    platform_submitted_at: '2026-05-20T11:00:00.000Z',
    accepted_at: null,
    escalated_at: '2026-05-21T09:30:00.000Z',
    version: 4,
    description: 'Daily audit batch — bucket west-3.',
    notes: 'Lost at platform; rejection upheld.',
    created_at: '2026-05-19T08:00:00.000Z',
    updated_at: '2026-05-24T14:00:00.000Z',
  },

  // 7. dispute chain — counter rejected by Lead, terminal REJECTED (never
  //    reached the platform).
  {
    id: TASK_COUNTER_REJECTED_BY_LEAD,
    project_id: PROJECT_CROWD_TAG_2026,
    platform_id: PLATFORM_TAGGING_GLOBAL_USD,
    submitter_id: USER_STAFF_HALA,
    status: 'rejected',
    rate_id: PLATFORM_RATE_TAGGING_CURRENT_2026,
    rate_snapshot: '7.25',
    currency: 'USD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: 'rejected',
    platform_submitted_at: null,
    accepted_at: null,
    escalated_at: null,
    version: 3,
    description: 'Tagging batch — set TX-09.',
    notes: 'Lead rejected the counter; no platform dispute filed.',
    created_at: '2026-05-25T11:00:00.000Z',
    updated_at: '2026-05-27T16:20:00.000Z',
  },

  // 8. currently ESCALATED — platform dispute is mid-flight (status='pending').
  {
    id: TASK_ESCALATED_IN_FLIGHT,
    project_id: PROJECT_QUICK_TAG_EXPRESS,
    platform_id: PLATFORM_TAGGING_GLOBAL_USD,
    submitter_id: USER_STAFF_YUSUF,
    status: 'escalated',
    rate_id: PLATFORM_RATE_TAGGING_CURRENT_2026,
    rate_snapshot: '7.25',
    currency: 'USD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: 'escalated',
    platform_submitted_at: '2026-05-28T12:00:00.000Z',
    accepted_at: null,
    escalated_at: '2026-05-29T09:00:00.000Z',
    version: 3,
    description: 'Tagging batch — set TX-12.',
    notes: 'Filed appeal; awaiting platform adjudication.',
    created_at: '2026-05-27T11:00:00.000Z',
    updated_at: '2026-05-29T09:00:00.000Z',
  },

  // 9. accepted on the 2025 closed rate — exercises the rate-history path.
  {
    id: TASK_ACCEPTED_2025_LEGACY_RATE,
    project_id: PROJECT_SENTINEL_AUDIT,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    submitter_id: USER_STAFF_REEM,
    status: 'accepted',
    rate_id: PLATFORM_RATE_CLOUD_CLOSED_2025,
    rate_snapshot: '12.00',
    currency: 'JOD',
    reviewed_by: USER_TL_KAREEM,
    reviewer_decision: null,
    platform_submitted_at: '2025-10-15T11:00:00.000Z',
    accepted_at: '2025-10-15T16:00:00.000Z',
    escalated_at: null,
    version: 3,
    description: 'Daily audit batch — bucket north-1 (legacy rate).',
    notes: null,
    created_at: '2025-10-15T08:00:00.000Z',
    updated_at: '2025-10-15T16:00:00.000Z',
  },
]
