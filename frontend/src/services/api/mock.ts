/**
 * Mock API implementation. All business rules from STRUCTURE.md are enforced here,
 * not in the UI — so flipping VITE_USE_MOCKS to false (and pointing at the real
 * Django REST API) keeps the front-end behaviour identical.
 */
import { db, utils } from "@/mocks/db";
import type {
  AvailabilityLog,
  AvailabilityStatus,
  CounterDecision,
  Currency,
  DashboardDef,
  DashboardFilterValues,
  DisputeOutcome,
  ID,
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
  Session,
  Task,
  TaskAttachment,
  TaskHistoryEntry,
  TaskStatus,
  User,
  CounterArgument,
} from "@/types";
import { ConflictError, NotFoundError, ValidationError } from "./errors";

const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));

// ===== Auth / Session ======================================================

function resolveSession(userId: ID): Session {
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new NotFoundError("User not found");
  const activeRoleIds = db.userRoles
    .filter((ur) => ur.user_id === user.id && ur.unassigned_at == null)
    .map((ur) => ur.role_id);
  const roles = db.roles.filter((r) => activeRoleIds.includes(r.id));
  const permissionKeys = Array.from(
    new Set(
      db.rolePermissions
        .filter((rp) => activeRoleIds.includes(rp.role_id))
        .map((rp) => rp.permission_key),
    ),
  );
  const dashIds = Array.from(
    new Set(
      db.roleDashboards
        .filter((rd) => activeRoleIds.includes(rd.role_id))
        .map((rd) => rd.dashboard_id),
    ),
  );
  const dashboards = db.dashboards
    .filter((d) => dashIds.includes(d.id))
    .filter((d) => permissionKeys.includes(d.required_permission));
  return { user, roles, permissionKeys, dashboards };
}

export const authApi = {
  /** Mock SSO login: pick a user (in real life, Entra OIDC returns the entra_object_id). */
  async signInAs(userId: ID): Promise<Session> {
    await wait();
    return resolveSession(userId);
  },
  /** Resolve a session from a known user id (used after rehydration). */
  async getSession(userId: ID): Promise<Session> {
    await wait(40);
    return resolveSession(userId);
  },
};

// ===== Users / Roles =======================================================

export const usersApi = {
  async list(): Promise<User[]> { await wait(40); return [...db.users]; },
  async get(id: ID): Promise<User> {
    const u = db.users.find((x) => x.id === id);
    if (!u) throw new NotFoundError();
    return u;
  },
  async setActive(id: ID, isActive: boolean): Promise<User> {
    await wait();
    const u = db.users.find((x) => x.id === id);
    if (!u) throw new NotFoundError();
    u.is_active = isActive;
    u.updated_at = utils.now();
    return u;
  },
  async update(id: ID, patch: Partial<Pick<User, "first_name" | "last_name" | "photo_url" | "email">>): Promise<User> {
    await wait();
    const u = db.users.find((x) => x.id === id);
    if (!u) throw new NotFoundError();
    Object.assign(u, patch, { updated_at: utils.now() });
    return u;
  },
  async create(input: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    await wait();
    const u: User = { ...input, id: uid("u"), created_at: utils.now(), updated_at: utils.now() };
    db.users.push(u);
    return u;
  },
  async assignRole(userId: ID, roleId: ID): Promise<void> {
    await wait();
    const existing = db.userRoles.find((ur) => ur.user_id === userId && ur.role_id === roleId && ur.unassigned_at == null);
    if (existing) return;
    db.userRoles.push({ id: uid("ur"), user_id: userId, role_id: roleId, assigned_at: utils.now(), unassigned_at: null });
  },
  async unassignRole(userId: ID, roleId: ID): Promise<void> {
    await wait();
    const ur = db.userRoles.find((x) => x.user_id === userId && x.role_id === roleId && x.unassigned_at == null);
    if (ur) ur.unassigned_at = utils.now();
  },
  async rolesFor(userId: ID): Promise<Role[]> {
    await wait(20);
    const ids = db.userRoles.filter((ur) => ur.user_id === userId && ur.unassigned_at == null).map((ur) => ur.role_id);
    return db.roles.filter((r) => ids.includes(r.id));
  },
};

