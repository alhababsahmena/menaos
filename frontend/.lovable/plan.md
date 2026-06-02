# MENAOS Frontend — Build Plan

Static, mock-backed frontend for a data-ops tracking system. Four roles (Staff, Team Lead, Admin, Management), full dispute chain, financial gating, dark/light. No backend in this build, but architected so flipping `VITE_USE_MOCKS=false` retargets a Django/DRF REST API with zero component changes.

## Stack decisions (locked)

- **Template kept**: TanStack Start + TanStack Router (file-based routes in `src/routes/`). All spec items map cleanly; "React Router" in your prompt is satisfied semantically by TanStack Router.
- **Data layer**: TanStack Query (already in template) over a typed service layer (`src/services/api/*`) with `mockApi` and `realApi` implementations selected by `VITE_USE_MOCKS`.
- **Forms**: React Hook Form + Zod. **Charts**: Recharts. **Tables**: shadcn DataTable on TanStack Table.
- **Typography**: JetBrains Mono (headings) + Work Sans (body), loaded via `@import` in `src/styles.css`.
- **Accent**: indigo `#4F46E5` expressed as oklch tokens; full semantic token set (surface/foreground/muted/border/success/warning/danger + dedicated task/dispute/availability status tokens) in `src/styles.css` with light + dark blocks.
- **Mock SSO role-switcher**: always visible on `/login` (your call).
- **No Supabase, no Lovable Cloud.** Mocks only.

## Phase plan (10 phases, built sequentially; STRUCTURE.md updated after each)

1. **Scaffold + design system** — tokens, theme toggle (persisted), fonts, base shadcn polish, `StatusPill`, `Avatar`, layout shell (sidebar + topbar + breadcrumbs), `STRUCTURE.md` seeded.
2. **Types + centralized mock dataset + service layer** — `src/types/*`, `src/mocks/db.ts` composed from per-entity files with full referential integrity and every state covered, `src/services/api/{mock,real,index}.ts` with `USE_MOCKS` switch, axios client stub with 401-refresh + 409-surface interceptors documented for `realApi`.
3. **Routing + guards + layout** — file-based routes under `src/routes/`, `_authenticated` layout, `usePermissions` hook, `<Can>` wrapper, 403/404/error boundaries, permission-filtered sidebar.
4. **Mock SSO + role switcher + redirects** — `/login`, `/auth/callback`, session resolution (user + flat `permissionKeys` + dashboards), default-dashboard redirect, multi-dashboard switcher in topbar, intended-destination preservation.
5. **Shared dashboard infra** — `DashboardFilters` (date/project/platform/employee, URL-synced, permission-scoped), `KpiCard`, chart wrappers, `DataTable` primitive with sorting/pagination/empty/loading/error.
6. **Logging surfaces** — `/availability` (F1, one-per-day), `/tasks` list, `/tasks/new` (F2, rate snapshot computed from active platform rate, attachments → mock signed URLs), `/tasks/:id` (F3 status transitions with `version` + 409 handling, F4 log correction with before/after change record), `/review` (F8, scoped to `requires_review`, awaiting-review vs awaiting-platform distinction).
7. **Dispute chain** — rejection (F6, only when task=rejected), counter-argument (F7), TL decision (reject terminal / escalate → creates platform dispute), platform outcome won/lost (F9), `DisputeTimeline` component, `/disputes` overview (F11 visibility-scoped), `/admin/rejection-categories` (F10, soft-deprecate).
8. **Admin** — `/admin/users` (F24, soft-deactivate, role assignment with `unassigned_at` history), `/admin/roles` (F23, permission matrix + dashboard-access editor, live reflection in sidebar/switcher), `/admin/platforms` (F16, currency-locked, non-overlapping rate timeline editor), `/admin/projects` (F25, members with active/soft-removed model).
9. **Four dashboards** — `/dashboard/employee` (F12), `/dashboard/team-lead` (F13, stale-dispute aging from `escalated_at`), `/dashboard/management` (F14), `/dashboard/financial` (F16–F20, gated by `financials.view`, currency-segmented, mock CSV export). All consume the shared filter bar.
10. **A11y + responsive + states pass** — focus rings, ARIA on menus/dialogs/tables, keyboard nav, mobile drawer sidebar, every async surface verified for loading/empty/error, light+dark visual sweep, final readme of the `VITE_USE_MOCKS=false` swap procedure.

## Technical details

**Service layer contract** (illustrative):
```text
authApi.getSession()            GET    /api/auth/session/
tasksApi.list(filters)          GET    /api/tasks/
tasksApi.create(input)          POST   /api/tasks/
tasksApi.updateStatus(id,v,s)   POST   /api/tasks/:id/status/   (body includes version)
tasksApi.correct(id, patch)     PATCH  /api/tasks/:id/         (writes change-record)
disputesApi.recordOutcome(...)  POST   /api/disputes/:id/outcome/
rolesApi.setPermissions(...)    PUT    /api/roles/:id/permissions/
... (every method documents its DRF endpoint in realApi)
```

**Business rules enforced in the mock** (not just the UI):
- Optimistic locking via `version`; mismatched writes throw a typed `ConflictError` (409). UI catches → invalidate + refetch + "data changed" toast.
- Dispute chain is one-shot per task and drives task status exactly as spec'd (rejected → counter → TL decision → optional platform dispute → outcome).
- Earnings = `accepted tasks × rate_snapshot`, **grouped by currency, never summed across**.
- Rate windows per platform cannot overlap; adding a new rate auto-closes the current open one.
- One availability log per user per day.
- Soft-deactivate (users), soft-deprecate (categories), soft-unassign (roles, project members) — never hard delete.
- Attachment URLs returned as opaque `https://mock-storage.local/signed/…`.

**Carried-forward backend notes** (surfaced in `STRUCTURE.md`):
- Log-correction history and accurate financial date-filtering need a real `task_status_history` + `accepted_at` — mocked for now, flagged.
- Confirm whether a task can be rejected more than once (current model: one-shot).

**Permission model**: table-driven (`permissions`, `roles`, `role_permissions`, `user_roles`, `dashboards`, `role_dashboards`). Session resolves to `{ user, permissionKeys: string[], dashboards: Dashboard[] }`. Enforced in (a) route `beforeLoad` guards, (b) sidebar rendering, (c) action buttons via `<Can permission="...">`.

**Definition of done** (checked in Phase 10):
- All pages reachable; permissions enforced in nav + routes + actions.
- F1–F25 all present.
- Currencies never mixed in a single figure.
- Financial data invisible without `financials.view`.
- Light + dark both clean; keyboard + screen-reader pass.
- `VITE_USE_MOCKS=false` would hit `realApi` (documented endpoints) with zero component changes.

After you approve, I'll start Phase 1 and summarize at each phase boundary.
