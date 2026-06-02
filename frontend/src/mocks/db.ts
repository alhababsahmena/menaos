/**
 * Centralized in-memory MENAOS dataset.
 * The single source of truth for the mock service layer.
 * Every entity is referentially consistent.
 *
 * Components MUST NOT import this directly — only the service layer does.
 */
import type {
  AvailabilityLog,
  CounterArgument,
  DashboardDef,
  Permission,
  PermissionKey,
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
  TaskHistoryEntry,
  User,
  UserRole,
} from "@/types";

const t = (s: string) => new Date(s).toISOString();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const dateAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

// -- Permissions ------------------------------------------------------------

export const permissions: Permission[] = [
  { key: "availability.log", label: "Log availability", group: "Availability" },
  { key: "tasks.create", label: "Submit tasks", group: "Tasks" },
  { key: "tasks.update_status", label: "Update own task status", group: "Tasks" },
  { key: "tasks.review", label: "Review tasks", group: "Tasks" },
  { key: "tasks.view_team", label: "View team tasks", group: "Tasks" },
  { key: "tasks.view_all", label: "View all tasks", group: "Tasks" },
  { key: "disputes.view", label: "View disputes", group: "Disputes" },
  { key: "disputes.decide", label: "Decide counter-arguments", group: "Disputes" },
  { key: "disputes.record_outcome", label: "Record platform outcome", group: "Disputes" },
  { key: "categories.manage", label: "Manage rejection categories", group: "Admin" },
  { key: "users.manage", label: "Manage users", group: "Admin" },
  { key: "roles.manage", label: "Manage roles & permissions", group: "Admin" },
  { key: "projects.manage", label: "Manage projects", group: "Admin" },
  { key: "platforms.manage", label: "Manage platforms & rates", group: "Admin" },
  { key: "financials.view", label: "View financial data", group: "Financials" },
  { key: "dashboard.employee", label: "Open employee dashboard", group: "Dashboards" },
  { key: "dashboard.team_lead", label: "Open team-lead dashboard", group: "Dashboards" },
  { key: "dashboard.management", label: "Open management dashboard", group: "Dashboards" },
  { key: "dashboard.financial", label: "Open financial dashboard", group: "Dashboards" },
];

// -- Roles ------------------------------------------------------------------

export const roles: Role[] = [
  { id: "role-staff", key: "staff", name: "Staff", description: "Submits tasks and logs availability.", is_system: true },
  { id: "role-lead", key: "team_lead", name: "Team Lead", description: "Reviews tasks and decides disputes.", is_system: true },
  { id: "role-admin", key: "admin", name: "Admin", description: "Manages users, roles, projects, platforms.", is_system: true },
  { id: "role-mgmt", key: "management", name: "Management", description: "Cross-org visibility and financials.", is_system: true },
];

const STAFF_PERMS: PermissionKey[] = [
  "availability.log",
  "tasks.create",
  "tasks.update_status",
  "disputes.view",
  "dashboard.employee",
];
const LEAD_PERMS: PermissionKey[] = [
  ...STAFF_PERMS,
  "tasks.review",
  "tasks.view_team",
  "disputes.decide",
  "disputes.record_outcome",
  "dashboard.team_lead",
];
const ADMIN_PERMS: PermissionKey[] = [
  "users.manage",
  "roles.manage",
  "projects.manage",
  "platforms.manage",
  "categories.manage",
  "tasks.view_all",
  "disputes.view",
  "dashboard.employee",
  "dashboard.team_lead",
];
const MGMT_PERMS: PermissionKey[] = [
  "tasks.view_all",
  "disputes.view",
  "financials.view",
  "dashboard.management",
  "dashboard.financial",
];

export const rolePermissions: RolePermission[] = [
  ...STAFF_PERMS.map((p) => ({ role_id: "role-staff", permission_key: p })),
  ...LEAD_PERMS.map((p) => ({ role_id: "role-lead", permission_key: p })),
  ...ADMIN_PERMS.map((p) => ({ role_id: "role-admin", permission_key: p })),
  ...MGMT_PERMS.map((p) => ({ role_id: "role-mgmt", permission_key: p })),
];

// -- Dashboards -------------------------------------------------------------