export const rolesApi = {
  async list(): Promise<Role[]> { await wait(20); return [...db.roles]; },
  async listPermissions(): Promise<Permission[]> { await wait(20); return [...db.permissions]; },
  async permissionsFor(roleId: ID): Promise<PermissionKey[]> {
    await wait(20);
    return db.rolePermissions.filter((rp) => rp.role_id === roleId).map((rp) => rp.permission_key);
  },
  async setPermissions(roleId: ID, keys: PermissionKey[]): Promise<void> {
    await wait();
    for (let i = db.rolePermissions.length - 1; i >= 0; i--) {
      if (db.rolePermissions[i].role_id === roleId) db.rolePermissions.splice(i, 1);
    }
    for (const k of keys) db.rolePermissions.push({ role_id: roleId, permission_key: k });
  },
  async listDashboards(): Promise<DashboardDef[]> { await wait(20); return [...db.dashboards]; },
  async dashboardsFor(roleId: ID): Promise<ID[]> {
    await wait(20);
    return db.roleDashboards.filter((rd) => rd.role_id === roleId).map((rd) => rd.dashboard_id);
  },
  async setDashboards(roleId: ID, dashboardIds: ID[]): Promise<void> {
    await wait();
    for (let i = db.roleDashboards.length - 1; i >= 0; i--) {
      if (db.roleDashboards[i].role_id === roleId) db.roleDashboards.splice(i, 1);
    }
    for (const d of dashboardIds) db.roleDashboards.push({ role_id: roleId, dashboard_id: d });
  },
};

// ===== Platforms / rates ===================================================

export const platformsApi = {
  async list(): Promise<Platform[]> { await wait(20); return [...db.platforms]; },
  async listWithRates(): Promise<(Platform & { rates: PlatformRate[] })[]> {
    await wait(20);
    return db.platforms.map((p) => ({
      ...p,
      rates: db.platformRates
        .filter((r) => r.platform_id === p.id)
        .sort((a, b) => a.effective_from.localeCompare(b.effective_from)),
    }));
  },
  async activeRate(platformId: ID): Promise<PlatformRate | null> {
    const rates = db.platformRates.filter((r) => r.platform_id === platformId && r.effective_to == null);
    return rates[0] ?? null;
  },
  async create(input: Omit<Platform, "id">): Promise<Platform> {
    await wait();
    const p: Platform = { ...input, id: uid("pl") };
    db.platforms.push(p);
    return p;
  },
  async setActive(id: ID, active: boolean): Promise<Platform> {
    await wait();
    const p = db.platforms.find((x) => x.id === id);
    if (!p) throw new NotFoundError();
    p.is_active = active;
    return p;
  },
  async addRate(platformId: ID, rate_per_task: number, effective_from: string): Promise<PlatformRate> {
    await wait();
    if (!db.platforms.find((p) => p.id === platformId)) throw new NotFoundError("Platform not found");
    // close the current open window
    const open = db.platformRates.find((r) => r.platform_id === platformId && r.effective_to == null);
    if (open) {
      if (effective_from <= open.effective_from)
        throw new ValidationError("New rate must start after the current rate's effective_from.");
      open.effective_to = effective_from;
    }
    const r: PlatformRate = {
      id: uid("pr"),
      platform_id: platformId,
      rate_per_task,
      effective_from,
      effective_to: null,
    };
    db.platformRates.push(r);
    return r;
  },
};

// ===== Projects ============================================================

export const projectsApi = {
  async list(): Promise<Project[]> { await wait(20); return [...db.projects]; },
  async get(id: ID): Promise<Project> {
    const p = db.projects.find((x) => x.id === id);
    if (!p) throw new NotFoundError();
    return p;
  },
  async forUser(userId: ID): Promise<Project[]> {
    await wait(20);
    const ids = db.projectMembers
      .filter((m) => m.user_id === userId && m.unassigned_at == null)
      .map((m) => m.project_id);
    return db.projects.filter((p) => ids.includes(p.id) && p.is_active);
  },
  async create(input: Omit<Project, "id">): Promise<Project> {
    await wait();
    const p: Project = { ...input, id: uid("pj") };
    db.projects.push(p);
    return p;
  },
  async update(id: ID, patch: Partial<Project>): Promise<Project> {
    await wait();
    const p = db.projects.find((x) => x.id === id);
    if (!p) throw new NotFoundError();
    Object.assign(p, patch);
    return p;
  },
  async members(projectId: ID): Promise<(ProjectMember & { user: User })[]> {
    await wait(20);
    return db.projectMembers
      .filter((m) => m.project_id === projectId)
      .map((m) => ({ ...m, user: db.users.find((u) => u.id === m.user_id)! }));
  },
  async assignMember(projectId: ID, userId: ID): Promise<void> {
    await wait();
    const ex = db.projectMembers.find((m) => m.project_id === projectId && m.user_id === userId && m.unassigned_at == null);
    if (ex) return;
    db.projectMembers.push({ id: uid("pm"), project_id: projectId, user_id: userId, assigned_at: utils.now(), unassigned_at: null });
  },
  async unassignMember(projectId: ID, userId: ID): Promise<void> {
    await wait();
    const m = db.projectMembers.find((x) => x.project_id === projectId && x.user_id === userId && x.unassigned_at == null);
    if (m) m.unassigned_at = utils.now();
  },
};

