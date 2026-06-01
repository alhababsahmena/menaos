import type { Dashboard } from '@types'

// Dashboard IDs use the `00000000-0002-…` namespace.

export const DASHBOARD_EMPLOYEE = '00000000-0002-4000-9000-000000000001'
export const DASHBOARD_TEAM_LEAD = '00000000-0002-4000-9000-000000000002'
export const DASHBOARD_MANAGEMENT = '00000000-0002-4000-9000-000000000003'
export const DASHBOARD_FINANCIAL = '00000000-0002-4000-9000-000000000004'

export const dashboards: readonly Dashboard[] = [
  {
    id: DASHBOARD_EMPLOYEE,
    key: 'employee',
    label: 'Employee',
    description: 'My tasks, availability, and submission queue.',
  },
  {
    id: DASHBOARD_TEAM_LEAD,
    key: 'team_lead',
    label: 'Team Lead',
    description: 'Review queue, rejection chain, and team workload.',
  },
  {
    id: DASHBOARD_MANAGEMENT,
    key: 'management',
    label: 'Management',
    description: 'Org-wide operational KPIs and trends.',
  },
  {
    id: DASHBOARD_FINANCIAL,
    key: 'financial',
    label: 'Financial',
    description: 'Earnings and payouts, segregated by currency.',
  },
]
