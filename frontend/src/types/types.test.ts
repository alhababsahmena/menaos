import { describe, expect, it } from 'vitest'
import type { SessionUser, Task } from '@types'

/**
 * Acceptance fixtures for the shared domain types. The point of this file is
 * static — if every annotated literal compiles, the types are self-consistent
 * and the barrel exports cleanly. The runtime assertions are there only so the
 * file participates in the regular vitest run.
 */

describe('domain types barrel', () => {
  it('constructs a fully-populated Task', () => {
    const task: Task = {
      id: '0193c0d2-0000-7000-8000-000000000001',
      project_id: '0193c0d2-0000-7000-8000-000000000002',
      platform_id: '0193c0d2-0000-7000-8000-000000000003',
      submitter_id: '0193c0d2-0000-7000-8000-000000000004',

      status: 'pending',

      rate_id: '0193c0d2-0000-7000-8000-000000000005',
      rate_snapshot: '125.00',
      currency: 'JOD',

      reviewed_by: null,
      reviewer_decision: null,

      platform_submitted_at: null,
      accepted_at: null,
      escalated_at: null,

      version: 1,

      description: 'Process the inbound batch for project Alpha.',
      notes: null,

      created_at: '2026-06-01T09:00:00.000Z',
      updated_at: '2026-06-01T09:00:00.000Z',
    }

    expect(task.status).toBe('pending')
    expect(task.version).toBe(1)
    expect(task.currency).toBe('JOD')
    expect(task.reviewed_by).toBeNull()
  })

  it('constructs a SessionUser with resolved permissions, roles, and dashboards', () => {
    const session: SessionUser = {
      user: {
        id: '0193c0d2-0000-7000-8000-000000000010',
        oid: 'a1b2c3d4-e5f6-4011-8000-aaaabbbbcccc',
        email: 'lead@menadevs.io',
        display_name: 'Mena Lead',
        is_active: true,
        unassigned_at: null,
        photo_url: null,
        last_login_at: '2026-06-01T08:55:00.000Z',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-06-01T08:55:00.000Z',
      },
      roles: [
        {
          id: '0193c0d2-0000-7000-8000-000000000011',
          name: 'Lead',
          description: 'Reviews rejections and escalates disputes.',
          is_system: false,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      dashboards: [
        {
          id: '0193c0d2-0000-7000-8000-000000000012',
          key: 'operations',
          label: 'Operations',
          description: null,
        },
      ],
      permissionKeys: ['tasks.review', 'tasks.escalate', 'disputes.file'],
    }

    expect(session.user.oid).toMatch(/^[0-9a-f-]{36}$/i)
    expect(session.permissionKeys).toContain('tasks.review')
    expect(session.roles).toHaveLength(1)
    expect(session.dashboards[0]?.key).toBe('operations')
  })
})