// ===== Rejection categories ================================================

export const categoriesApi = {
  async list(): Promise<RejectionCategory[]> { await wait(20); return [...db.rejectionCategories]; },
  async create(input: Omit<RejectionCategory, "id">): Promise<RejectionCategory> {
    await wait();
    const c: RejectionCategory = { ...input, id: uid("rc") };
    db.rejectionCategories.push(c);
    return c;
  },
  async update(id: ID, patch: Partial<RejectionCategory>): Promise<RejectionCategory> {
    await wait();
    const c = db.rejectionCategories.find((x) => x.id === id);
    if (!c) throw new NotFoundError();
    Object.assign(c, patch);
    return c;
  },
};

// ===== Availability ========================================================

export const availabilityApi = {
  async listForUser(userId: ID, opts?: { from?: string; to?: string }): Promise<AvailabilityLog[]> {
    await wait(20);
    return db.availabilityLogs
      .filter((l) => l.user_id === userId)
      .filter((l) => (opts?.from ? l.log_date >= opts.from : true))
      .filter((l) => (opts?.to ? l.log_date <= opts.to : true))
      .sort((a, b) => b.log_date.localeCompare(a.log_date));
  },
  async listForTeam(opts?: { from?: string; to?: string }): Promise<AvailabilityLog[]> {
    await wait(20);
    return db.availabilityLogs
      .filter((l) => (opts?.from ? l.log_date >= opts.from : true))
      .filter((l) => (opts?.to ? l.log_date <= opts.to : true));
  },
  async log(input: { user_id: ID; log_date: string; status: AvailabilityStatus; note?: string }): Promise<AvailabilityLog> {
    await wait();
    const existing = db.availabilityLogs.find((l) => l.user_id === input.user_id && l.log_date === input.log_date);
    if (existing) {
      existing.status = input.status;
      existing.note = input.note;
      return existing;
    }
    const log: AvailabilityLog = { ...input, id: uid("al"), created_at: utils.now() };
    db.availabilityLogs.push(log);
    return log;
  },
};

// ===== Tasks ===============================================================

export interface TaskFilters extends DashboardFilterValues {
  status?: TaskStatus | "all";
  submittedBy?: ID;
  awaiting?: "review" | "platform";
}

function filterTasks(tasks: Task[], f: TaskFilters): Task[] {
  return tasks.filter((t) => {
    if (f.status && f.status !== "all" && t.status !== f.status) return false;
    if (f.submittedBy && t.submitted_by !== f.submittedBy) return false;
    if (f.projectId && t.project_id !== f.projectId) return false;
    if (f.platformId) {
      const proj = db.projects.find((p) => p.id === t.project_id);
      if (!proj || proj.platform_id !== f.platformId) return false;
    }
    if (f.employeeId && t.submitted_by !== f.employeeId) return false;
    if (f.from && t.submitted_at < f.from) return false;
    if (f.to && t.submitted_at > f.to + "T23:59:59.999Z") return false;
    if (f.awaiting === "review" && !(t.status === "pending" && t.reviewed_at == null)) return false;
    if (f.awaiting === "platform" && !(t.status === "pending" && t.reviewed_at != null && t.platform_submitted_at == null)) return false;
    return true;
  });
}

