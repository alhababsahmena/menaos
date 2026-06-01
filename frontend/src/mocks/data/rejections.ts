import type { Rejection } from '@types'

import {
  REJECTION_CATEGORY_INCOMPLETE_DATA,
  REJECTION_CATEGORY_OUT_OF_SCOPE,
  REJECTION_CATEGORY_QUALITY_BELOW_THRESHOLD,
} from './rejection_categories'
import {
  TASK_COUNTER_REJECTED_BY_LEAD,
  TASK_DISPUTE_LOST,
  TASK_DISPUTE_WON,
  TASK_ESCALATED_IN_FLIGHT,
  TASK_REJECTED_OPEN,
} from './tasks'
import { USER_TL_KAREEM } from './users'

// Rejection IDs use the `00000000-0010-…` namespace. One rejection row per
// rejected task; the dispute chain (counter + platform_dispute) hangs off
// each rejection.

export const REJECTION_OPEN_NO_COUNTER = '00000000-0010-4000-9000-000000000001'
export const REJECTION_WON_AT_PLATFORM = '00000000-0010-4000-9000-000000000002'
export const REJECTION_LOST_AT_PLATFORM = '00000000-0010-4000-9000-000000000003'
export const REJECTION_COUNTER_REJECTED_BY_LEAD = '00000000-0010-4000-9000-000000000004'
export const REJECTION_IN_FLIGHT_ESCALATION = '00000000-0010-4000-9000-000000000005'

export const rejections: readonly Rejection[] = [
  // Task 4 — rejected by Lead, submitter has not posted a counter yet.
  {
    id: REJECTION_OPEN_NO_COUNTER,
    task_id: TASK_REJECTED_OPEN,
    lead_id: USER_TL_KAREEM,
    category_id: REJECTION_CATEGORY_QUALITY_BELOW_THRESHOLD,
    reason: 'Several rows fall below the audit accuracy threshold; please re-check before resubmitting.',
    decision: 'rejected',
    created_at: '2026-05-31T13:45:00.000Z',
  },

  // Task 5 — initial rejection that was eventually escalated and won.
  {
    id: REJECTION_WON_AT_PLATFORM,
    task_id: TASK_DISPUTE_WON,
    lead_id: USER_TL_KAREEM,
    category_id: REJECTION_CATEGORY_INCOMPLETE_DATA,
    reason: 'Missing two columns from the audit checklist; appears recoverable.',
    decision: 'escalated',
    created_at: '2026-05-22T16:30:00.000Z',
  },

  // Task 6 — initial rejection that was escalated but lost.
  {
    id: REJECTION_LOST_AT_PLATFORM,
    task_id: TASK_DISPUTE_LOST,
    lead_id: USER_TL_KAREEM,
    category_id: REJECTION_CATEGORY_OUT_OF_SCOPE,
    reason: 'Items reference content outside the project scope.',
    decision: 'escalated',
    created_at: '2026-05-21T09:30:00.000Z',
  },

  // Task 7 — Lead reviewed the counter and confirmed the rejection.
  {
    id: REJECTION_COUNTER_REJECTED_BY_LEAD,
    task_id: TASK_COUNTER_REJECTED_BY_LEAD,
    lead_id: USER_TL_KAREEM,
    category_id: REJECTION_CATEGORY_QUALITY_BELOW_THRESHOLD,
    reason: 'Mislabeled entities. Counter-argument did not address the flagged rows.',
    decision: 'rejected',
    created_at: '2026-05-26T10:00:00.000Z',
  },

  // Task 8 — currently escalated to the platform.
  {
    id: REJECTION_IN_FLIGHT_ESCALATION,
    task_id: TASK_ESCALATED_IN_FLIGHT,
    lead_id: USER_TL_KAREEM,
    category_id: REJECTION_CATEGORY_INCOMPLETE_DATA,
    reason: 'Mid-batch fields not populated; submitter disagrees, dispute filed.',
    decision: 'escalated',
    created_at: '2026-05-29T08:30:00.000Z',
  },
]
