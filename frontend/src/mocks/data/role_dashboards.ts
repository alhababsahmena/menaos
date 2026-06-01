import type { RoleDashboard } from '@types'

import {
  DASHBOARD_EMPLOYEE,
  DASHBOARD_FINANCIAL,
  DASHBOARD_MANAGEMENT,
  DASHBOARD_TEAM_LEAD,
} from './dashboards'
import { ROLE_ADMIN, ROLE_MANAGEMENT, ROLE_STAFF, ROLE_TEAM_LEAD } from './roles'
import { USER_ADMIN_SARAH } from './users'

const ASSIGNED_AT = '2026-01-01T00:00:00.000Z'

interface DashboardGrant {
  role: string
  dashboard: string
}

const grants: readonly DashboardGrant[] = [
  // Staff: only their own employee surface.
  { role: ROLE_STAFF, dashboard: DASHBOARD_EMPLOYEE },

  // Team Lead: their own employee work + the review queue surface.
  { role: ROLE_TEAM_LEAD, dashboard: DASHBOARD_EMPLOYEE },
  { role: ROLE_TEAM_LEAD, dashboard: DASHBOARD_TEAM_LEAD },

  // Admin: everything operational (no financials by default).
  { role: ROLE_ADMIN, dashboard: DASHBOARD_EMPLOYEE },
  { role: ROLE_ADMIN, dashboard: DASHBOARD_TEAM_LEAD },
  { role: ROLE_ADMIN, dashboard: DASHBOARD_MANAGEMENT },

  // Management: oversight + financials.
  { role: ROLE_MANAGEMENT, dashboard: DASHBOARD_TEAM_LEAD },
  { role: ROLE_MANAGEMENT, dashboard: DASHBOARD_MANAGEMENT },
  { role: ROLE_MANAGEMENT, dashboard: DASHBOARD_FINANCIAL },
]

export const role_dashboards: readonly RoleDashboard[] = grants.map(
  (grant, index) => ({
    id: `00000000-0006-4000-9000-${(index + 1).toString(16).padStart(12, '0')}`,
    role_id: grant.role,
    dashboard_id: grant.dashboard,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  }),
)