export const tasksApi = {
  async list(f: TaskFilters = {}): Promise<Task[]> {
    await wait(20);
    return filterTasks([...db.tasks], f).sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  },
  async get(id: ID): Promise<Task> {
    const t = db.tasks.find((x) => x.id === id);
    if (!t) throw new NotFoundError();
    return t;
  },
  async attachments(taskId: ID): Promise<TaskAttachment[]> {
    return db.taskAttachments.filter((a) => a.task_id === taskId);
  },
  async history(taskId: ID): Promise<TaskHistoryEntry[]> {
    return db.taskHistory.filter((h) => h.task_id === taskId).sort((a, b) => a.at.localeCompare(b.at));
  },
  async create(input: {
    project_id: ID;
    submitted_by: ID;
    external_task_id: string;
    description: string;
    notes?: string;
    time_spent_hours: number;
  }): Promise<Task> {
    await wait();
    const project = db.projects.find((p) => p.id === input.project_id);
    if (!project) throw new ValidationError("Project not found.");
    const rate = await platformsApi.activeRate(project.platform_id);
    if (!rate) throw new ValidationError("No active rate is configured for this platform.");
    if (db.tasks.some((t) => t.project_id === input.project_id && t.external_task_id === input.external_task_id))
      throw new ValidationError("That external task ID already exists in this project.");
    const t: Task = {
      id: uid("tk"),
      project_id: input.project_id,
      submitted_by: input.submitted_by,
      external_task_id: input.external_task_id,
      description: input.description,
      notes: input.notes,
      time_spent_hours: input.time_spent_hours,
      status: project.requires_review ? "pending" : "pending",
      reviewed_by: null,
      reviewed_at: null,
      rate_id: rate.id,
      rate_snapshot: rate.rate_per_task,
      submitted_at: utils.now(),
      platform_submitted_at: project.requires_review ? null : utils.now(),
      escalated_at: null,
      accepted_at: null,
      version: 1,
      created_at: utils.now(),
      updated_at: utils.now(),
    };
    db.tasks.push(t);
    db.taskHistory.push({
      id: uid("th"), task_id: t.id, actor_id: input.submitted_by, at: t.created_at,
      kind: "created", note: project.requires_review ? "Awaiting team-lead review." : "Auto-submitted to platform.",
    });
    return t;
  },
  async updateStatus(taskId: ID, version: number, nextStatus: TaskStatus, actorId: ID): Promise<Task> {
    await wait();
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) throw new NotFoundError();
    if (t.version !== version) throw new ConflictError();
    const prev = t.status;
    t.status = nextStatus;
    t.version++;
    t.updated_at = utils.now();
    if (nextStatus === "accepted") t.accepted_at = utils.now();
    if (nextStatus === "escalated") t.escalated_at = utils.now();
    db.taskHistory.push({
      id: uid("th"), task_id: t.id, actor_id: actorId, at: utils.now(),
      kind: "status_change", from_value: prev, to_value: nextStatus,
    });
    return t;
  },
  async correct(taskId: ID, version: number, patch: { time_spent_hours?: number; notes?: string; description?: string }, actorId: ID): Promise<Task> {
    await wait();
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) throw new NotFoundError();
    if (t.version !== version) throw new ConflictError();
    const changes: string[] = [];
    if (patch.time_spent_hours != null && patch.time_spent_hours !== t.time_spent_hours) {
      changes.push(`time_spent_hours: ${t.time_spent_hours} → ${patch.time_spent_hours}`);
      t.time_spent_hours = patch.time_spent_hours;
    }
    if (patch.description != null && patch.description !== t.description) {
      changes.push(`description updated`);
      t.description = patch.description;
    }
    if (patch.notes != null && patch.notes !== t.notes) {
      changes.push(`notes updated`);
      t.notes = patch.notes;
    }
    t.version++;
    t.updated_at = utils.now();
    db.taskHistory.push({
      id: uid("th"), task_id: t.id, actor_id: actorId, at: utils.now(),
      kind: "correction", note: changes.join("; "),
    });
    return t;
  },
  async approveReview(taskId: ID, version: number, reviewerId: ID): Promise<Task> {
    await wait();
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) throw new NotFoundError();
    if (t.version !== version) throw new ConflictError();
    if (t.status !== "pending" || t.reviewed_at != null)
      throw new ValidationError("Task is not awaiting review.");
    t.reviewed_by = reviewerId;
    t.reviewed_at = utils.now();
    t.platform_submitted_at = utils.now();
    t.version++;
    t.updated_at = utils.now();
    db.taskHistory.push({
      id: uid("th"), task_id: t.id, actor_id: reviewerId, at: utils.now(),
      kind: "review", note: "Approved and submitted to platform.",
    });
    return t;
  },
  async sendBack(taskId: ID, version: number, reviewerId: ID, reason: string): Promise<Task> {
    await wait();
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) throw new NotFoundError();
    if (t.version !== version) throw new ConflictError();
    t.version++;
    t.updated_at = utils.now();
    db.taskHistory.push({
      id: uid("th"), task_id: t.id, actor_id: reviewerId, at: utils.now(),
      kind: "review", note: `Sent back to submitter: ${reason}`,
    });
    return t;
  },
  async addAttachment(taskId: ID, file: { name: string; type: string; size: number }, uploaderId: ID): Promise<TaskAttachment> {
    await wait();
    const att: TaskAttachment = {
      id: uid("att"),
      task_id: taskId,
      uploaded_by: uploaderId,
      file_name: file.name,
      file_type: file.type,
      file_size_bytes: file.size,
      storage_url: `https://mock-storage.local/signed/${uid("f")}?sig=mock-sig`,
      uploaded_at: utils.now(),
    };
    db.taskAttachments.push(att);
    return att;
  },
};

