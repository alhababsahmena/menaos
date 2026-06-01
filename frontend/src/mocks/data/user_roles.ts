import type { UserRole } from '@types'

import { ROLE_ADMIN, ROLE_MANAGEMENT, ROLE_STAFF, ROLE_TEAM_LEAD } from './roles'
import {
  USER_ADMIN_SARAH,
  USER_MGMT_LAYLA,
  USER_STAFF_HALA,
  USER_STAFF_OMAR,
  USER_STAFF_REEM,
  USER_STAFF_YUSUF,
  USER_TL_KAREEM,
} from './users'

// Active assignments (current state) + one historical example for Omar:
// Omar was a Staff member who was deactivated on 2026-04-15. His user_role
// row is preserved with `unassigned_at` set and `is_active = false` to
// exercise the soft-removal pattern end-to-end.

const ASSIGNED_AT = '2026-01-01T00:00:00.000Z'

export const user_roles: readonly UserRole[] = [
  {
    id: '00000000-0007-4000-9000-000000000001',
    user_id: USER_ADMIN_SARAH,
    role_id: ROLE_ADMIN,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  },
  {
    id: '00000000-0007-4000-9000-000000000002',
    user_id: USER_TL_KAREEM,
    role_id: ROLE_TEAM_LEAD,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  },
  {
    id: '00000000-0007-4000-9000-000000000003',
    user_id: USER_MGMT_LAYLA,
    role_id: ROLE_MANAGEMENT,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  },
  {
    id: '00000000-0007-4000-9000-000000000004',
    user_id: USER_STAFF_YUSUF,
    role_id: ROLE_STAFF,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  },
  {
    id: '00000000-0007-4000-9000-000000000005',
    user_id: USER_STAFF_REEM,
    role_id: ROLE_STAFF,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  },
  {
    id: '00000000-0007-4000-9000-000000000006',
    user_id: USER_STAFF_HALA,
    role_id: ROLE_STAFF,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: null,
    is_active: true,
  },
  // Historical row: Omar's Staff role, revoked when he was deactivated.
  {
    id: '00000000-0007-4000-9000-000000000007',
    user_id: USER_STAFF_OMAR,
    role_id: ROLE_STAFF,
    assigned_by: USER_ADMIN_SARAH,
    assigned_at: ASSIGNED_AT,
    unassigned_at: '2026-04-15T10:00:00.000Z',
    is_active: false,
  },
]
