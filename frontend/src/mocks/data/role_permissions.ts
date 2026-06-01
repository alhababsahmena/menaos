import type { RolePermission } from '@types'

import {
  PERMISSION_AVAILABILITY_LOG,
  PERMISSION_AVAILABILITY_VIEW,
  PERMISSION_DISPUTES_COUNTER,
  PERMISSION_DISPUTES_ESCALATE,
  PERMISSION_DISPUTES_FILE,
  PERMISSION_DISPUTES_LIST,
  PERMISSION_DISPUTES_MANAGE,
  PERMISSION_DISPUTES_VIEW,
  PERMISSION_FINANCIALS_VIEW,
  PERMISSION_PLATFORMS_CREATE,
  PERMISSION_PLATFORMS_EDIT,
  PERMISSION_PLATFORMS_LIST,
  PERMISSION_PLATFORMS_SET_RATE,
  PERMISSION_PLATFORMS_VIEW,
  PERMISSION_PROJECTS_CREATE,
  PERMISSION_PROJECTS_EDIT,
  PERMISSION_PROJECTS_LIST,
  PERMISSION_PROJECTS_MANAGE_MEMBERS,
  PERMISSION_PROJECTS_VIEW,
  PERMISSION_REVIEWS_LIST,
  PERMISSION_REVIEWS_PERFORM,
  PERMISSION_REVIEWS_VIEW,
  PERMISSION_ROLES_ASSIGN,
  PERMISSION_ROLES_CREATE,
  PERMISSION_ROLES_EDIT,
  PERMISSION_ROLES_LIST,
  PERMISSION_ROLES_VIEW,
  PERMISSION_TASKS_ACCEPT,
  PERMISSION_TASKS_EDIT,
  PERMISSION_TASKS_ESCALATE,
  PERMISSION_TASKS_LIST,
  PERMISSION_TASKS_REJECT,
  PERMISSION_TASKS_REVIEW,
  PERMISSION_TASKS_SUBMIT,
  PERMISSION_TASKS_VIEW,
  PERMISSION_USERS_CREATE,
  PERMISSION_USERS_DEACTIVATE,
  PERMISSION_USERS_EDIT,
  PERMISSION_USERS_LIST,
  PERMISSION_USERS_VIEW,
} from './permissions'
import { ROLE_ADMIN, ROLE_MANAGEMENT, ROLE_STAFF, ROLE_TEAM_LEAD } from './roles'
import { USER_ADMIN_SARAH } from './users'

// Granted by the bootstrap admin (Sarah) at platform install time. In the
// real system the actual `granted_by` for system-role permissions is a
// migration user; the mock collapses that to the admin for simplicity.

const GRANTED_AT = '2026-01-01T00:00:00.000Z'

interface Grant {
  role: string
  permission: string
}

const grants: readonly Grant[] = [
  // --- Staff ---
  { role: ROLE_STAFF, permission: PERMISSION_TASKS_LIST },
  { role: ROLE_STAFF, permission: PERMISSION_TASKS_VIEW },
  { role: ROLE_STAFF, permission: PERMISSION_TASKS_SUBMIT },
  { role: ROLE_STAFF, permission: PERMISSION_TASKS_EDIT },
  { role: ROLE_STAFF, permission: PERMISSION_PROJECTS_LIST },
  { role: ROLE_STAFF, permission: PERMISSION_PROJECTS_VIEW },
  { role: ROLE_STAFF, permission: PERMISSION_DISPUTES_LIST },
  { role: ROLE_STAFF, permission: PERMISSION_DISPUTES_VIEW },
  { role: ROLE_STAFF, permission: PERMISSION_DISPUTES_COUNTER },
  { role: ROLE_STAFF, permission: PERMISSION_AVAILABILITY_VIEW },
  { role: ROLE_STAFF, permission: PERMISSION_AVAILABILITY_LOG },

  // --- Team Lead (Staff + review/escalate + small user/project read) ---
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_LIST },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_VIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_EDIT },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_REVIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_ACCEPT },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_REJECT },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_TASKS_ESCALATE },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_PROJECTS_LIST },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_PROJECTS_VIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_REVIEWS_LIST },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_REVIEWS_VIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_REVIEWS_PERFORM },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_DISPUTES_LIST },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_DISPUTES_VIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_DISPUTES_FILE },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_DISPUTES_ESCALATE },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_USERS_LIST },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_USERS_VIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_AVAILABILITY_VIEW },
  { role: ROLE_TEAM_LEAD, permission: PERMISSION_AVAILABILITY_LOG },

  // --- Admin (org-wide ops; everything except financials.view) ---
  { role: ROLE_ADMIN, permission: PERMISSION_TASKS_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_TASKS_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_TASKS_EDIT },
  { role: ROLE_ADMIN, permission: PERMISSION_PROJECTS_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_PROJECTS_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_PROJECTS_CREATE },
  { role: ROLE_ADMIN, permission: PERMISSION_PROJECTS_EDIT },
  { role: ROLE_ADMIN, permission: PERMISSION_PROJECTS_MANAGE_MEMBERS },
  { role: ROLE_ADMIN, permission: PERMISSION_USERS_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_USERS_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_USERS_CREATE },
  { role: ROLE_ADMIN, permission: PERMISSION_USERS_EDIT },
  { role: ROLE_ADMIN, permission: PERMISSION_USERS_DEACTIVATE },
  { role: ROLE_ADMIN, permission: PERMISSION_ROLES_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_ROLES_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_ROLES_CREATE },
  { role: ROLE_ADMIN, permission: PERMISSION_ROLES_EDIT },
  { role: ROLE_ADMIN, permission: PERMISSION_ROLES_ASSIGN },
  { role: ROLE_ADMIN, permission: PERMISSION_PLATFORMS_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_PLATFORMS_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_PLATFORMS_CREATE },
  { role: ROLE_ADMIN, permission: PERMISSION_PLATFORMS_EDIT },
  { role: ROLE_ADMIN, permission: PERMISSION_PLATFORMS_SET_RATE },
  { role: ROLE_ADMIN, permission: PERMISSION_DISPUTES_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_DISPUTES_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_DISPUTES_MANAGE },
  { role: ROLE_ADMIN, permission: PERMISSION_REVIEWS_LIST },
  { role: ROLE_ADMIN, permission: PERMISSION_REVIEWS_VIEW },
  { role: ROLE_ADMIN, permission: PERMISSION_AVAILABILITY_VIEW },

  // --- Management (oversight + financials, no day-to-day mutations) ---
  { role: ROLE_MANAGEMENT, permission: PERMISSION_TASKS_LIST },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_TASKS_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_PROJECTS_LIST },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_PROJECTS_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_USERS_LIST },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_USERS_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_PLATFORMS_LIST },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_PLATFORMS_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_DISPUTES_LIST },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_DISPUTES_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_REVIEWS_LIST },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_REVIEWS_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_AVAILABILITY_VIEW },
  { role: ROLE_MANAGEMENT, permission: PERMISSION_FINANCIALS_VIEW },
]

export const role_permissions: readonly RolePermission[] = grants.map(
  (grant, index) => ({
    id: `00000000-0005-4000-9000-${(index + 1).toString(16).padStart(12, '0')}`,
    role_id: grant.role,
    permission_id: grant.permission,
    granted_by: USER_ADMIN_SARAH,
    granted_at: GRANTED_AT,
  }),
)