export const dashboards: DashboardDef[] = [
  { id: "dash-emp", key: "employee", name: "Employee", path: "/dashboard/employee", required_permission: "dashboard.employee" },
  { id: "dash-lead", key: "team_lead", name: "Team Lead", path: "/dashboard/team-lead", required_permission: "dashboard.team_lead" },
  { id: "dash-mgmt", key: "management", name: "Management", path: "/dashboard/management", required_permission: "dashboard.management" },
  { id: "dash-fin", key: "financial", name: "Financial", path: "/dashboard/financial", required_permission: "dashboard.financial" },
];

export const roleDashboards: RoleDashboard[] = [
  { role_id: "role-staff", dashboard_id: "dash-emp" },
  { role_id: "role-lead", dashboard_id: "dash-emp" },
  { role_id: "role-lead", dashboard_id: "dash-lead" },
  { role_id: "role-admin", dashboard_id: "dash-emp" },
  { role_id: "role-admin", dashboard_id: "dash-lead" },
  { role_id: "role-mgmt", dashboard_id: "dash-mgmt" },
  { role_id: "role-mgmt", dashboard_id: "dash-fin" },
];

// -- Users ------------------------------------------------------------------

export const users: User[] = [
  {
    id: "u-layla",
    entra_object_id: "entra-layla",
    email: "layla.haddad@menaos.local",
    first_name: "Layla",
    last_name: "Haddad",
    photo_url: "https://i.pravatar.cc/120?img=47",
    is_active: true,
    created_at: t("2024-09-01"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-omar",
    entra_object_id: "entra-omar",
    email: "omar.khalil@menaos.local",
    first_name: "Omar",
    last_name: "Khalil",
    photo_url: null,
    is_active: true,
    created_at: t("2024-09-01"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-sara",
    entra_object_id: "entra-sara",
    email: "sara.nasser@menaos.local",
    first_name: "Sara",
    last_name: "Nasser",
    photo_url: "https://i.pravatar.cc/120?img=32",
    is_active: true,
    created_at: t("2024-09-15"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-zaid",
    entra_object_id: "entra-zaid",
    email: "zaid.amer@menaos.local",
    first_name: "Zaid",
    last_name: "Amer",
    photo_url: null,
    is_active: true,
    created_at: t("2024-10-01"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-noor",
    entra_object_id: "entra-noor",
    email: "noor.fares@menaos.local",
    first_name: "Noor",
    last_name: "Fares",
    photo_url: "https://i.pravatar.cc/120?img=20",
    is_active: true,
    created_at: t("2024-09-20"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-tariq",
    entra_object_id: "entra-tariq",
    email: "tariq.lead@menaos.local",
    first_name: "Tariq",
    last_name: "Mansour",
    photo_url: "https://i.pravatar.cc/120?img=12",
    is_active: true,
    created_at: t("2024-08-01"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-rania",
    entra_object_id: "entra-rania",
    email: "rania.admin@menaos.local",
    first_name: "Rania",
    last_name: "Odeh",
    photo_url: null,
    is_active: true,
    created_at: t("2024-07-01"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-fadi",
    entra_object_id: "entra-fadi",
    email: "fadi.mgmt@menaos.local",
    first_name: "Fadi",
    last_name: "Halabi",
    photo_url: "https://i.pravatar.cc/120?img=68",
    is_active: true,
    created_at: t("2024-06-01"),
    updated_at: t("2025-01-12"),
  },
  {
    id: "u-deactivated",
    entra_object_id: "entra-old",
    email: "old.staff@menaos.local",
    first_name: "Hala",
    last_name: "Sabbagh",
    photo_url: null,
    is_active: false,
    created_at: t("2024-01-01"),
    updated_at: t("2024-12-01"),
  },
];

export const userRoles: UserRole[] = [
  { id: "ur-1", user_id: "u-layla", role_id: "role-staff", assigned_at: t("2024-09-01"), unassigned_at: null },
  { id: "ur-2", user_id: "u-omar", role_id: "role-staff", assigned_at: t("2024-09-01"), unassigned_at: null },
  { id: "ur-3", user_id: "u-sara", role_id: "role-staff", assigned_at: t("2024-09-15"), unassigned_at: null },
  { id: "ur-4", user_id: "u-zaid", role_id: "role-staff", assigned_at: t("2024-10-01"), unassigned_at: null },
  { id: "ur-5", user_id: "u-noor", role_id: "role-staff", assigned_at: t("2024-09-20"), unassigned_at: null },
  { id: "ur-6", user_id: "u-tariq", role_id: "role-lead", assigned_at: t("2024-08-01"), unassigned_at: null },
  { id: "ur-7", user_id: "u-rania", role_id: "role-admin", assigned_at: t("2024-07-01"), unassigned_at: null },
  { id: "ur-8", user_id: "u-fadi", role_id: "role-mgmt", assigned_at: t("2024-06-01"), unassigned_at: null },
  { id: "ur-9", user_id: "u-deactivated", role_id: "role-staff", assigned_at: t("2024-01-01"), unassigned_at: t("2024-12-01") },
];

// -- Platforms & rates ------------------------------------------------------

export const platforms: Platform[] = [
  { id: "pl-outlier", name: "Outlier", currency: "USD", is_active: true },
  { id: "pl-scale", name: "Scale Tasks", currency: "JOD", is_active: true },
];

export const platformRates: PlatformRate[] = [
  // Outlier — closed window
  { id: "pr-out-1", platform_id: "pl-outlier", rate_per_task: 12.0, effective_from: t("2024-09-01"), effective_to: t("2024-12-31") },
  { id: "pr-out-2", platform_id: "pl-outlier", rate_per_task: 14.5, effective_from: t("2025-01-01"), effective_to: null },
  // Scale — JOD
  { id: "pr-scale-1", platform_id: "pl-scale", rate_per_task: 6.5, effective_from: t("2024-09-01"), effective_to: t("2024-11-30") },
  { id: "pr-scale-2", platform_id: "pl-scale", rate_per_task: 7.25, effective_from: t("2024-12-01"), effective_to: null },
];

// -- Projects & members -----------------------------------------------------

export const projects: Project[] = [
  {
    id: "pj-alpha",
    platform_id: "pl-outlier",
    name: "Alpha Reasoning",
    description: "Outlier reasoning chain quality.",
    started_at: t("2024-09-15"),
    ended_at: null,
    requires_review: true,
    is_active: true,
  },
  {
    id: "pj-beta",
    platform_id: "pl-outlier",
    name: "Beta Coding",
    description: "Code review and rating tasks.",
    started_at: t("2024-10-01"),
    ended_at: null,
    requires_review: false,
    is_active: true,
  },
  {
    id: "pj-gamma",
    platform_id: "pl-scale",
    name: "Gamma Arabic",
    description: "Arabic NLP labeling.",
    started_at: t("2024-09-01"),
    ended_at: null,
    requires_review: true,
    is_active: true,
  },
];

export const projectMembers: ProjectMember[] = [
  { id: "pm-1", project_id: "pj-alpha", user_id: "u-layla", assigned_at: t("2024-09-15"), unassigned_at: null },
  { id: "pm-2", project_id: "pj-alpha", user_id: "u-omar", assigned_at: t("2024-09-15"), unassigned_at: null },
  { id: "pm-3", project_id: "pj-alpha", user_id: "u-tariq", assigned_at: t("2024-09-15"), unassigned_at: null },
  { id: "pm-4", project_id: "pj-beta", user_id: "u-sara", assigned_at: t("2024-10-01"), unassigned_at: null },
  { id: "pm-5", project_id: "pj-beta", user_id: "u-zaid", assigned_at: t("2024-10-01"), unassigned_at: null },
  { id: "pm-6", project_id: "pj-gamma", user_id: "u-noor", assigned_at: t("2024-09-01"), unassigned_at: null },
  { id: "pm-7", project_id: "pj-gamma", user_id: "u-omar", assigned_at: t("2024-10-15"), unassigned_at: null },
  { id: "pm-8", project_id: "pj-gamma", user_id: "u-tariq", assigned_at: t("2024-09-01"), unassigned_at: null },
];

// -- Rejection categories ---------------------------------------------------

export const rejectionCategories: RejectionCategory[] = [
  { id: "rc-quality", name: "Insufficient quality", description: "Output below platform standards.", is_active: true },
  { id: "rc-instructions", name: "Did not follow instructions", description: "Failed to follow task guidance.", is_active: true },
  { id: "rc-format", name: "Wrong output format", description: "Structural format issues.", is_active: true },
  { id: "rc-duplicate", name: "Duplicate submission", description: "Already submitted previously.", is_active: true },
  { id: "rc-legacy", name: "Legacy: vague feedback", description: "Deprecated catch-all.", is_active: false },
];

// -- Tasks (every state covered) -------------------------------------------

export const tasks: Task[] = [
  // 1. pending — submitted, awaiting review (requires_review project)
  {
    id: "tk-1", project_id: "pj-alpha", submitted_by: "u-layla",
    external_task_id: "ALP-1042", description: "Multi-step reasoning chain for math problem.",
    notes: "Spent extra time on verification.", time_spent_hours: 1.5,
    status: "pending", reviewed_by: null, reviewed_at: null,
    rate_id: "pr-out-2", rate_snapshot: 14.5,
    submitted_at: daysAgo(1), platform_submitted_at: null, escalated_at: null, accepted_at: null,
    version: 1, created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  // 2. pending — already reviewed, awaiting platform decision
  {
    id: "tk-2", project_id: "pj-alpha", submitted_by: "u-omar",
    external_task_id: "ALP-1043", description: "Coding reasoning trace.", time_spent_hours: 2.0,
    status: "pending", reviewed_by: "u-tariq", reviewed_at: daysAgo(2),
    rate_id: "pr-out-2", rate_snapshot: 14.5,
    submitted_at: daysAgo(3), platform_submitted_at: daysAgo(2), escalated_at: null, accepted_at: null,
    version: 2, created_at: daysAgo(3), updated_at: daysAgo(2),
  },
  // 3. accepted — counted toward earnings
  {
    id: "tk-3", project_id: "pj-beta", submitted_by: "u-sara",
    external_task_id: "BET-300", description: "Rate code response quality.", time_spent_hours: 0.75,
    status: "accepted", reviewed_by: null, reviewed_at: null,
    rate_id: "pr-out-2", rate_snapshot: 14.5,
    submitted_at: daysAgo(6), platform_submitted_at: daysAgo(6), escalated_at: null, accepted_at: daysAgo(4),
    version: 2, created_at: daysAgo(6), updated_at: daysAgo(4),
  },
  {
    id: "tk-4", project_id: "pj-beta", submitted_by: "u-zaid",
    external_task_id: "BET-301", description: "Rate code response quality.", time_spent_hours: 0.5,
    status: "accepted", reviewed_by: null, reviewed_at: null,
    rate_id: "pr-out-2", rate_snapshot: 14.5,
    submitted_at: daysAgo(5), platform_submitted_at: daysAgo(5), escalated_at: null, accepted_at: daysAgo(3),
    version: 2, created_at: daysAgo(5), updated_at: daysAgo(3),
  },
  {
    id: "tk-5", project_id: "pj-gamma", submitted_by: "u-noor",
    external_task_id: "GAM-77", description: "Arabic dialect labeling batch A.", time_spent_hours: 1.25,
    status: "accepted", reviewed_by: "u-tariq", reviewed_at: daysAgo(7),
    rate_id: "pr-scale-2", rate_snapshot: 7.25,
    submitted_at: daysAgo(8), platform_submitted_at: daysAgo(7), escalated_at: null, accepted_at: daysAgo(5),
    version: 3, created_at: daysAgo(8), updated_at: daysAgo(5),
  },
  // 6. rejected, no counter yet
  {
    id: "tk-6", project_id: "pj-gamma", submitted_by: "u-omar",
    external_task_id: "GAM-78", description: "Arabic dialect labeling batch B.", time_spent_hours: 1.0,
    status: "rejected", reviewed_by: "u-tariq", reviewed_at: daysAgo(4),
    rate_id: "pr-scale-2", rate_snapshot: 7.25,
    submitted_at: daysAgo(5), platform_submitted_at: daysAgo(4), escalated_at: null, accepted_at: null,
    version: 3, created_at: daysAgo(5), updated_at: daysAgo(2),
  },
  // 7. rejected → counter rejected by TL (terminal)
  {
    id: "tk-7", project_id: "pj-alpha", submitted_by: "u-layla",
    external_task_id: "ALP-998", description: "Reasoning trace v2.", time_spent_hours: 1.75,
    status: "rejected", reviewed_by: "u-tariq", reviewed_at: daysAgo(10),
    rate_id: "pr-out-1", rate_snapshot: 12.0,
    submitted_at: daysAgo(12), platform_submitted_at: daysAgo(10), escalated_at: null, accepted_at: null,
    version: 4, created_at: daysAgo(12), updated_at: daysAgo(7),
  },
  // 8. escalated → platform dispute pending
  {
    id: "tk-8", project_id: "pj-alpha", submitted_by: "u-omar",
    external_task_id: "ALP-1001", description: "Edge-case math chain.", time_spent_hours: 2.5,
    status: "escalated", reviewed_by: "u-tariq", reviewed_at: daysAgo(9),
    rate_id: "pr-out-1", rate_snapshot: 12.0,
    submitted_at: daysAgo(11), platform_submitted_at: daysAgo(9), escalated_at: daysAgo(6), accepted_at: null,
    version: 5, created_at: daysAgo(11), updated_at: daysAgo(6),
  },
  // 9. rejected → counter → escalated → dispute WON (now accepted)
  {
    id: "tk-9", project_id: "pj-beta", submitted_by: "u-sara",
    external_task_id: "BET-200", description: "Code response rating w/ rationale.", time_spent_hours: 1.0,
    status: "accepted", reviewed_by: null, reviewed_at: null,
    rate_id: "pr-out-1", rate_snapshot: 12.0,
    submitted_at: daysAgo(20), platform_submitted_at: daysAgo(19), escalated_at: daysAgo(15), accepted_at: daysAgo(10),
    version: 7, created_at: daysAgo(20), updated_at: daysAgo(10),
  },
  // 10. rejected → counter → escalated → dispute LOST (stays rejected)
  {
    id: "tk-10", project_id: "pj-gamma", submitted_by: "u-noor",
    external_task_id: "GAM-50", description: "Arabic NER batch.", time_spent_hours: 1.5,
    status: "rejected", reviewed_by: "u-tariq", reviewed_at: daysAgo(18),
    rate_id: "pr-scale-1", rate_snapshot: 6.5,
    submitted_at: daysAgo(22), platform_submitted_at: daysAgo(20), escalated_at: daysAgo(14), accepted_at: null,
    version: 7, created_at: daysAgo(22), updated_at: daysAgo(9),
  },
  // a few more accepted for richer charts
  {
    id: "tk-11", project_id: "pj-beta", submitted_by: "u-sara",
    external_task_id: "BET-310", description: "Rate code response.", time_spent_hours: 0.5,
    status: "accepted", reviewed_by: null, reviewed_at: null,
    rate_id: "pr-out-2", rate_snapshot: 14.5,
    submitted_at: daysAgo(2), platform_submitted_at: daysAgo(2), escalated_at: null, accepted_at: daysAgo(1),
    version: 2, created_at: daysAgo(2), updated_at: daysAgo(1),
  },
  {
    id: "tk-12", project_id: "pj-gamma", submitted_by: "u-noor",
    external_task_id: "GAM-90", description: "Labeling batch C.", time_spent_hours: 1.0,
    status: "accepted", reviewed_by: "u-tariq", reviewed_at: daysAgo(2),
    rate_id: "pr-scale-2", rate_snapshot: 7.25,
    submitted_at: daysAgo(3), platform_submitted_at: daysAgo(2), escalated_at: null, accepted_at: daysAgo(1),
    version: 3, created_at: daysAgo(3), updated_at: daysAgo(1),
  },
];

export const taskAttachments: TaskAttachment[] = [
  {
    id: "att-1", task_id: "tk-1", uploaded_by: "u-layla",
    file_name: "reasoning-notes.pdf", file_type: "application/pdf",
    file_size_bytes: 184_320,
    storage_url: "https://mock-storage.local/signed/att-1?sig=mock-sig-abcd",
    uploaded_at: daysAgo(1),
  },
  {
    id: "att-2", task_id: "tk-8", uploaded_by: "u-omar",
    file_name: "context.png", file_type: "image/png",
    file_size_bytes: 51_240,
    storage_url: "https://mock-storage.local/signed/att-2?sig=mock-sig-efgh",
    uploaded_at: daysAgo(11),
  },
];

export const taskHistory: TaskHistoryEntry[] = [
  { id: "th-1", task_id: "tk-1", actor_id: "u-layla", at: daysAgo(1), kind: "created", note: "Task submitted." },
  { id: "th-2", task_id: "tk-3", actor_id: "u-sara", at: daysAgo(6), kind: "created" },
  { id: "th-3", task_id: "tk-3", actor_id: "u-sara", at: daysAgo(4), kind: "status_change", from_value: "pending", to_value: "accepted" },
  { id: "th-4", task_id: "tk-6", actor_id: "u-omar", at: daysAgo(5), kind: "created" },
  { id: "th-5", task_id: "tk-6", actor_id: "u-omar", at: daysAgo(2), kind: "status_change", from_value: "pending", to_value: "rejected" },
  { id: "th-6", task_id: "tk-1", actor_id: "u-layla", at: daysAgo(1), kind: "correction", from_value: "time_spent_hours=1.0", to_value: "time_spent_hours=1.5", note: "Forgot to count verification time." },
];

// -- Availability (a week of logs) -----------------------------------------

const STAFF_IDS = ["u-layla", "u-omar", "u-sara", "u-zaid", "u-noor"];

export const availabilityLogs: AvailabilityLog[] = (() => {
  const out: AvailabilityLog[] = [];
  let n = 1;
  for (let d = 0; d < 7; d++) {
    for (const uid of STAFF_IDS) {
      const r = (d + uid.length) % 5;
      const status =
        r === 0 ? "absent" : r === 4 ? "blocked" : "active";
      const note =
        status === "absent" ? "Sick leave"
          : status === "blocked" ? "Platform issue, blocked from queue"
          : undefined;
      out.push({
        id: `al-${n++}`,
        user_id: uid,
        log_date: dateAgo(d),
        status,
        note,
        created_at: daysAgo(d),
      });
    }
  }
  return out;
})();

// -- Dispute chain ----------------------------------------------------------

// tk-6: rejected, no counter yet — only rejection
// tk-7: rejected → counter REJECTED by TL (terminal)
// tk-8: rejected → counter → ESCALATED → dispute PENDING
// tk-9: rejected → counter → ESCALATED → dispute WON (task accepted)
// tk-10: rejected → counter → ESCALATED → dispute LOST (task rejected)

export const rejections: Rejection[] = [
  { id: "rj-6", task_id: "tk-6", category_id: "rc-quality", feedback: "Output didn't meet rubric on two dimensions.", rejected_at: daysAgo(4) },
  { id: "rj-7", task_id: "tk-7", category_id: "rc-instructions", feedback: "Did not follow the rationale formatting guide.", rejected_at: daysAgo(10) },
  { id: "rj-8", task_id: "tk-8", category_id: "rc-quality", feedback: "Edge case handling weak.", rejected_at: daysAgo(9) },
  { id: "rj-9", task_id: "tk-9", category_id: "rc-format", feedback: "Format flag was wrong.", rejected_at: daysAgo(19) },
  { id: "rj-10", task_id: "tk-10", category_id: "rc-quality", feedback: "Entity tags inconsistent.", rejected_at: daysAgo(20) },
];

export const counterArguments: CounterArgument[] = [
  { id: "ca-7", rejection_id: "rj-7", argument: "Rubric ambiguous on rationale length.", lead_decision: "rejected", reviewed_by: "u-tariq", created_at: daysAgo(9), decided_at: daysAgo(7) },
  { id: "ca-8", rejection_id: "rj-8", argument: "Edge case is out of spec scope — escalating.", lead_decision: "escalated", reviewed_by: "u-tariq", created_at: daysAgo(8), decided_at: daysAgo(6) },
  { id: "ca-9", rejection_id: "rj-9", argument: "Format was correct per latest update.", lead_decision: "escalated", reviewed_by: "u-tariq", created_at: daysAgo(18), decided_at: daysAgo(15) },
  { id: "ca-10", rejection_id: "rj-10", argument: "Annotator guide allows variant tags.", lead_decision: "escalated", reviewed_by: "u-tariq", created_at: daysAgo(17), decided_at: daysAgo(14) },
];

export const platformDisputes: PlatformDispute[] = [
  { id: "pd-8", counter_argument_id: "ca-8", outcome: "pending", recorded_by: "u-tariq", submitted_at: daysAgo(6), resolved_at: null },
  { id: "pd-9", counter_argument_id: "ca-9", outcome: "won", recorded_by: "u-tariq", submitted_at: daysAgo(15), resolved_at: daysAgo(10), platform_notes: "Reinstated after review." },
  { id: "pd-10", counter_argument_id: "ca-10", outcome: "lost", recorded_by: "u-tariq", submitted_at: daysAgo(14), resolved_at: daysAgo(9), platform_notes: "Original decision upheld." },
];

// -- Mutable DB wrapper -----------------------------------------------------

export const db = {
  permissions,
  roles,
  rolePermissions,
  dashboards,
  roleDashboards,
  users,
  userRoles,
  platforms,
  platformRates,
  projects,
  projectMembers,
  rejectionCategories,
  tasks,
  taskAttachments,
  taskHistory,
  availabilityLogs,
  rejections,
  counterArguments,
  platformDisputes,
};

export const utils = { now, today, daysAgo, dateAgo };
