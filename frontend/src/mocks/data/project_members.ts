import type { ProjectMember } from '@types'

import {
  PROJECT_CROWD_TAG_2026,
  PROJECT_QUICK_TAG_EXPRESS,
  PROJECT_SENTINEL_AUDIT,
} from './projects'
import {
  USER_ADMIN_SARAH,
  USER_STAFF_HALA,
  USER_STAFF_REEM,
  USER_STAFF_YUSUF,
  USER_TL_KAREEM,
} from './users'

const ASSIGNED_AT = '2026-01-15T00:00:00.000Z'

interface Membership {
  project: string
  user: string
}

const memberships: readonly Membership[] = [
  // Sentinel Audit (audited) — staff + the lead.
  { project: PROJECT_SENTINEL_AUDIT, user: USER_TL_KAREEM },
  { project: PROJECT_SENTINEL_AUDIT, user: USER_STAFF_YUSUF },
  { project: PROJECT_SENTINEL_AUDIT, user: USER_STAFF_REEM },

  // Crowd Tag 2026 (audited).
  { project: PROJECT_CROWD_TAG_2026, user: USER_TL_KAREEM },
  { project: PROJECT_CROWD_TAG_2026, user: USER_STAFF_HALA },
  { project: PROJECT_CROWD_TAG_2026, user: USER_STAFF_YUSUF },

  // Quick Tag Express (fast-path) — trusted submitters only.
  { project: PROJECT_QUICK_TAG_EXPRESS, user: USER_STAFF_YUSUF },
]

export const project_members: readonly ProjectMember[] = memberships.map(
  (m, index) => ({
    id: `00000000-000b-4000-9000-${(index + 1).toString(16).padStart(12, '0')}`,
    project_id: m.project,
    user_id: m.user,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  }),
)
