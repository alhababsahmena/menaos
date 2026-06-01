# MENAOS Frontend — Architecture

This document is the load-bearing contract for the MENAOS SPA. Every prompt in
the 20-prompt build chain assumes these rules. **Read this before changing any
shared file.**

## Stack

- React 19 + TypeScript 6 (strict, `noUncheckedIndexedAccess`)
- Vite 8 (dev/build) + Vitest 4 (jsdom) + Playwright (E2E)
- React Router 6 · TanStack Query 5 · Zustand · React Hook Form + Zod
- Axios for HTTP · Tailwind 4 (Vite plugin) · Radix + Headless UI for primitives
- TanStack Table · Recharts

## Layering rule (one-way only)

```
components  →  hooks  →  services (feature `api/`)  →  apiClient (lib)  →  (mock | axios)
                                                          │
                                                          ├─ VITE_USE_MOCKS=true   → in-memory mock layer (src/mocks)
                                                          └─ VITE_USE_MOCKS=false  → real Django/DRF backend (axios)
```

Hard rules enforced by ESLint + code review:

1. **Components never import `@mocks/*` directly.** They consume data through
   feature-level hooks (`useUsers()`, `useTasks()`, …) which call the feature
   service in `features/<x>/api/`. The service calls `apiClient`. `apiClient`
   is the only sanctioned consumer of the mock layer.
2. **No business logic in components.** Push transforms/validation/coercion
   into hooks, services, or `lib/`. Components render and dispatch — nothing
   else.
3. **Feature isolation.** Code outside `features/<x>/` may only import from
   `@features/<x>` (the public barrel). Internal feature files must use
   relative paths (`./components/Foo`, `../schemas/userSchema`). Enforced by
   the `no-restricted-imports` ESLint rule.
4. **Every async surface ships three states.** Loading, empty, and error are
   not optional. See `components/feedback/` (Prompt 8+).
5. **Types come from `@types` or feature-local `types/`.** No `any`. Use
   `unknown` + narrowing at trust boundaries. No `!` to silence the compiler.
6. **Validate at the edge.** Anything entering the app (env, forms, API
   responses) is parsed through Zod before reaching domain types.

## Directory layout

```
src/
  app/            providers, root App, global error boundary
  routes/         route table, guards, lazy route modules
  config/         env (Zod-validated), permission keys, nav config, route constants
  lib/            apiClient, queryClient, axios instance, formatters, currency, dates
  stores/         Zustand stores (auth session, UI, filters, …)
  hooks/          cross-feature hooks
  types/          shared domain types mirroring the backend (Prompt 2)
  mocks/          centralized mock dataset + mock API (Prompts 3–4)
  components/
    ui/           design-system primitives (Prompt 8)
    layout/       app shell, sidebar, topbar (Prompt 11)
    data/         DataTable, filters, KPI/chart wrappers (Prompt 14)
    feedback/     toasts, empty / error / loading states
  features/
    auth/  users/  roles/  projects/  platforms/  tasks/
    availability/  disputes/  dashboards/  financials/  profile/
      api/         feature services (call apiClient)
      components/  feature-scoped components
      pages/       route-level page components
      schemas/     Zod schemas (form + response parsing)
      types/       feature-local types (when not promotable to @types)
      index.ts     public barrel — the ONLY surface other code may import
  styles/         tailwind entry, css variables, fonts
  test/           test setup, render helpers, mock providers
```

## Path aliases

| Alias          | Resolves to        |
| -------------- | ------------------ |
| `@/*`          | `src/*`            |
| `@app/*`       | `src/app/*`        |
| `@components/*`| `src/components/*` |
| `@features/*`  | `src/features/*`   |
| `@lib/*`       | `src/lib/*`        |
| `@config/*`    | `src/config/*`     |
| `@types/*`     | `src/types/*`      |
| `@mocks/*`     | `src/mocks/*`      |
| `@stores/*`    | `src/stores/*`     |
| `@hooks/*`     | `src/hooks/*`      |

Wired in `tsconfig.app.json` (TS resolution), `vite.config.ts` (bundler), and
`vitest.config.ts` (test bundler). All three must stay in sync.

`@features/<x>/<anything>` is intentionally **disallowed** from outside that
feature by the `no-restricted-imports` ESLint rule — go through the barrel.

## Environment

`src/config/env.ts` validates the env surface through Zod at module load and
throws a clear error if misconfigured. Today:

| Var                  | Type                              | Default                       |
| -------------------- | --------------------------------- | ----------------------------- |
| `VITE_API_BASE_URL`  | URL                               | `http://localhost:8000/api`   |
| `VITE_USE_MOCKS`     | bool (string-coerced)             | `true`                        |

Document any new env var here and in `frontend/.env.example` when you add it.

## Conventions

- **Barrels everywhere.** Every TS folder has an `index.ts`. Add or update the
  barrel when you add a public export.
- **Colocate Zod schemas with the feature** under `features/<x>/schemas/`. A
  form and its API response live next to each other; the parsed Zod type
  drives the form types and the API response narrowing.
- **Routes are lazy-loaded by feature** from the route table in `src/routes/`.
  Feature pages are exposed via the feature barrel only.
- **Tests live next to the unit they test** (`Foo.test.tsx` beside `Foo.tsx`),
  not in a sibling `__tests__/` directory. E2E specs live under `e2e/`.
- **Run `npm run typecheck`, `npm run lint`, and `npm run build`** at the end
  of every change. CI runs the same.

## What this file is NOT

Not a tutorial, not an onboarding doc, not a code style guide. Style is
handled by ESLint + Prettier + tsconfig — this document covers the boundaries
and contracts that ESLint can't fully express.
