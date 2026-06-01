import type { PlatformRate } from '@types'

import {
  PLATFORM_CLOUD_AUDIT_JOD,
  PLATFORM_TAGGING_GLOBAL_USD,
} from './platforms'
import { USER_ADMIN_SARAH } from './users'

// Rate windows: one closed (effective_to set) + one current (effective_to
// null) per platform. The closed window's effective_to is the day before the
// current window's effective_from so there is no overlap, which mirrors the
// EXCLUDE constraint that will live server-side (CLAUDE.md).

export const PLATFORM_RATE_CLOUD_CLOSED_2025 = '00000000-0009-4000-9000-000000000001'
export const PLATFORM_RATE_CLOUD_CURRENT_2026 = '00000000-0009-4000-9000-000000000002'
export const PLATFORM_RATE_TAGGING_CLOSED_2025 = '00000000-0009-4000-9000-000000000003'
export const PLATFORM_RATE_TAGGING_CURRENT_2026 = '00000000-0009-4000-9000-000000000004'

export const platform_rates: readonly PlatformRate[] = [
  {
    id: PLATFORM_RATE_CLOUD_CLOSED_2025,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    rate: '12.00',
    effective_from: '2025-01-01',
    effective_to: '2025-12-31',
    created_by: USER_ADMIN_SARAH,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: PLATFORM_RATE_CLOUD_CURRENT_2026,
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    rate: '14.50',
    effective_from: '2026-01-01',
    effective_to: null,
    created_by: USER_ADMIN_SARAH,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: PLATFORM_RATE_TAGGING_CLOSED_2025,
    platform_id: PLATFORM_TAGGING_GLOBAL_USD,
    rate: '6.50',
    effective_from: '2025-01-01',
    effective_to: '2025-12-31',
    created_by: USER_ADMIN_SARAH,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: PLATFORM_RATE_TAGGING_CURRENT_2026,
    platform_id: PLATFORM_TAGGING_GLOBAL_USD,
    rate: '7.25',
    effective_from: '2026-01-01',
    effective_to: null,
    created_by: USER_ADMIN_SARAH,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]
