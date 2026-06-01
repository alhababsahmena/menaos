// Public barrel for the shared domain types. Import from `@types` only — do
// not reach into individual files from outside `src/types/`.

export type { ID, ISODate, ISODateTime, Money } from './primitives'

export type {
  AvailabilityStatus,
  Currency,
  DisputeOutcome,
  LeadDecision,
  TaskStatus,
} from './enums'

export type { ApiError, Paginated } from './pagination'

export type {
  Dashboard,
  Permission,
  Role,
  RoleDashboard,
  RolePermission,
  User,
  UserRole,
} from './identity'

export type {
  Platform,
  PlatformRate,
  Project,
  ProjectMember,
} from './org'

export type {
  AvailabilityLog,
  Task,
  TaskAttachment,
} from './operational'

export type {
  CounterArgument,
  PlatformDispute,
  Rejection,
  RejectionCategory,
} from './disputes'

export type { SessionUser } from './session'

export type { EarningsSummary, TaskListItem } from './views'
