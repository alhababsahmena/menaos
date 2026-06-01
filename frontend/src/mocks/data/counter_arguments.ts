import type { CounterArgument } from '@types'

import {
  REJECTION_COUNTER_REJECTED_BY_LEAD,
  REJECTION_IN_FLIGHT_ESCALATION,
  REJECTION_LOST_AT_PLATFORM,
  REJECTION_WON_AT_PLATFORM,
} from './rejections'
import {
  USER_STAFF_HALA,
  USER_STAFF_YUSUF,
} from './users'

// Counter-argument IDs use the `00000000-0011-…` namespace. Exactly one
// counter per rejection (this matches the mock invariant the apiClient
// will enforce next prompt). The "open rejection with no counter yet"
// example deliberately has no row here.

export const COUNTER_WON_AT_PLATFORM = '00000000-0011-4000-9000-000000000001'
export const COUNTER_LOST_AT_PLATFORM = '00000000-0011-4000-9000-000000000002'
export const COUNTER_REJECTED_BY_LEAD = '00000000-0011-4000-9000-000000000003'
export const COUNTER_IN_FLIGHT_ESCALATION = '00000000-0011-4000-9000-000000000004'

export const counter_arguments: readonly CounterArgument[] = [
  // Task 5 → escalated → eventually won at platform.
  {
    id: COUNTER_WON_AT_PLATFORM,
    rejection_id: REJECTION_WON_AT_PLATFORM,
    submitter_id: USER_STAFF_YUSUF,
    argument:
      'The two missing columns were populated in the supplementary file already on record; attaching evidence.',
    created_at: '2026-05-22T17:10:00.000Z',
  },

  // Task 6 → escalated → lost at platform.
  {
    id: COUNTER_LOST_AT_PLATFORM,
    rejection_id: REJECTION_LOST_AT_PLATFORM,
    submitter_id: USER_STAFF_HALA,
    argument:
      'Items are within the broader audit scope per the v2 spec; requesting review by platform.',
    created_at: '2026-05-21T11:15:00.000Z',
  },

  // Task 7 → counter rejected by lead, terminal.
  {
    id: COUNTER_REJECTED_BY_LEAD,
    rejection_id: REJECTION_COUNTER_REJECTED_BY_LEAD,
    submitter_id: USER_STAFF_HALA,
    argument:
      'The flagged rows were intentionally tagged this way per the project brief.',
    created_at: '2026-05-26T14:20:00.000Z',
  },

  // Task 8 → mid-flight, dispute pending at platform.
  {
    id: COUNTER_IN_FLIGHT_ESCALATION,
    rejection_id: REJECTION_IN_FLIGHT_ESCALATION,
    submitter_id: USER_STAFF_YUSUF,
    argument:
      'Fields were populated; the rejected rows appear truncated in the platform view.',
    created_at: '2026-05-29T08:55:00.000Z',
  },
]
