import type { Permission } from '@types'

// Permission IDs use the `00000000-0001-…` namespace. Exported by name so
// other tables (role_permissions, role_dashboards) reference them safely
// instead of inlining string literals.

export const PERMISSION_TASKS_LIST = '00000000-0001-4000-9000-000000000001'
export const PERMISSION_TASKS_VIEW = '00000000-0001-4000-9000-000000000002'
export const PERMISSION_TASKS_SUBMIT = '00000000-0001-4000-9000-000000000003'
export const PERMISSION_TASKS_EDIT = '00000000-0001-4000-9000-000000000004'
export const PERMISSION_TASKS_DELETE = '00000000-0001-4000-9000-000000000005'
export const PERMISSION_TASKS_REVIEW = '00000000-0001-4000-9000-000000000006'
export const PERMISSION_TASKS_ACCEPT = '00000000-0001-4000-9000-000000000007'
export const PERMISSION_TASKS_REJECT = '00000000-0001-4000-9000-000000000008'
export const PERMISSION_TASKS_ESCALATE = '00000000-0001-4000-9000-000000000009'

export const PERMISSION_PROJECTS_LIST = '00000000-0001-4000-9000-00000000000a'
export const PERMISSION_PROJECTS_VIEW = '00000000-0001-4000-9000-00000000000b'
export const PERMISSION_PROJECTS_CREATE = '00000000-0001-4000-9000-00000000000c'
export const PERMISSION_PROJECTS_EDIT = '00000000-0001-4000-9000-00000000000d'
export const PERMISSION_PROJECTS_DELETE = '00000000-0001-4000-9000-00000000000e'
export const PERMISSION_PROJECTS_MANAGE_MEMBERS = '00000000-0001-4000-9000-00000000000f'

export const PERMISSION_USERS_LIST = '00000000-0001-4000-9000-000000000010'
export const PERMISSION_USERS_VIEW = '00000000-0001-4000-9000-000000000011'
export const PERMISSION_USERS_CREATE = '00000000-0001-4000-9000-000000000012'
export const PERMISSION_USERS_EDIT = '00000000-0001-4000-9000-000000000013'
export const PERMISSION_USERS_DEACTIVATE = '00000000-0001-4000-9000-000000000014'

export const PERMISSION_ROLES_LIST = '00000000-0001-4000-9000-000000000015'
export const PERMISSION_ROLES_VIEW = '00000000-0001-4000-9000-000000000016'
export const PERMISSION_ROLES_CREATE = '00000000-0001-4000-9000-000000000017'
export const PERMISSION_ROLES_EDIT = '00000000-0001-4000-9000-000000000018'
export const PERMISSION_ROLES_ASSIGN = '00000000-0001-4000-9000-000000000019'

export const PERMISSION_PLATFORMS_LIST = '00000000-0001-4000-9000-00000000001a'
export const PERMISSION_PLATFORMS_VIEW = '00000000-0001-4000-9000-00000000001b'
export const PERMISSION_PLATFORMS_CREATE = '00000000-0001-4000-9000-00000000001c'
export const PERMISSION_PLATFORMS_EDIT = '00000000-0001-4000-9000-00000000001d'
export const PERMISSION_PLATFORMS_SET_RATE = '00000000-0001-4000-9000-00000000001e'

export const PERMISSION_FINANCIALS_VIEW = '00000000-0001-4000-9000-00000000001f'

export const PERMISSION_DISPUTES_LIST = '00000000-0001-4000-9000-000000000020'
export const PERMISSION_DISPUTES_VIEW = '00000000-0001-4000-9000-000000000021'
export const PERMISSION_DISPUTES_FILE = '00000000-0001-4000-9000-000000000022'
export const PERMISSION_DISPUTES_COUNTER = '00000000-0001-4000-9000-000000000023'
export const PERMISSION_DISPUTES_ESCALATE = '00000000-0001-4000-9000-000000000024'
export const PERMISSION_DISPUTES_MANAGE = '00000000-0001-4000-9000-000000000025'

export const PERMISSION_REVIEWS_LIST = '00000000-0001-4000-9000-000000000026'
export const PERMISSION_REVIEWS_VIEW = '00000000-0001-4000-9000-000000000027'
export const PERMISSION_REVIEWS_PERFORM = '00000000-0001-4000-9000-000000000028'

export const PERMISSION_AVAILABILITY_VIEW = '00000000-0001-4000-9000-000000000029'
export const PERMISSION_AVAILABILITY_LOG = '00000000-0001-4000-9000-00000000002a'

