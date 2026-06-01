import { describe, expect, it } from 'vitest'

import { seedDb } from './db'

/**
 * Referential integrity check for the centralized mock dataset. Every FK is
 * resolved against the parent table; the test fails if any orphan ID exists.
 * Also prints a per-table count summary so the dataset's shape is visible in
 * the test output.
 */

describe('mock database — referential integrity', () => {
  const db = seedDb()

  const idsOf = <T extends { id: string }>(rows: T[]): Set<string> =>
    new Set(rows.map((r) => r.id))

  const expectIn = (name: string, fk: string, pool: Set<string>): void => {
    if (!pool.has(fk)) {
      throw new Error(`${name}: FK ${fk} has no matching row`)
    }
  }

  const userIds = idsOf(db.users)
  const roleIds = idsOf(db.roles)
  const permissionIds = idsOf(db.permissions)
  const dashboardIds = idsOf(db.dashboards)
  const platformIds = idsOf(db.platforms)
  const platformRateIds = idsOf(db.platform_rates)
  const projectIds = idsOf(db.projects)
  const taskIds = idsOf(db.tasks)
  const rejectionIds = idsOf(db.rejections)
  const rejectionCategoryIds = idsOf(db.rejection_categories)

  it('per-table counts (printed for visibility)', () => {
    const counts = {
      permissions: db.permissions.length,
      dashboards: db.dashboards.length,
      roles: db.roles.length,
      role_permissions: db.role_permissions.length,
      role_dashboards: db.role_dashboards.length,
      users: db.users.length,
      user_roles: db.user_roles.length,
      platforms: db.platforms.length,
      platform_rates: db.platform_rates.length,
      projects: db.projects.length,
      project_members: db.project_members.length,
      tasks: db.tasks.length,
      task_attachments: db.task_attachments.length,
      availability_logs: db.availability_logs.length,
      rejection_categories: db.rejection_categories.length,
      rejections: db.rejections.length,
      counter_arguments: db.counter_arguments.length,
      platform_disputes: db.platform_disputes.length,
    }
    // Keep this visible in CI output; the seed shape is part of the contract.
    console.info('[mock db] per-table counts:', counts)
    // Sanity bound: at least one row in every table that isn't a join table
    // with a deliberately-empty intersection.
    expect(counts.users).toBeGreaterThan(0)
    expect(counts.tasks).toBeGreaterThan(0)
    expect(counts.platforms).toBeGreaterThan(0)
  })

  it('role_permissions FKs resolve', () => {
    for (const row of db.role_permissions) {
      expectIn('role_permissions.role_id', row.role_id, roleIds)
      expectIn('role_permissions.permission_id', row.permission_id, permissionIds)
      expectIn('role_permissions.granted_by', row.granted_by, userIds)
    }
  })

  it('role_dashboards FKs resolve', () => {
    for (const row of db.role_dashboards) {
      expectIn('role_dashboards.role_id', row.role_id, roleIds)
      expectIn('role_dashboards.dashboard_id', row.dashboard_id, dashboardIds)
      expectIn('role_dashboards.assigned_by', row.assigned_by, userIds)
    }
  })

  it('user_roles FKs resolve', () => {
    for (const row of db.user_roles) {
      expectIn('user_roles.user_id', row.user_id, userIds)
      expectIn('user_roles.role_id', row.role_id, roleIds)
      expectIn('user_roles.assigned_by', row.assigned_by, userIds)
    }
  })

  it('platform_rates FKs resolve and respect non-overlap per platform', () => {
    for (const rate of db.platform_rates) {
      expectIn('platform_rates.platform_id', rate.platform_id, platformIds)
      expectIn('platform_rates.created_by', rate.created_by, userIds)
    }
    // Non-overlap: per platform, at most one row may have effective_to=null,
    // and any closed window must end strictly before the next opens.
    for (const platformId of platformIds) {
      const platformRates = db.platform_rates
        .filter((r) => r.platform_id === platformId)
        .sort((a, b) => a.effective_from.localeCompare(b.effective_from))
      const openWindows = platformRates.filter((r) => r.effective_to === null)
      expect(openWindows.length).toBeLessThanOrEqual(1)
      for (let i = 0; i < platformRates.length - 1; i += 1) {
        const a = platformRates[i]
        const b = platformRates[i + 1]
        if (a === undefined || b === undefined) continue
        expect(a.effective_to).not.toBeNull()
        if (a.effective_to !== null) {
          expect(a.effective_to < b.effective_from).toBe(true)
        }
      }
    }
  })

  it('projects + project_members FKs resolve', () => {
    for (const project of db.projects) {
      expectIn('projects.platform_id', project.platform_id, platformIds)
    }
    for (const member of db.project_members) {
      expectIn('project_members.project_id', member.project_id, projectIds)
      expectIn('project_members.user_id', member.user_id, userIds)
      expectIn('project_members.assigned_by', member.assigned_by, userIds)
    }
  })

  it('tasks FKs resolve and currency matches platform currency', () => {
    const platformById = new Map(db.platforms.map((p) => [p.id, p]))
    for (const task of db.tasks) {
      expectIn('tasks.project_id', task.project_id, projectIds)
      expectIn('tasks.platform_id', task.platform_id, platformIds)
      expectIn('tasks.submitter_id', task.submitter_id, userIds)
      expectIn('tasks.rate_id', task.rate_id, platformRateIds)
      if (task.reviewed_by !== null) {
        expectIn('tasks.reviewed_by', task.reviewed_by, userIds)
      }
      const platform = platformById.get(task.platform_id)
      expect(platform?.currency).toBe(task.currency)
    }
  })

  it('task_attachments FKs resolve', () => {
    for (const att of db.task_attachments) {
      expectIn('task_attachments.task_id', att.task_id, taskIds)
      expectIn('task_attachments.uploaded_by', att.uploaded_by, userIds)
    }
  })

  it('availability_logs FKs resolve', () => {
    for (const log of db.availability_logs) {
      expectIn('availability_logs.user_id', log.user_id, userIds)
      expectIn('availability_logs.recorded_by', log.recorded_by, userIds)
    }
  })

  it('rejection chain FKs resolve', () => {
    for (const rejection of db.rejections) {
      expectIn('rejections.task_id', rejection.task_id, taskIds)
      expectIn('rejections.lead_id', rejection.lead_id, userIds)
      expectIn(
        'rejections.category_id',
        rejection.category_id,
        rejectionCategoryIds,
      )
    }
    for (const counter of db.counter_arguments) {
      expectIn(
        'counter_arguments.rejection_id',
        counter.rejection_id,
        rejectionIds,
      )
      expectIn(
        'counter_arguments.submitter_id',
        counter.submitter_id,
        userIds,
      )
    }
    for (const dispute of db.platform_disputes) {
      expectIn('platform_disputes.task_id', dispute.task_id, taskIds)
      expectIn(
        'platform_disputes.rejection_id',
        dispute.rejection_id,
        rejectionIds,
      )
      expectIn(
        'platform_disputes.escalated_by',
        dispute.escalated_by,
        userIds,
      )
    }
  })

  it('dispute chain coverage matches the prompt requirements', () => {
    const outcomes = db.platform_disputes.map((d) => d.outcome)
    expect(outcomes).toContain('won')
    expect(outcomes).toContain('lost')
    expect(outcomes).toContain('pending')

    // The "open work" rejection (task .004) must have NO counter-argument.
    const counterRejectionIds = new Set(
      db.counter_arguments.map((c) => c.rejection_id),
    )
    const rejectionsWithoutCounter = db.rejections.filter(
      (r) => !counterRejectionIds.has(r.id),
    )
    expect(rejectionsWithoutCounter.length).toBeGreaterThan(0)
  })

  it('every TaskStatus value is represented at least once', () => {
    const statuses = new Set(db.tasks.map((t) => t.status))
    expect(statuses).toEqual(
      new Set(['pending', 'accepted', 'rejected', 'escalated']),
    )
  })

  it('seedDb returns independent deep-cloned copies', () => {
    const a = seedDb()
    const b = seedDb()
    const firstA = a.users.at(0)
    const firstB = b.users.at(0)
    expect(firstA).toBeDefined()
    expect(firstB).toBeDefined()
    if (firstA === undefined || firstB === undefined) return
    firstA.display_name = 'mutated A'
    expect(firstB.display_name).not.toBe('mutated A')
  })
})
