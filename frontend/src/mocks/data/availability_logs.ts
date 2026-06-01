import type { AvailabilityLog } from '@types'

import {
  USER_STAFF_REEM,
  USER_STAFF_YUSUF,
  USER_TL_KAREEM,
} from './users'

// Availability log IDs use the `00000000-000e-…` namespace.
//
// One week (Mon–Sun, 2026-05-25 → 2026-05-31) for two staff (Yusuf and
// Reem), covering every AvailabilityStatus value. `started_at` /
// `ended_at` are inclusive of the working day window. `recorded_by` is the
// Team Lead (the system records availability transitions on behalf of the
// user when they don't self-log).

interface Entry {
  user: string
  status: 'active' | 'absent' | 'blocked'
  date: string // YYYY-MM-DD
  reason: string | null
}

const entries: readonly Entry[] = [
  // Yusuf — five active days, one sick day, one active day.
  { user: USER_STAFF_YUSUF, status: 'active', date: '2026-05-25', reason: null },
  { user: USER_STAFF_YUSUF, status: 'active', date: '2026-05-26', reason: null },
  { user: USER_STAFF_YUSUF, status: 'active', date: '2026-05-27', reason: null },
  { user: USER_STAFF_YUSUF, status: 'active', date: '2026-05-28', reason: null },
  { user: USER_STAFF_YUSUF, status: 'active', date: '2026-05-29', reason: null },
  { user: USER_STAFF_YUSUF, status: 'absent', date: '2026-05-30', reason: 'Sick day.' },
  { user: USER_STAFF_YUSUF, status: 'active', date: '2026-05-31', reason: null },

  // Reem — three active, one blocked (system outage), three active.
  { user: USER_STAFF_REEM, status: 'active', date: '2026-05-25', reason: null },
  { user: USER_STAFF_REEM, status: 'active', date: '2026-05-26', reason: null },
  { user: USER_STAFF_REEM, status: 'active', date: '2026-05-27', reason: null },
  { user: USER_STAFF_REEM, status: 'blocked', date: '2026-05-28', reason: 'Platform access outage; flagged by Lead.' },
  { user: USER_STAFF_REEM, status: 'active', date: '2026-05-29', reason: null },
  { user: USER_STAFF_REEM, status: 'active', date: '2026-05-30', reason: null },
  { user: USER_STAFF_REEM, status: 'active', date: '2026-05-31', reason: null },
]

export const availability_logs: readonly AvailabilityLog[] = entries.map(
  (entry, index) => ({
    id: `00000000-000e-4000-9000-${(index + 1).toString(16).padStart(12, '0')}`,
    user_id: entry.user,
    status: entry.status,
    started_at: `${entry.date}T08:00:00.000Z`,
    ended_at: `${entry.date}T17:00:00.000Z`,
    reason: entry.reason,
    recorded_by: USER_TL_KAREEM,
  }),
)