export const permissions: readonly Permission[] = [
  { id: PERMISSION_TASKS_LIST, key: 'tasks.list', label: 'List tasks', description: 'Browse the task index.' },
  { id: PERMISSION_TASKS_VIEW, key: 'tasks.view', label: 'View task', description: 'Open a task detail page.' },
  { id: PERMISSION_TASKS_SUBMIT, key: 'tasks.submit', label: 'Submit task', description: 'Create and submit a task for review.' },
  { id: PERMISSION_TASKS_EDIT, key: 'tasks.edit', label: 'Edit task', description: 'Edit task fields before review.' },
  { id: PERMISSION_TASKS_DELETE, key: 'tasks.delete', label: 'Delete task', description: 'Soft-delete a task.' },
  { id: PERMISSION_TASKS_REVIEW, key: 'tasks.review', label: 'Review task', description: 'Open a task in the lead review queue.' },
  { id: PERMISSION_TASKS_ACCEPT, key: 'tasks.accept', label: 'Accept task', description: 'Mark a task accepted and forward to the platform.' },
  { id: PERMISSION_TASKS_REJECT, key: 'tasks.reject', label: 'Reject task', description: 'Reject a task with a category and reason.' },
  { id: PERMISSION_TASKS_ESCALATE, key: 'tasks.escalate', label: 'Escalate task', description: 'Escalate a task directly to the platform.' },

  { id: PERMISSION_PROJECTS_LIST, key: 'projects.list', label: 'List projects', description: null },
  { id: PERMISSION_PROJECTS_VIEW, key: 'projects.view', label: 'View project', description: null },
  { id: PERMISSION_PROJECTS_CREATE, key: 'projects.create', label: 'Create project', description: null },
  { id: PERMISSION_PROJECTS_EDIT, key: 'projects.edit', label: 'Edit project', description: null },
  { id: PERMISSION_PROJECTS_DELETE, key: 'projects.delete', label: 'Delete project', description: null },
  { id: PERMISSION_PROJECTS_MANAGE_MEMBERS, key: 'projects.manage_members', label: 'Manage project members', description: 'Add or remove project members.' },

  { id: PERMISSION_USERS_LIST, key: 'users.list', label: 'List users', description: null },
  { id: PERMISSION_USERS_VIEW, key: 'users.view', label: 'View user', description: null },
  { id: PERMISSION_USERS_CREATE, key: 'users.create', label: 'Create user', description: null },
  { id: PERMISSION_USERS_EDIT, key: 'users.edit', label: 'Edit user', description: null },
  { id: PERMISSION_USERS_DEACTIVATE, key: 'users.deactivate', label: 'Deactivate user', description: 'Soft-remove a user from the org.' },

  { id: PERMISSION_ROLES_LIST, key: 'roles.list', label: 'List roles', description: null },
  { id: PERMISSION_ROLES_VIEW, key: 'roles.view', label: 'View role', description: null },
  { id: PERMISSION_ROLES_CREATE, key: 'roles.create', label: 'Create role', description: null },
  { id: PERMISSION_ROLES_EDIT, key: 'roles.edit', label: 'Edit role', description: null },
  { id: PERMISSION_ROLES_ASSIGN, key: 'roles.assign', label: 'Assign role', description: 'Grant or revoke a role on a user.' },

  { id: PERMISSION_PLATFORMS_LIST, key: 'platforms.list', label: 'List platforms', description: null },
  { id: PERMISSION_PLATFORMS_VIEW, key: 'platforms.view', label: 'View platform', description: null },
  { id: PERMISSION_PLATFORMS_CREATE, key: 'platforms.create', label: 'Create platform', description: null },
  { id: PERMISSION_PLATFORMS_EDIT, key: 'platforms.edit', label: 'Edit platform', description: null },
  { id: PERMISSION_PLATFORMS_SET_RATE, key: 'platforms.set_rate', label: 'Set platform rate', description: 'Open a new rate window on a platform.' },

  { id: PERMISSION_FINANCIALS_VIEW, key: 'financials.view', label: 'View financials', description: 'Open earnings and payout reports.' },

  { id: PERMISSION_DISPUTES_LIST, key: 'disputes.list', label: 'List disputes', description: null },
  { id: PERMISSION_DISPUTES_VIEW, key: 'disputes.view', label: 'View dispute', description: null },
  { id: PERMISSION_DISPUTES_FILE, key: 'disputes.file', label: 'File rejection', description: 'Open a rejection on a task.' },
  { id: PERMISSION_DISPUTES_COUNTER, key: 'disputes.counter', label: 'Submit counter-argument', description: 'Submit a counter to a rejection.' },
  { id: PERMISSION_DISPUTES_ESCALATE, key: 'disputes.escalate', label: 'Escalate dispute', description: 'Escalate a counter-argument to the platform.' },
  { id: PERMISSION_DISPUTES_MANAGE, key: 'disputes.manage', label: 'Manage disputes', description: 'Resolve platform-side dispute outcomes.' },

  { id: PERMISSION_REVIEWS_LIST, key: 'reviews.list', label: 'List reviews', description: null },
  { id: PERMISSION_REVIEWS_VIEW, key: 'reviews.view', label: 'View review', description: null },
  { id: PERMISSION_REVIEWS_PERFORM, key: 'reviews.perform', label: 'Perform review', description: 'Take ownership of a queued review.' },

  { id: PERMISSION_AVAILABILITY_VIEW, key: 'availability.view', label: 'View availability', description: 'See team availability logs.' },
  { id: PERMISSION_AVAILABILITY_LOG, key: 'availability.log', label: 'Log availability', description: 'Record my own availability transitions.' },
]
