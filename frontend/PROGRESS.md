# MENAOS Frontend — Chain Memory

This file is the operating chain log for the 20-prompt frontend build. Each
prompt **must read it first** and **must update it last**. It is not narrative
documentation — it is a checklist + decision log so the next prompt picks up
without re-deriving context.

## Stack (locked in bootstrap)

- React 19.2.6 · TypeScript 6.0.3 (strict + `noUncheckedIndexedAccess`)
- Vite 8.0.15 · Vitest 4.1.7 · Playwright 1.60.0
- React Router 6.30.4 · TanStack Query 5.100.14 · Zustand 5.0.14
- React Hook Form 7.77.0 · Zod 4.4.3 · Axios 1.16.1
- Tailwind 4.3.0 (`@tailwindcss/vite`) · Radix + Headless UI · TanStack Table 8 · Recharts 3
- Brand accent: **indigo `#4F46E5`** (registered as `--color-brand-*`)

## Operating contract (applies to every prompt)

1. **Read this file first.** Then re-read any shared file you intend to touch.
2. **Never break prior work.** Additive changes preferred. Contract changes
   (types, API signatures) must update every caller and be recorded below.
3. **Strict TypeScript.** No `any`, no `!` to silence the compiler. Types come
   from `@types` or feature-local `types/`. Use `unknown` + narrowing at
   trust boundaries.
4. **Best practices, not "good enough".** Feature folders, small components,
   accessibility (keyboard + ARIA + focus management), loading/empty/error on
   every async surface, no business logic in components.
5. **Static now, integration-ready.** All data flows through the mock API
   layer (Prompt 4) behind `VITE_USE_MOCKS` (Prompt 5). Components never
   import `@mocks/*` directly — only through feature hooks/services.
6. **At the end of every prompt:** `npm run typecheck && npm run lint &&
   npm run build`. Fix before stopping. Confirm the prompt's acceptance
   checklist explicitly.

## Design direction (locked)

Refined-utilitarian internal tool. Dense but highly legible, generous-enough
spacing, strong information hierarchy. Light + dark themes. Display font for
headings paired with a clean body font — **not** Inter / Roboto / Arial.
Accessibility is non-negotiable.

## Architecture cheat sheet

`components → hooks → services (feature api/) → apiClient (lib/) → (mock | axios)`

- Outside `features/<x>/` you may only import `@features/<x>` (the barrel).
- `apiClient` is the only sanctioned consumer of `@mocks/*`.
- Env is validated by Zod in `src/config/env.ts` at module load.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full contract.

---

## Prompt log

### Prompt 1 — Project skeleton, folder architecture & conventions ✅

**Status:** complete. Typecheck + lint + build + Vitest all green.

**Files added:**

- `frontend/PROGRESS.md` (this file)
- `frontend/ARCHITECTURE.md`
- `frontend/.env.example`
- `frontend/src/config/env.ts` (Zod-validated `VITE_API_BASE_URL` +
  `VITE_USE_MOCKS`)
- Full `src/` tree:
  - `src/{app,routes,config,lib,stores,hooks,types,mocks}/`
  - `src/components/{ui,layout,data,feedback}/`
  - `src/features/{auth,users,roles,projects,platforms,tasks,availability,
    disputes,dashboards,financials,profile}/{api,components,pages,schemas,
    types}/`
  - `src/styles/.gitkeep`, `src/test/.gitkeep`
- Barrel `index.ts` in every TS folder (80 total)

**Files changed:**

- `frontend/tsconfig.app.json` — added `paths` for all 10 aliases
- `frontend/vite.config.ts` — exports shared `aliases`, wires `resolve.alias`
- `frontend/vitest.config.ts` — imports `aliases` from `vite.config.ts`
- `frontend/eslint.config.js` — added `no-restricted-imports`:
  - bans `@features/*/*` (cross-feature deep imports) everywhere
  - bans `@mocks/*` everywhere **except** `src/lib/**` and `src/mocks/**`
