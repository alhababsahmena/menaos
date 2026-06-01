import type { Project } from '@types'

import {
  PLATFORM_CLOUD_AUDIT_JOD,
  PLATFORM_TAGGING_GLOBAL_USD,
} from './platforms'

// Project IDs use the `00000000-000a-…` namespace.

export const PROJECT_SENTINEL_AUDIT = '00000000-000a-4000-9000-000000000001'
export const PROJECT_CROWD_TAG_2026 = '00000000-000a-4000-9000-000000000002'
export const PROJECT_QUICK_TAG_EXPRESS = '00000000-000a-4000-9000-000000000003'

const BOOTSTRAP_AT = '2026-01-15T00:00:00.000Z'

export const projects: readonly Project[] = [
  // Audit-heavy project: every submitted task must pass through a Lead
  // review before going to the platform.
  {
    id: PROJECT_SENTINEL_AUDIT,
    name: 'Sentinel Audit',
    platform_id: PLATFORM_CLOUD_AUDIT_JOD,
    requires_review: true,
    is_active: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
  // High-volume tagging project that still requires Lead review.
  {
    id: PROJECT_CROWD_TAG_2026,
    name: 'Crowd Tag 2026',
    platform_id: PLATFORM_TAGGING_GLOBAL_USD,
    requires_review: true,
    is_active: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
  // Fast-path project: trusted submitters skip the Lead review queue.
  {
    id: PROJECT_QUICK_TAG_EXPRESS,
    name: 'Quick Tag Express',
    platform_id: PLATFORM_TAGGING_GLOBAL_USD,
    requires_review: false,
    is_active: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
]
