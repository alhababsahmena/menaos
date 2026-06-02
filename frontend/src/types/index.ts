// MENAOS domain types. These mirror the planned Django/DRF backend schema.

export type ID = string;
export type ISO = string; // ISO 8601 timestamp
export type Currency = "JOD" | "USD";

export type TaskStatus = "pending" | "accepted" | "rejected" | "escalated";
export type CounterDecision = "pending" | "rejected" | "escalated";
export type DisputeOutcome = "pending" | "won" | "lost";
export type AvailabilityStatus = "active" | "absent" | "blocked";

export interface User {
  id: ID;
  entra_object_id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  is_active: boolean;
  created_at: ISO;
  updated_at: ISO;
}

export type PermissionKey =
  | "tasks.create"
  | "tasks.review"
  | "tasks.update_status"
  | "tasks.view_team"
  | "tasks.view_all"
  | "disputes.view"
  | "disputes.decide"
  | "disputes.record_outcome"
  | "categories.manage"
  | "users.manage"
  | "roles.manage"
  | "projects.manage"
  | "platforms.manage"
  | "financials.view"
  | "availability.log"
  | "dashboard.employee"
  | "dashboard.team_lead"
  | "dashboard.management"
  | "dashboard.financial";

export interface Permission {
  key: PermissionKey;
  label: string;
  group: string;
}

export interface Role {
  id: ID;
  key: "staff" | "team_lead" | "admin" | "management";
  name: string;
  description: string;
  is_system: boolean;
}

export interface RolePermission {
  role_id: ID;
  permission_key: PermissionKey;
}

export interface UserRole {
  id: ID;
  user_id: ID;
  role_id: ID;
  assigned_at: ISO;
  unassigned_at: ISO | null; // soft-removal
}

export interface DashboardDef {
  id: ID;
  key: "employee" | "team_lead" | "management" | "financial";
  name: string;
  path: string;
  required_permission: PermissionKey;
}

export interface RoleDashboard {
  role_id: ID;
  dashboard_id: ID;
}

export interface Platform {
  id: ID;
  name: string;
  currency: Currency;
  is_active: boolean;
}

export interface PlatformRate {
  id: ID;
  platform_id: ID;
  rate_per_task: number;
  effective_from: ISO;
  effective_to: ISO | null; // null = current
}

export interface Project {
  id: ID;
  platform_id: ID;
  name: string;
  description?: string;
  started_at: ISO;
  ended_at: ISO | null;
  requires_review: boolean;
  is_active: boolean;
}

export interface ProjectMember {
  id: ID;
  project_id: ID;
  user_id: ID;
  assigned_at: ISO;
  unassigned_at: ISO | null;
}

export interface TaskAttachment {
  id: ID;
  task_id: ID;
  uploaded_by: ID;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_url: string; // opaque signed URL
  uploaded_at: ISO;
}

export interface Task {
  id: ID;
  project_id: ID;
  submitted_by: ID;
  external_task_id: string;
  description: string;
  notes?: string;
  time_spent_hours: number;
  status: TaskStatus;
  reviewed_by: ID | null;
  reviewed_at: ISO | null;
  rate_id: ID;
  rate_snapshot: number; // frozen at submission, in platform currency
  submitted_at: ISO;
  platform_submitted_at: ISO | null;
  escalated_at: ISO | null;
  accepted_at: ISO | null; // derived; mocked here, real in backend
  version: number; // optimistic-lock counter
  created_at: ISO;
  updated_at: ISO;
}

export interface TaskHistoryEntry {
  id: ID;
  task_id: ID;
  actor_id: ID;
  at: ISO;
  kind:
    | "created"
    | "status_change"
    | "correction"
    | "review"
    | "rejection_logged"
    | "counter_argument"
    | "lead_decision"
    | "platform_outcome";
  from_value?: string;
  to_value?: string;
  note?: string;
}

export interface AvailabilityLog {
  id: ID;
  user_id: ID;
  log_date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  note?: string;
  created_at: ISO;
}

export interface RejectionCategory {
  id: ID;
  name: string;
  description?: string;
  is_active: boolean; // soft-deprecate
}

export interface Rejection {
  id: ID;
  task_id: ID;
  category_id: ID;
  feedback: string;
  rejected_at: ISO;
}

export interface CounterArgument {
  id: ID;
  rejection_id: ID;
  argument: string;
  lead_decision: CounterDecision;
  reviewed_by: ID | null;
  created_at: ISO;
  decided_at: ISO | null;
}

export interface PlatformDispute {
  id: ID;
  counter_argument_id: ID;
  outcome: DisputeOutcome;
  recorded_by: ID | null;
  submitted_at: ISO;
  resolved_at: ISO | null;
  platform_notes?: string;
}

export interface Session {
  user: User;
  roles: Role[];
  permissionKeys: PermissionKey[];
  dashboards: DashboardDef[];
}

export interface DashboardFilterValues {
  from?: string;
  to?: string;
  projectId?: ID;
  platformId?: ID;
  employeeId?: ID;
}
