import type { Platform } from '@types'

// Platform IDs use the `00000000-0008-…` namespace. Currency is locked per
// platform (CLAUDE.md): money on any task tied to this platform is in this
// currency. Earnings never sum across currencies.

export const PLATFORM_CLOUD_AUDIT_JOD = '00000000-0008-4000-9000-000000000001'
export const PLATFORM_TAGGING_GLOBAL_USD = '00000000-0008-4000-9000-000000000002'

const BOOTSTRAP_AT = '2026-01-01T00:00:00.000Z'

export const platforms: readonly Platform[] = [
  {
    id: PLATFORM_CLOUD_AUDIT_JOD,
    name: 'Cloud Audit',
    currency: 'JOD',
    is_active: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
  {
    id: PLATFORM_TAGGING_GLOBAL_USD,
    name: 'Tagging Global',
    currency: 'USD',
    is_active: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
]
