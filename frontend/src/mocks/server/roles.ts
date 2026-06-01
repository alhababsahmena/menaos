import type { Dashboard, Permission, Role } from '@types'

import type { RolesApi } from '@lib/apiClient'

import type { MockDatabase } from '../db'
import { requireById, respond } from './util'

export function createRolesApi(db: MockDatabase): RolesApi {
  return {
    async list(): Promise<Role[]> {
      return respond(() => db.roles.slice())
    },

    async get(id) {
      return respond(() => requireById(db.roles, id, 'Role'))
    },

    async permissions(roleId): Promise<Permission[]> {
      return respond(() => {
        requireById(db.roles, roleId, 'Role')
        const permissionIds = new Set(
          db.role_permissions
            .filter((rp) => rp.role_id === roleId)
            .map((rp) => rp.permission_id),
        )
        return db.permissions.filter((p) => permissionIds.has(p.id))
      })
    },

    async dashboards(roleId): Promise<Dashboard[]> {
      return respond(() => {
        requireById(db.roles, roleId, 'Role')
        const dashboardIds = new Set(
          db.role_dashboards
            .filter((rd) => rd.role_id === roleId && rd.is_active)
            .map((rd) => rd.dashboard_id),
        )
        return db.dashboards.filter((d) => dashboardIds.has(d.id))
      })
    },
  }
}