- `frontend/src/main.tsx` — imports `App` via `@app`, side-effect imports
  `@config/env` to run validation at startup; replaces the `!` non-null
  assertion on `getElementById('root')` with an explicit throw
- `frontend/src/App.tsx` → moved to `frontend/src/app/App.tsx`
- `frontend/src/App.test.tsx` → moved to `frontend/src/app/App.test.tsx`

**Key decisions:**

- **Aliases use `@`-prefixed top-level keys, not just `@/...`.** This matches
  the prompt spec and keeps imports short (`@features/auth` vs
  `@/features/auth`).
- **`no-restricted-imports` enforces the cross-feature rule by pattern**
  (`@features/*/*`) rather than introducing `eslint-plugin-boundaries`. Within
  a feature, code uses relative paths; outside, only the barrel.
- **`apiClient` is the only sanctioned consumer of `@mocks/*`.** ESLint
  exempts `src/lib/**` and `src/mocks/**` from the `@mocks` ban so the mock
  layer can wire itself up internally without circular ESLint errors.
- **Env validation runs at module load** (`main.tsx` side-effect imports
  `@config/env`). Misconfiguration fails fast at startup with a clear message
  rather than at first network call.
- **App lives at `src/app/App.tsx`** (not `src/App.tsx`) so the architecture
  is locked from this prompt forward.
- **`src/index.css` stays at `src/` for now**; relocating to `src/styles/`
  belongs to the theme/typography pass (later prompt). Defer.

**Deferred / pending for later prompts:**

- Tailwind theme (light + dark, semantic CSS variables) and the
  display-font + body-font pairing — Prompt 7 region.
- Concrete contents of every barrel — added on demand by later prompts.
- `src/styles/` content (move of `index.css`, font @font-face, theme tokens)
  — Prompt 7 region.
- `src/test/` content (render helper, mock providers) — Prompt 4–5 region.
- Permission keys / nav config / route constants under `src/config/` —
  Prompts 5, 10, 11.

**Verification (Prompt 1 acceptance checklist):**

- [x] Tree exists (80 barrel files; 11 features × {api, components, pages,
      schemas, types} + each feature root)
- [x] Aliases resolve in a real import (`main.tsx` uses `@app` + `@config`)
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — clean
- [x] `npm run test` — 1/1 passing (App smoke)
- [x] `PROGRESS.md` written
- [x] `ARCHITECTURE.md` written

### Prompt 2 — Domain types (mirror the backend schema) ✅

**Status:** complete. Typecheck + lint + build + Vitest all green.

**Files added:**

- `src/types/primitives.ts` — `ID`, `ISODateTime`, `ISODate`, `Money` with
  the documented convention (UUIDv4, RFC 3339 UTC `Z`, `YYYY-MM-DD`,
  string-encoded `NUMERIC(12,2)`).
- `src/types/enums.ts` — `TaskStatus`, `AvailabilityStatus`, `LeadDecision`,
  `DisputeOutcome`, `Currency` as string unions.
- `src/types/pagination.ts` — `Paginated<T>` (DRF `PageNumberPagination`
  envelope) + `ApiError` (`code`, `message`, `status`, `field_errors`,
  `details`).
- `src/types/identity.ts` — `User`, `Permission`, `Role`, `Dashboard`,
  `RolePermission`, `UserRole`, `RoleDashboard`. `User.unassigned_at`
  added for entity-level soft-removal alongside `is_active`. Link tables
  carry `assigned_by`/`granted_by` + `*_at` audit + `unassigned_at` for
  reversible grants.
- `src/types/org.ts` — `Platform` (with `Currency`), `PlatformRate`
  (effective_from/effective_to), `Project` (`requires_review`),
  `ProjectMember`.
- `src/types/operational.ts` — `Task` (rate_id, rate_snapshot, currency,
  reviewed_by, reviewer_decision, platform_submitted_at, accepted_at,
  escalated_at, version), `TaskAttachment`, `AvailabilityLog`.
