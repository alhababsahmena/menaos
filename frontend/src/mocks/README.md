# MENAOS — Mock dataset

The single source of truth for the static-build phase. Components and hooks
never read these files directly — they go through `lib/apiClient` (next
prompt). This README documents the dataset's shape, its invariants, and how
to extend it without breaking referential integrity.

## Layout

```
src/mocks/
  data/                 # one file per table, exporting:
    permissions.ts        - readonly Permission[]
    dashboards.ts         - readonly Dashboard[]
    roles.ts              - readonly Role[]
    role_permissions.ts   - readonly RolePermission[]
    role_dashboards.ts    - readonly RoleDashboard[]
    users.ts              - readonly User[]
    user_roles.ts         - readonly UserRole[]
    platforms.ts          - readonly Platform[]
    platform_rates.ts     - readonly PlatformRate[]
    projects.ts           - readonly Project[]
    project_members.ts    - readonly ProjectMember[]
    tasks.ts              - readonly Task[]
    task_attachments.ts   - readonly TaskAttachment[]
    availability_logs.ts  - readonly AvailabilityLog[]
    rejection_categories.ts - readonly RejectionCategory[]
    rejections.ts         - readonly Rejection[]
    counter_arguments.ts  - readonly CounterArgument[]
    platform_disputes.ts  - readonly PlatformDispute[]
  db.ts                  # MockDatabase type + seedDb() deep-clone factory
  db.test.ts             # referential integrity test + per-table counts
  README.md              # this file
```

Every data file follows the same shape:

1. Imports the relevant entity type from `@types`.
2. Exports **named ID constants** for cross-file references (no inline string
   literals). The pattern is `EXPORT_NAME_PER_ROW: ID = '<uuid>'`.
3. Exports the data array as `readonly EntityName[]`.

## ID namespace

IDs are UUIDv4-formatted strings; the third octet group encodes the entity
type so an ID is debuggable at a glance.

| Entity                 | Namespace                            |
| ---------------------- | ------------------------------------ |
| `permissions`          | `00000000-0001-4000-9000-…`          |
| `dashboards`           | `00000000-0002-4000-9000-…`          |
| `roles`                | `00000000-0003-4000-9000-…`          |
| `users`                | `00000000-0004-4000-9000-…`          |
| `role_permissions`     | `00000000-0005-4000-9000-…`          |
| `role_dashboards`      | `00000000-0006-4000-9000-…`          |
| `user_roles`           | `00000000-0007-4000-9000-…`          |
| `platforms`            | `00000000-0008-4000-9000-…`          |
| `platform_rates`       | `00000000-0009-4000-9000-…`          |
| `projects`             | `00000000-000a-4000-9000-…`          |
| `project_members`      | `00000000-000b-4000-9000-…`          |
| `tasks`                | `00000000-000c-4000-9000-…`          |
| `task_attachments`     | `00000000-000d-4000-9000-…`          |
| `availability_logs`    | `00000000-000e-4000-9000-…`          |
| `rejection_categories` | `00000000-000f-4000-9000-…`          |
| `rejections`           | `00000000-0010-4000-9000-…`          |
| `counter_arguments`    | `00000000-0011-4000-9000-…`          |
| `platform_disputes`    | `00000000-0012-4000-9000-…`          |

## Coverage (locked by the integrity test)

- **Permissions** — every resource: `tasks.*`, `projects.*`, `users.*`,
  `roles.*`, `platforms.*`, `disputes.*`, `reviews.*`, `availability.*`,
  plus `financials.view`. 42 rows.
- **Dashboards** — `employee`, `team_lead`, `management`, `financial`.
- **Roles** — `Staff`, `Team Lead`, `Admin`, `Management`, all
  `is_system: true`, with realistic `role_permissions` and
  `role_dashboards` grants.
- **Users** — 7 total: one Admin, one Team Lead, one Management, three
  Staff (active), one deactivated Staff. Three users have a `photo_url`
  pointing at a mock signed URL; four have `photo_url: null` to exercise
  the initials-fallback branch.
- **`user_roles`** — one active grant per active user, plus one historical
  row (`unassigned_at` set, `is_active: false`) for the deactivated user.
- **Platforms** — Cloud Audit (JOD) and Tagging Global (USD).
- **`platform_rates`** — one closed window (`effective_to` set) and one
  current window (`effective_to: null`) per platform; non-overlapping,
  verified by the integrity test.
- **Projects** — three: Sentinel Audit (audited, JOD), Crowd Tag 2026
  (audited, USD), Quick Tag Express (fast-path, USD).
- **`project_members`** — staff and the lead on each audited project; a
  trusted submitter on the fast-path project.
- **Tasks** — nine rows covering every `TaskStatus` value plus every
  dispute outcome. Eight current-year (2026 rate); one 2025 task uses the
  closed rate to exercise rate-history paths.
- **Dispute chain (full)** —
  1. open rejection, no counter yet (submitter's open work);
  2. rejection → counter → platform dispute → **won** → task accepted;
  3. rejection → counter → platform dispute → **lost** → task stays rejected;
  4. rejection → counter → lead re-rejected (terminal, no platform dispute);
  5. mid-flight escalation (platform dispute `pending`).
- **Rejection categories** — five rows; one has `is_active: false`
  (preserves history for old rejections, blocked for new ones).
- **Availability logs** — a full week (Mon–Sun) for two staff covering
  `active`, `absent`, and `blocked` statuses.
- **Task attachments** — two on the accepted task, one on the won-dispute
  task (used as appeal evidence).

## Invariants (enforced by `db.test.ts`)

1. Zero dangling foreign keys: every `*_id` resolves to an existing row.
2. `Task.currency === Platform.currency` for the task's platform. The
   currency-per-platform rule is verified per row.
3. Per platform, at most one `PlatformRate` has `effective_to: null` (the
   current window). Closed windows end strictly before the next opens.
4. Every `TaskStatus` value appears at least once.
5. Every `DisputeOutcome` value (`won`, `lost`, `pending`) appears at least
   once across `platform_disputes`.
6. At least one `Rejection` has no `CounterArgument` (the open-work case
   the SPA renders for the submitter).
7. `seedDb()` returns deep-cloned copies — mutating one instance does not
   affect another.

If your change breaks any of these, the test will fail in CI with the
specific FK or constraint that broke.

## How to extend

1. **Add a row to an existing table.**
   - Open the relevant `data/*.ts` file.
   - Allocate the next sequential ID in that table's namespace.
   - Add the row, importing any referenced IDs from sibling files (never
     inline a UUID string from another file).
   - `npm run test` — the integrity test will catch any orphan FK.

2. **Add a new table.**
   - Pick the next unused third-octet group for the namespace.
   - Add a `data/<table>.ts` exporting a `readonly EntityType[]`.
   - Extend `MockDatabase` and the canonical `initial` composition in
     `db.ts`.
   - Add an integrity check in `db.test.ts` for the new FKs.

3. **Add a new entity type (Prompt 2 concern).**
   - First land the type in `src/types/<area>.ts` and the barrel.
   - Then come back here and add the table.

## Why a real database test?

The dataset is the contract every hook and component will be written
against. Drift between IDs, currencies, or chain states is exactly the
kind of bug a typed-but-uncoordinated mock would let through. The
integrity test catches it before any feature work depends on the bad data.
