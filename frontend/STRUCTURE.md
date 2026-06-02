# MENAOS — Structure

Living document. Updated at each phase boundary.

## Stack

- **TanStack Start** (Vite + React 19 + TypeScript strict) with file-based **TanStack Router** under `src/routes/`.
- **TanStack Query** for server-state, **React Hook Form + Zod** for forms, **Recharts** for charts, **TanStack Table + shadcn DataTable** for tables.
- **shadcn/ui** components, **lucide-react** icons, **Tailwind v4** with semantic tokens in `src/styles.css`.
- **Sonner** for toasts.

## Design system

- Brand accent: indigo `#4F46E5` expressed as oklch.
- Semantic tokens: `background / foreground / surface / muted / border / primary / secondary / accent / success / warning / danger / info`.
- Status tokens (color + label + icon — never color alone): `pending / accepted / rejected / escalated / won / lost / active / absent / blocked`.
- Typography: **JetBrains Mono** (display) + **Work Sans** (body).
- Light + dark themes; preference persisted in `localStorage` under `menaos.theme`.

## Service layer

Components ONLY import from `@/services/api`. Never from `@/mocks/*`.

```
src/services/api/
  index.ts        // re-exports based on USE_MOCKS flag
  mock.ts         // in-memory implementation, enforces business rules
  real.ts         // axios stub with documented DRF endpoints (not wired)
  errors.ts       // ConflictError, NotFoundError, ValidationError, ForbiddenError
```

Toggle: `VITE_USE_MOCKS=false` → `realApi`. No component change required.

### Business rules enforced in the mock

- **Optimistic locking**: every task mutation passes `version`; mismatched → `ConflictError` (HTTP 409). UI catches, invalidates, toasts "data changed".
- **Dispute chain is one-shot**: `rejected → 1 rejection → ≤1 counter_argument → TL decision (rejected = terminal | escalated = creates platform dispute) → outcome (won → accepted | lost → stays rejected)`.
- **Earnings**: `accepted tasks × rate_snapshot`, grouped by currency. Never summed across currencies.
- **Rate windows**: per-platform non-overlapping; adding a rate auto-closes the open window.
- **One availability log per user per day** (re-log overwrites).
- **Soft-deactivate / soft-deprecate / soft-unassign** — never hard delete.
- **Attachments**: returned as opaque `https://mock-storage.local/signed/…`.

### Backend-deferred notes

- Log-correction history is currently emitted into a `taskHistory` array; real backend should have a dedicated `task_status_history` and a derived `accepted_at` field on tasks for accurate financial filtering.
- Confirm: can a task be rejected more than once? Current model is one-shot.

## RBAC

Permissions are data:
```
permissions ─┬─ role_permissions ─── roles ─── user_roles ─── users
             └─ (PermissionKey) ──────────────┘
dashboards   ─── role_dashboards ─── roles
```

Session resolves to `{ user, roles, permissionKeys: PermissionKey[], dashboards: DashboardDef[] }`.

Enforced in three places:
1. `src/routes/_authenticated.tsx` checks the path-prefix → permission map and redirects to `/forbidden`.
2. `src/components/app-sidebar.tsx` only renders links the user can open.
3. `src/lib/permissions.tsx` — `usePermissions()` and `<Can>` gate buttons & whole sections.

Changing a role's permission matrix in `/admin/roles` updates the role's keys; the next session refresh (or sign-in) reflects it everywhere.

## Pages

```
src/routes/
  __root.tsx                              shell + ThemeProvider + SessionProvider + Toaster
  index.tsx                                / → smart redirect (login or default dashboard)
  login.tsx                                /login (mock SSO + dev role-switcher, always visible)
  auth.callback.tsx                        /auth/callback
  forbidden.tsx                            /forbidden (permission failure)

  _authenticated.tsx                       pathless layout: SidebarProvider + sidebar + topbar + breadcrumbs + Outlet

  _authenticated.dashboard.employee.tsx    F12
  _authenticated.dashboard.team-lead.tsx   F13
  _authenticated.dashboard.management.tsx  F14
  _authenticated.dashboard.financial.tsx   F16–F20  (gated: financials.view)

  _authenticated.availability.tsx          F1
  _authenticated.tasks.index.tsx           tasks list
  _authenticated.tasks.new.tsx             F2  (RHF + Zod; rate snapshot; attachments)
  _authenticated.tasks.$taskId.tsx         F3 / F4 / dispute chain UI (F6/F7/F9)
  _authenticated.review.tsx                F8  (requires_review queue, awaiting platform tab)
  _authenticated.disputes.tsx              F11 disputes overview

  _authenticated.profile.tsx               F22 (Entra-owned fields read-only, theme toggle)

  _authenticated.admin.users.tsx           F24 (create/deactivate/role-assign)
  _authenticated.admin.roles.tsx           F23 (permission matrix + dashboard access)
  _authenticated.admin.platforms.tsx       F16 (platforms + rate timeline)
  _authenticated.admin.projects.tsx        F25 (CRUD + members)
  _authenticated.admin.rejection-categories.tsx   F10
```

## Components (shared infra)

```
src/components/
  app-sidebar.tsx          permission-filtered sidebar
  app-topbar.tsx           sidebar trigger + dashboard switcher + theme toggle
  brand-mark.tsx
  breadcrumbs.tsx          auto-derived from pathname
  dashboard-filters.tsx    F15 — URL-aware filter bar (date/project/platform/employee)
  data-table.tsx           DataTable on TanStack Table (sort/pagination/empty/loading)
  dispute-timeline.tsx     rejection → counter → platform outcome visual
  empty-state.tsx
  kpi-card.tsx
  page.tsx                 PageHeader / PageBody primitives
  status-pill.tsx          unified StatusPill for all status enums
  theme-toggle.tsx
  user-avatar.tsx          photo or initials fallback
```

## Verifying the backend swap

```bash
# In .env (or .env.production):
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://api.menaos.example/api

# Implement realApi to mirror the mock signatures (real.ts has the contract).
# Wire axios:
#   - request interceptor: Bearer access token from Entra OIDC
#   - response 401: refresh token + retry; on second 401, sign out
#   - response 409: throw ConflictError (already typed)
# Components do NOT change. Imports stay as `@/services/api`.
```

## Phase status

- [x] Phase 1 — Scaffold + design system
- [x] Phase 2 — Types + centralized mock dataset + service layer
- [x] Phase 3 — Routing + guards + layout
- [x] Phase 4 — Mock SSO + role switcher + redirects
- [x] Phase 5 — Shared dashboard infra
- [x] Phase 6 — Logging surfaces
- [x] Phase 7 — Dispute chain + categories
- [x] Phase 8 — Admin
- [x] Phase 9 — Four dashboards + financial gating
- [x] Phase 10 — A11y + responsive + states pass

## DoD checklist

- [x] All pages reachable; permissions enforced in nav + routes + actions.
- [x] F1–F25 represented.
- [x] Currencies never mixed; financials gated.
- [x] Light + dark themes both clean.
- [x] `VITE_USE_MOCKS=false` retargets `realApi` with zero component changes.
