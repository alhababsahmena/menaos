import type { PlatformDispute } from '@types'

import {
  REJECTION_IN_FLIGHT_ESCALATION,
  REJECTION_LOST_AT_PLATFORM,
  REJECTION_WON_AT_PLATFORM,
} from './rejections'
import {
  TASK_DISPUTE_LOST,
  TASK_DISPUTE_WON,
  TASK_ESCALATED_IN_FLIGHT,
} from './tasks'
import { USER_TL_KAREEM } from './users'

// Platform-dispute IDs use the `00000000-0012-…` namespace. One row per
// escalated rejection. The terminal "counter rejected by lead" task does
// NOT have a platform dispute — it never reached the platform.

export const PLATFORM_DISPUTE_WON = '00000000-0012-4000-9000-000000000001'
export const PLATFORM_DISPUTE_LOST = '00000000-0012-4000-9000-000000000002'
export const PLATFORM_DISPUTE_PENDING = '00000000-0012-4000-9000-000000000003'

export const platform_disputes: readonly PlatformDispute[] = [
  {
    id: PLATFORM_DISPUTE_WON,
    task_id: TASK_DISPUTE_WON,
    rejection_id: REJECTION_WON_AT_PLATFORM,
    escalated_by: USER_TL_KAREEM,
    outcome: 'won',
    platform_response:
      'Reviewed supplementary evidence — submission accepted. Crediting task.',
    escalated_at: '2026-05-23T09:00:00.000Z',
    resolved_at: '2026-05-26T10:18:00.000Z',
  },
  {
    id: PLATFORM_DISPUTE_LOST,
    task_id: TASK_DISPUTE_LOST,
    rejection_id: REJECTION_LOST_AT_PLATFORM,
    escalated_by: USER_TL_KAREEM,
    outcome: 'lost',
    platform_response:
      'Reviewed appeal — items are out of scope per the v3 spec. Rejection upheld.',
    escalated_at: '2026-05-21T09:30:00.000Z',
    resolved_at: '2026-05-24T14:00:00.000Z',
  },
  {
    id: PLATFORM_DISPUTE_PENDING,
    task_id: TASK_ESCALATED_IN_FLIGHT,
    rejection_id: REJECTION_IN_FLIGHT_ESCALATION,
    escalated_by: USER_TL_KAREEM,
    outcome: 'pending',
    platform_response: null,
    escalated_at: '2026-05-29T09:00:00.000Z',
    resolved_at: null,
  },
]