// ===== Disputes ============================================================

export const disputesApi = {
  async overview(filter?: { teamLeadId?: ID }): Promise<{
    task: Task;
    project: Project;
    platform: Platform;
    rejection: Rejection;
    counter: CounterArgument | null;
    dispute: PlatformDispute | null;
  }[]> {
    await wait(20);
    return db.rejections.map((rj) => {
      const task = db.tasks.find((t) => t.id === rj.task_id)!;
      const project = db.projects.find((p) => p.id === task.project_id)!;
      const platform = db.platforms.find((p) => p.id === project.platform_id)!;
      const counter = db.counterArguments.find((c) => c.rejection_id === rj.id) ?? null;
      const dispute = counter ? db.platformDisputes.find((d) => d.counter_argument_id === counter.id) ?? null : null;
      return { task, project, platform, rejection: rj, counter, dispute };
    });
  },
  async logRejection(input: { task_id: ID; category_id: ID; feedback: string }): Promise<Rejection> {
    await wait();
    const task = db.tasks.find((t) => t.id === input.task_id);
    if (!task) throw new NotFoundError();
    if (task.status !== "rejected")
      throw new ValidationError("A rejection can only be logged for a rejected task.");
    if (db.rejections.some((r) => r.task_id === input.task_id))
      throw new ValidationError("This task already has a rejection logged.");
    const rj: Rejection = { ...input, id: uid("rj"), rejected_at: utils.now() };
    db.rejections.push(rj);
    db.taskHistory.push({
      id: uid("th"), task_id: task.id, actor_id: task.submitted_by, at: utils.now(),
      kind: "rejection_logged", note: "Rejection feedback recorded.",
    });
    return rj;
  },
  async writeCounter(input: { rejection_id: ID; argument: string; actor_id: ID }): Promise<CounterArgument> {
    await wait();
    const rj = db.rejections.find((r) => r.id === input.rejection_id);
    if (!rj) throw new NotFoundError();
    if (db.counterArguments.some((c) => c.rejection_id === rj.id))
      throw new ValidationError("A counter-argument already exists for this rejection.");
    const c: CounterArgument = {
      id: uid("ca"),
      rejection_id: rj.id,
      argument: input.argument,
      lead_decision: "pending",
      reviewed_by: null,
      created_at: utils.now(),
      decided_at: null,
    };
    db.counterArguments.push(c);
    db.taskHistory.push({
      id: uid("th"), task_id: rj.task_id, actor_id: input.actor_id, at: utils.now(),
      kind: "counter_argument", note: "Counter-argument submitted.",
    });
    return c;
  },
  async decideCounter(input: { counter_id: ID; decision: CounterDecision; reviewer_id: ID }): Promise<{ counter: CounterArgument; dispute: PlatformDispute | null }> {
    await wait();
    const c = db.counterArguments.find((x) => x.id === input.counter_id);
    if (!c) throw new NotFoundError();
    if (c.lead_decision !== "pending")
      throw new ValidationError("This counter-argument has already been decided.");
    const rj = db.rejections.find((r) => r.id === c.rejection_id)!;
    const task = db.tasks.find((t) => t.id === rj.task_id)!;
    c.lead_decision = input.decision;
    c.reviewed_by = input.reviewer_id;
    c.decided_at = utils.now();
    let dispute: PlatformDispute | null = null;
    if (input.decision === "escalated") {
      task.status = "escalated";
      task.escalated_at = utils.now();
      task.version++;
      dispute = {
        id: uid("pd"),
        counter_argument_id: c.id,
        outcome: "pending",
        recorded_by: input.reviewer_id,
        submitted_at: utils.now(),
        resolved_at: null,
      };
      db.platformDisputes.push(dispute);
    }
    db.taskHistory.push({
      id: uid("th"), task_id: task.id, actor_id: input.reviewer_id, at: utils.now(),
      kind: "lead_decision", to_value: input.decision,
    });
    return { counter: c, dispute };
  },
  async recordOutcome(input: { dispute_id: ID; outcome: Exclude<DisputeOutcome, "pending">; notes?: string; reviewer_id: ID }): Promise<PlatformDispute> {
    await wait();
    const d = db.platformDisputes.find((x) => x.id === input.dispute_id);
    if (!d) throw new NotFoundError();
    if (d.outcome !== "pending")
      throw new ValidationError("This dispute already has an outcome.");
    const c = db.counterArguments.find((x) => x.id === d.counter_argument_id)!;
    const rj = db.rejections.find((r) => r.id === c.rejection_id)!;
    const task = db.tasks.find((t) => t.id === rj.task_id)!;
    d.outcome = input.outcome;
    d.resolved_at = utils.now();
    d.platform_notes = input.notes;
    if (input.outcome === "won") {
      task.status = "accepted";
      task.accepted_at = utils.now();
    } else {
      task.status = "rejected";
    }
    task.version++;
    db.taskHistory.push({
      id: uid("th"), task_id: task.id, actor_id: input.reviewer_id, at: utils.now(),
      kind: "platform_outcome", to_value: input.outcome, note: input.notes,
    });
    return d;
  },
};

