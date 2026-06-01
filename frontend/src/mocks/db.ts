import type {
  AvailabilityLog,
  CounterArgument,
  Dashboard,
  Permission,
  Platform,
  PlatformDispute,
  PlatformRate,
  Project,
  ProjectMember,
  Rejection,
  RejectionCategory,
  Role,
  RoleDashboard,
  RolePermission,
  Task,
  TaskAttachment,
  User,
  UserRole,
} from '@types'

import { availability_logs } from './data/availability_logs'
import { counter_arguments } from './data/counter_arguments'
import { dashboards } from './data/dashboards'
import { permissions } from './data/permissions'
import { platform_disputes } from './data/platform_disputes'
import { platform_rates } from './data/platform_rates'
import { platforms } from './data/platforms'
import { project_members } from './data/project_members'
import { projects } from './data/projects'
import { rejection_categories } from './data/rejection_categories'
import { rejections } from './data/rejections'
import { role_dashboards } from './data/role_dashboards'
import { role_permissions } from './data/role_permissions'
import { roles } from './data/roles'
import { task_attachments } from './data/task_attachments'
import { tasks } from './data/tasks'
import { user_roles } from './data/user_roles'
import { users } from './data/users'

/**
 * Shape of the in-memory mock database. Field names match the table names on
 * the Postgres side (snake_case). Arrays are mutable here because the mock
 * API (next prompt) writes through `seedDb()` instances — the per-file
 * `readonly` arrays are the canonical source the seed copies from.
 */
export interface MockDatabase {
  // Identity / RBAC
  permissions: Permission[]
  dashboards: Dashboard[]
  roles: Role[]
  role_permissions: RolePermission[]
  role_dashboards: RoleDashboard[]
  users: User[]
  user_roles: UserRole[]
  // Org
  platforms: Platform[]
  platform_rates: PlatformRate[]
  projects: Project[]
  project_members: ProjectMember[]
  // Operational
  tasks: Task[]
  task_attachments: TaskAttachment[]
  availability_logs: AvailabilityLog[]
  // Dispute chain
  rejection_categories: RejectionCategory[]
  rejections: Rejection[]
  counter_arguments: CounterArgument[]
  platform_disputes: PlatformDispute[]
}

// The canonical composition. Each table is materialized from its data file
// into a fresh mutable array; `seedDb()` then deep-clones for callers that
// need an isolated copy (tests, the mock API at startup).
const initial: MockDatabase = {
  permissions: [...permissions],
  dashboards: [...dashboards],
  roles: [...roles],
  role_permissions: [...role_permissions],
  role_dashboards: [...role_dashboards],
  users: [...users],
  user_roles: [...user_roles],
  platforms: [...platforms],
  platform_rates: [...platform_rates],
  projects: [...projects],
  project_members: [...project_members],
  tasks: [...tasks],
  task_attachments: [...task_attachments],
  availability_logs: [...availability_logs],
  rejection_categories: [...rejection_categories],
  rejections: [...rejections],
  counter_arguments: [...counter_arguments],
  platform_disputes: [...platform_disputes],
}

/**
 * Returns a deep-cloned, mutation-safe copy of the canonical seed. The mock
 * API uses this at boot and tests use it to reset to a known state without
 * cross-contamination between cases.
 */
export function seedDb(): MockDatabase {
  return structuredClone(initial)
}