- `src/types/disputes.ts` — `RejectionCategory`, `Rejection`,
  `CounterArgument`, `PlatformDispute`.
- `src/types/session.ts` — `SessionUser` view-model
  (user + roles[] + dashboards[] + permissionKeys: string[]).
- `src/types/views.ts` — `TaskListItem` (frontend-shaped row with joined
  display fields, amount/currency rate snapshot, version surfaced for the
  optimistic-lock client flow) and `EarningsSummary` (per-currency bucket:
  `currency`, `taskCount`, `totalAmount`).
- `src/types/types.test.ts` — colocated typing fixture + runtime smoke. It
  constructs a fully-populated `Task` and a `SessionUser` (with resolved
  roles, dashboards, and `permissionKeys`) using only the public barrel
  imports, then asserts the same values via Vitest so the file participates
  in `npm run test`. Doubles as the acceptance proof "a scratch file can
  type a Task and SessionUser with no errors".

**Files changed:**

- `src/types/index.ts` — replaced the empty barrel with `export type`
  re-exports for every domain type, view-model, and envelope.

**Key decisions:**

- **Domain entities use snake_case; view-models mix snake_case (passthrough)
  with camelCase (derived fields).** Mirrors DRF's default serialization
  and matches the prompt's explicit `permissionKeys` naming. The barrel
  re-exports without renaming, so the wire is one transformation away
  from the types — by design.
- **Money is `string`, not `number`.** Preserves `NUMERIC(12,2)` precision
  end-to-end. Arithmetic must go through `lib/currency` helpers (TBD);
  `parseFloat` is forbidden for money.
- **Timestamps are `string` (ISO 8601 UTC with `Z` suffix).** Formatting
  is a presentation concern, not a type concern. Documented in
  `primitives.ts`.
- **No optional `?` for nullable columns.** A nullable column is
  `T | null`, not `T?`. Matches the schema's nullability exactly so the
  three-state (present / null / absent) ambiguity never appears.
- **`UserRole` / `RoleDashboard` carry both `unassigned_at` and
  `is_active`** even though they're redundant in practice. `is_active`
  drives display logic; `unassigned_at` is the audit-grade source of truth
  for when the relationship ended.
- **`Task.version` is `number` (server-managed monotonic counter)** and is
  also surfaced on `TaskListItem` so the table row can post the right
  version on the optimistic-lock mutating call without a follow-up fetch.
- **The scratch verification file lives at `src/types/types.test.ts`** so
  it is both type-checked by `tsc` and picked up by Vitest's
  `src/**/*.{test,spec}.ts` glob. Colocation matches the "tests live next
  to the unit they test" convention from ARCHITECTURE.md. The assertions
  exist so the file isn't just a typed-but-unused fixture; the actual
  acceptance check is "this file compiles".

**Open decisions (deferred to before any feature that depends on them):**

- **One-shot dispute chain?** Can a task be rejected more than once across
  its lifetime? Today's types support either — `Rejection` does not declare
  a uniqueness constraint per `task_id`. Surface this before the disputes
  feature lands.
- **`task_status_history` audit table?** `Task` currently exposes
  `platform_submitted_at`, `accepted_at`, `escalated_at` as a coarse
  timeline. Whether earnings reporting and dashboard date filtering need
  the full transition log is undecided. Re-evaluate before the financials
  feature lands.

**Verification (Prompt 2 acceptance checklist):**

- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — clean (97 modules; the typing fixture is not
      reachable from `main.tsx`, so it isn't bundled)
- [x] `npm run test` — 3/3 passing (App smoke + 2 typing-fixture asserts)
- [x] Scratch usage at `src/types/types.test.ts` constructs a `Task` and
      a `SessionUser` with no errors via the barrel
- [x] Barrel `src/types/index.ts` re-exports every type from all 9 modules
      (primitives, enums, identity, org, operational, disputes, session,
      pagination, views)

### Prompt 3 — Centralized mock dataset ✅

**Status:** complete. Typecheck + lint + build all clean; 16/16 vitest tests
pass (App smoke + 2 typing-fixture asserts + 13 integrity assertions
covering FKs, currency-per-platform, rate-window non-overlap, dispute-chain
coverage, and deep-clone isolation).

**Files added:**

- `src/mocks/data/permissions.ts` — 42 permissions across every resource
  group (tasks, projects, users, roles, platforms, financials, disputes,
  reviews, availability). Each row exported as a named constant for
  type-safe cross-file references.
- `src/mocks/data/dashboards.ts` — `employee`, `team_lead`, `management`,
  `financial`.
- `src/mocks/data/roles.ts` — `Staff`, `Team Lead`, `Admin`, `Management`
  (all `is_system: true`).
- `src/mocks/data/users.ts` — 7 users: 1 Admin, 1 TL, 1 Management, 3
  Staff (active), 1 Staff (deactivated with `unassigned_at` set). 3 have
  signed-URL avatars; 4 have `photo_url: null` to exercise the
  initials-fallback branch.
- `src/mocks/data/role_permissions.ts` — realistic per-role grants
  authored by Admin Sarah at bootstrap.
- `src/mocks/data/role_dashboards.ts` — per-role dashboard access:
  Staff→employee; TL→employee+team_lead; Admin→employee+team_lead+
  management; Management→team_lead+management+financial.
- `src/mocks/data/user_roles.ts` — one active grant per active user plus
  one historical row (`unassigned_at` set, `is_active: false`) for the
  deactivated user.
- `src/mocks/data/platforms.ts` — Cloud Audit (JOD) + Tagging Global (USD).
- `src/mocks/data/platform_rates.ts` — closed + current windows per
  platform, non-overlapping (current window has `effective_to: null`;
  closed window ends the day before the current window opens).
- `src/mocks/data/projects.ts` — Sentinel Audit (audited, JOD), Crowd Tag
  2026 (audited, USD), Quick Tag Express (fast-path,
  `requires_review: false`, USD).
- `src/mocks/data/project_members.ts` — staff + lead on each audited
  project; trusted submitter on the fast-path project.
- `src/mocks/data/rejection_categories.ts` — 5 categories; `legacy_format`
  has `is_active: false` to exercise the deprecated-category path.
- `src/mocks/data/tasks.ts` — 9 tasks covering every `TaskStatus` value
  and every dispute outcome: pending awaiting review, pending awaiting
  platform, accepted (2026 rate), rejected (open work, no counter),
  rejected → won at platform, rejected → lost at platform, rejected →
  counter rejected by lead (terminal), currently escalated (in-flight),
  plus a 2025 task on the closed legacy rate.
- `src/mocks/data/task_attachments.ts` — 3 rows; opaque object-storage
  `file_key`s, no inline URLs (signed-URL generation lives in the
  apiClient).
- `src/mocks/data/availability_logs.ts` — a full week (Mon–Sun
  2026-05-25→2026-05-31) for Yusuf and Reem covering `active`, `absent`,
  and `blocked` statuses (14 entries total).
- `src/mocks/data/rejections.ts` — 5 rejection rows (one per rejected
  task).
- `src/mocks/data/counter_arguments.ts` — 4 counter-arguments (the
  "open work" rejection deliberately has no row).
- `src/mocks/data/platform_disputes.ts` — 3 disputes (`won`, `lost`,
  `pending`); the terminal-rejected task has no platform dispute.
- `src/mocks/db.ts` — `MockDatabase` interface + `seedDb()` factory
  using `structuredClone()` for mutation-safe isolation.
- `src/mocks/db.test.ts` — integrity test verifying every FK resolves,
  currency-per-platform holds, rate windows don't overlap, every
  `TaskStatus` appears, every `DisputeOutcome` appears, at least one
  rejection has no counter, and `seedDb()` returns independent clones.
  Also prints per-table counts via `console.info` for CI visibility.
- `src/mocks/README.md` — dataset shape, ID namespace map, coverage
  matrix, invariants, and a "how to extend" recipe.

**Files changed:**

- `src/types/identity.ts` — **contract change**: added
  `User.photo_url: string | null` for the with-avatar / initials-fallback
  branch the prompt requires. Documented as opaque signed URL only — never
  a public path. Propagated to `src/types/types.test.ts`.

**Key decisions:**

- **IDs are debuggable UUIDv4 strings: third-octet group encodes entity
  type.** `00000000-0001-…` = permissions, `…-000c-…` = tasks, etc.
  Exported per-row as `export const ENTITY_KEY = '<uuid>'` so other tables
  reference them by name; no UUID is inlined twice anywhere in the
  dataset.
- **Per-table files export `readonly EntityName[]`; `db.ts` spreads into
  mutable arrays then `structuredClone`s.** Read-only at the source
  prevents accidental cross-test mutation; the mock API (next prompt)
  gets mutable structures it can write through.
- **`seedDb()` uses `structuredClone()`** (built-in, Node 22+). No deps
  added.
- **Currency is verified per task at runtime in the integrity test**
  (`Task.currency === Platform.currency`) rather than only at the type
  level. The schema lets them disagree; the test catches drift.
- **Rate-window non-overlap is asserted per platform.** Closed window's
  `effective_to` must be strictly before the next window's
  `effective_from`; at most one window per platform has
  `effective_to: null` (the current one). Mirrors the EXCLUDE constraint
  CLAUDE.md says lives Postgres-side.
- **Signed-URL hostname is `mock-storage.local`** for both avatars and
  attachments. Components rendering files must always use the returned
  URL — never reconstruct from `file_key` — so the swap to real signed
  URLs is a one-flag change in the apiClient.
- **The integrity test prints per-table counts via `console.info`.**
  Vitest's default reporter may suppress it on success; run
  `npm run test -- --reporter=verbose` (or check CI logs) to see them.

**Open decisions (still deferred):**

- **One-shot dispute chain?** The dataset includes one rejection-per-task,
  one counter-per-rejection. If multi-shot becomes the rule, additional
  fixtures land before the disputes feature.
- **`task_status_history` audit table?** Tasks currently expose
  `platform_submitted_at` / `accepted_at` / `escalated_at` as a flat
  timeline. Earnings + dashboard date filtering can be derived from these
  alone today; a full history table can land later without breaking the
  current shapes.

**Verification (Prompt 3 acceptance checklist):**

- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — clean (still 97 modules; the mock dataset is not
      reachable from `main.tsx`, so it isn't bundled — by design)
- [x] `npm run test` — 16/16 across 3 files (App smoke + typing fixtures
      + 13 dataset integrity assertions)
- [x] Referential integrity script (`src/mocks/db.test.ts`) verifies
      every FK and prints per-table counts via `console.info`
- [x] Dataset typechecks against `MockDatabase` with no casts; every
      data file annotates its export as `readonly EntityName[]`
- [x] `src/mocks/README.md` documents the dataset and the extension
      recipe
- [x] **Contract change documented**: `User.photo_url: string | null`
      added to `src/types/identity.ts`; the typing fixture in
      `src/types/types.test.ts` updated to set it explicitly

### Prompt 4 — _pending_

### Prompt 5 — _pending_

### Prompt 6 — _pending_

### Prompt 7 — _pending_

### Prompt 8 — _pending_

### Prompt 9 — _pending_

### Prompt 10 — _pending_

### Prompt 11 — _pending_

### Prompt 12 — _pending_

### Prompt 13 — _pending_

### Prompt 14 — _pending_

### Prompt 15 — _pending_

### Prompt 16 — _pending_

### Prompt 17 — _pending_

### Prompt 18 — _pending_

### Prompt 19 — _pending_

### Prompt 20 — _pending_