// ===== Financials ==========================================================

export const financialsApi = {
  async earnings(opts: DashboardFilterValues = {}): Promise<{
    byCurrency: { currency: Currency; projected: number; actual: number; accepted_tasks: number; pending_tasks: number }[];
    byProject: { project_id: ID; project: string; platform: string; currency: Currency; projected: number; actual: number }[];
  }> {
    await wait(20);
    const tasks = db.tasks.filter((t) => {
      if (opts.from && t.submitted_at < opts.from) return false;
      if (opts.to && t.submitted_at > opts.to + "T23:59:59.999Z") return false;
      if (opts.projectId && t.project_id !== opts.projectId) return false;
      if (opts.platformId) {
        const p = db.projects.find((p) => p.id === t.project_id);
        if (!p || p.platform_id !== opts.platformId) return false;
      }
      if (opts.employeeId && t.submitted_by !== opts.employeeId) return false;
      return true;
    });
    const byCurrencyMap = new Map<Currency, { projected: number; actual: number; accepted: number; pending: number }>();
    const byProjectMap = new Map<ID, { name: string; platform: string; currency: Currency; projected: number; actual: number }>();
    for (const t of tasks) {
      const project = db.projects.find((p) => p.id === t.project_id)!;
      const platform = db.platforms.find((p) => p.id === project.platform_id)!;
      const cur = platform.currency;
      const c = byCurrencyMap.get(cur) ?? { projected: 0, actual: 0, accepted: 0, pending: 0 };
      const p = byProjectMap.get(project.id) ?? { name: project.name, platform: platform.name, currency: cur, projected: 0, actual: 0 };
      // projected = anything not yet decisively rejected counts; actual = accepted only
      if (t.status !== "rejected") { c.projected += t.rate_snapshot; p.projected += t.rate_snapshot; }
      if (t.status === "accepted") { c.actual += t.rate_snapshot; p.actual += t.rate_snapshot; c.accepted++; }
      if (t.status === "pending" || t.status === "escalated") c.pending++;
      byCurrencyMap.set(cur, c);
      byProjectMap.set(project.id, p);
    }
    return {
      byCurrency: [...byCurrencyMap.entries()].map(([currency, v]) => ({
        currency,
        projected: v.projected,
        actual: v.actual,
        accepted_tasks: v.accepted,
        pending_tasks: v.pending,
      })),
      byProject: [...byProjectMap.entries()].map(([project_id, v]) => ({ project_id, project: v.name, platform: v.platform, currency: v.currency, projected: v.projected, actual: v.actual })),
    };
  },
};
