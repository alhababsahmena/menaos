import type { Role } from '@types'

// Role IDs use the `00000000-0003-…` namespace. All four roles below are
// `is_system: true` — created by the bootstrap migration, not editable in
// the admin UI. Tenant roles (if/when introduced) would land in the same
// table with `is_system: false`.

export const ROLE_STAFF = '00000000-0003-4000-9000-000000000001'
export const ROLE_TEAM_LEAD = '00000000-0003-4000-9000-000000000002'
export const ROLE_ADMIN = '00000000-0003-4000-9000-000000000003'
export const ROLE_MANAGEMENT = '00000000-0003-4000-9000-000000000004'

const BOOTSTRAP_AT = '2026-01-01T00:00:00.000Z'

export const roles: readonly Role[] = [
  {
    id: ROLE_STAFF,
    name: 'Staff',
    description: 'Submits tasks, counter-argues rejections, logs availability.',
    is_system: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
  {
    id: ROLE_TEAM_LEAD,
    name: 'Team Lead',
    description: 'Reviews submitted tasks, accepts or rejects, escalates to platform.',
    is_system: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
  {
    id: ROLE_ADMIN,
    name: 'Admin',
    description: 'Manages users, roles, projects, platforms, and rate windows.',
    is_system: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
  {
    id: ROLE_MANAGEMENT,
    name: 'Management',
    description: 'Oversight role. Sees earnings, dashboards, and org-wide KPIs.',
    is_system: true,
    created_at: BOOTSTRAP_AT,
    updated_at: BOOTSTRAP_AT,
  },
]
