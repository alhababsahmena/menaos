import type { User } from '@types'

// User IDs use the `00000000-0004-…` namespace.

export const USER_ADMIN_SARAH = '00000000-0004-4000-9000-000000000001'
export const USER_TL_KAREEM = '00000000-0004-4000-9000-000000000002'
export const USER_MGMT_LAYLA = '00000000-0004-4000-9000-000000000003'
export const USER_STAFF_YUSUF = '00000000-0004-4000-9000-000000000004'
export const USER_STAFF_REEM = '00000000-0004-4000-9000-000000000005'
export const USER_STAFF_OMAR = '00000000-0004-4000-9000-000000000006'
export const USER_STAFF_HALA = '00000000-0004-4000-9000-000000000007'

const BOOTSTRAP_AT = '2026-01-01T00:00:00.000Z'

// Two synthetic signed-URL stubs to exercise the with-photo / initials-fallback
// branch in the UI. Real signed URLs are opaque + short-lived; this format
// matches the mock storage host used elsewhere in the dataset.
const PHOTO_SARAH = 'https://mock-storage.local/signed/avatars/sarah.png?sig=mockA1'
const PHOTO_LAYLA = 'https://mock-storage.local/signed/avatars/layla.png?sig=mockL2'
const PHOTO_YUSUF = 'https://mock-storage.local/signed/avatars/yusuf.png?sig=mockY3'

export const users: readonly User[] = [
  {
    id: USER_ADMIN_SARAH,
    oid: 'a1b2c3d4-0001-4011-8000-000000000001',
    email: 'sarah.admin@menadevs.io',
    display_name: 'Sarah Al-Saadi',
    is_active: true,
    unassigned_at: null,
    photo_url: PHOTO_SARAH,
    last_login_at: '2026-06-01T08:30:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-06-01T08:30:00.000Z',
  },
  {
    id: USER_TL_KAREEM,
    oid: 'a1b2c3d4-0002-4011-8000-000000000002',
    email: 'kareem.lead@menadevs.io',
    display_name: 'Kareem Haddad',
    is_active: true,
    unassigned_at: null,
    photo_url: null,
    last_login_at: '2026-06-01T08:45:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-06-01T08:45:00.000Z',
  },
  {
    id: USER_MGMT_LAYLA,
    oid: 'a1b2c3d4-0003-4011-8000-000000000003',
    email: 'layla.mgmt@menadevs.io',
    display_name: 'Layla Nasser',
    is_active: true,
    unassigned_at: null,
    photo_url: PHOTO_LAYLA,
    last_login_at: '2026-05-31T16:10:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-05-31T16:10:00.000Z',
  },
  {
    id: USER_STAFF_YUSUF,
    oid: 'a1b2c3d4-0004-4011-8000-000000000004',
    email: 'yusuf.staff@menadevs.io',
    display_name: 'Yusuf Mansour',
    is_active: true,
    unassigned_at: null,
    photo_url: PHOTO_YUSUF,
    last_login_at: '2026-06-01T08:50:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-06-01T08:50:00.000Z',
  },
  {
    id: USER_STAFF_REEM,
    oid: 'a1b2c3d4-0005-4011-8000-000000000005',
    email: 'reem.staff@menadevs.io',
    display_name: 'Reem Khalil',
    is_active: true,
    unassigned_at: null,
    photo_url: null,
    last_login_at: '2026-06-01T07:58:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-06-01T07:58:00.000Z',
  },
  {
    id: USER_STAFF_OMAR,
    oid: 'a1b2c3d4-0006-4011-8000-000000000006',
    email: 'omar.former@menadevs.io',
    display_name: 'Omar Issa',
    is_active: false,
    unassigned_at: '2026-04-15T10:00:00.000Z',
    photo_url: null,
    last_login_at: '2026-04-14T17:45:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-04-15T10:00:00.000Z',
  },
  {
    id: USER_STAFF_HALA,
    oid: 'a1b2c3d4-0007-4011-8000-000000000007',
    email: 'hala.staff@menadevs.io',
    display_name: 'Hala Saleh',
    is_active: true,
    unassigned_at: null,
    photo_url: null,
    last_login_at: '2026-06-01T09:02:00.000Z',
    created_at: BOOTSTRAP_AT,
    updated_at: '2026-06-01T09:02:00.000Z',
  },
]
