# MENAOS — Data Ops & Tracking System

MENAOS is a data-ops logging, dispute-chain, and financial-tracking system. It
keeps an audit-grade record of operational tasks, the disputes raised against
them, and the money those tasks generate. The product surface is a decoupled
SPA (React) talking to a Django/DRF API backed by PostgreSQL 16, Microsoft Entra
SSO, and S3/MinIO for signed-URL object storage.

This file is the workspace contract for future prompts: stack pins, commands,
and conventions to enforce.

## Stack reconciliation

Any reference in the schema DBML or earlier docs to "Laravel migrations" or raw
`DB::statement(...)` is **superseded**. The backend is Django/DRF (canonical).
Postgres-side constraints (CHECKs, partial-unique indexes, EXCLUDE constraints)
are implemented via Django `migrations.RunSQL(...)` in the relevant app's
migrations — not via Laravel artisan migrations.

## Directory layout

```
menaos/
  backend/         # Django 5.2 LTS + DRF, Python 3.12
    config/       #   project package (settings, urls, wsgi, asgi)
    tests/        #   pytest test suite (mirrors src apps)
    .venv/        #   local virtualenv (gitignored)
    requirements.txt        # runtime pins
    requirements-dev.txt    # dev pins (-r requirements.txt)
    pyproject.toml          # ruff / black / mypy / pytest config
    .env.example            # documented env surface (copy to .env)
  frontend/        # React 19 + Vite 8 + TS 6 (strict)
    src/          #   application source
    e2e/          #   Playwright specs
    public/
    package.json
    vite.config.ts          # Vite + @tailwindcss/vite
    vitest.config.ts        # jsdom env, excludes e2e/
    playwright.config.ts
    eslint.config.js
    tsconfig*.json          # strict + noUncheckedIndexedAccess
  .gitignore
  CLAUDE.md       # this file
```

## Resolved dependency versions

All versions below were web-checked against the upstream registry on
**2026-05-31** and pin the latest stable release (with the line constraints
from the canonical stack honored).

### Backend (Python 3.12, runtime — `backend/requirements.txt`)

| Package | Pinned | Notes |
| --- | --- | --- |
| Django | 5.2.14 | LTS 5.x line; **6.0.5 is GA but NOT adopted** per stack pin |
| djangorestframework | 3.17.1 | |
| mozilla-django-oidc | 5.0.2 | Microsoft Entra SSO |
| djangorestframework-simplejwt | 5.5.1 | |
| psycopg[binary] | 3.3.4 | psycopg 3 (not psycopg2) |
| django-storages | 1.14.6 | |
| boto3 | 1.43.18 | |
| django-cors-headers | 4.9.0 | |
| django-environ | 0.13.0 | |
| gunicorn | 26.0.0 | |

### Backend (dev — `backend/requirements-dev.txt`)

| Package | Pinned | Notes |
| --- | --- | --- |
| pytest | 9.0.3 | |
| pytest-django | 4.12.0 | |
| factory-boy | 3.3.3 | |
| ruff | 0.15.15 | |
| black | 26.5.1 | |
| mypy | 2.1.0 | within `django-stubs` `<2.2` cap |
| django-stubs[compatible-mypy] | 6.0.5 | |
| djangorestframework-stubs | 3.17.0 | |

### Frontend (runtime — `frontend/package.json` `dependencies`)

| Package | Pinned | Notes |
| --- | --- | --- |
| react / react-dom | 19.2.6 | |
| react-router-dom | 6.30.4 | 6.x line per stack pin; **7.16.0 is GA but NOT adopted** |
| @tanstack/react-query | 5.100.14 | 5.x line per stack pin |
| zustand | 5.0.14 | |
| react-hook-form | 7.77.0 | |
| zod | 4.4.3 | |
| @hookform/resolvers | 5.4.0 | |
| axios | 1.16.1 | |
| @tanstack/react-table | 8.21.3 | |
| recharts | 3.8.1 | |
| @headlessui/react | 2.2.10 | |
| @radix-ui/react-dialog | 1.1.15 | |
| @radix-ui/react-dropdown-menu | 2.1.16 | |
| @radix-ui/react-popover | 1.1.15 | |
| @radix-ui/react-slot | 1.2.4 | |
| @radix-ui/react-tooltip | 1.2.8 | |

### Frontend (dev — `frontend/package.json` `devDependencies`)

| Package | Pinned | Notes |
| --- | --- | --- |
| vite | 8.0.15 | requires Node ≥ 20.19 |
| @vitejs/plugin-react | 6.0.2 | |
| typescript | 6.0.3 | `strict` + `noUncheckedIndexedAccess` |
| vitest | 4.1.7 | |
| @testing-library/react | 16.3.2 | |
| @testing-library/jest-dom | 6.9.1 | |
| @testing-library/user-event | 14.6.1 | |
| jsdom | 29.1.1 | |
| @playwright/test | 1.60.0 | browsers installed via `npx playwright install` |
| tailwindcss | 4.3.0 | v4 Vite flow (`@import "tailwindcss"`, no postcss/autoprefixer) |
| @tailwindcss/vite | 4.3.0 | |
| eslint | 10.4.1 | |
| @eslint/js | 10.0.1 | |
| typescript-eslint | 8.60.0 | |
| eslint-plugin-react-hooks | 7.1.1 | |
| eslint-plugin-react-refresh | 0.5.2 | |
| prettier | 3.8.3 | |
| globals | 17.6.0 | |
| @types/react | 19.2.15 | |
| @types/react-dom | 19.2.3 | |
| @types/node | 25.9.1 | |

### Newer majors deliberately NOT adopted

- **Django 6.0.5** — stack pin is Django 5.x LTS. Revisit after Django 5.2 LTS
  support window starts winding down.
- **React Router 7.x** — stack pin is React Router 6. Migrating to 7 is a
  separate effort (data-router APIs, framework mode).

Both are flagged here so future prompts know to ask before upgrading.

## Commands

### Backend

```bash
cd backend
source .venv/bin/activate          # activate the Python 3.12 venv

# Run server (PostgreSQL must be reachable per .env / DATABASE_URL)
python manage.py runserver

# After first migration, create the DatabaseCache table:
python manage.py createcachetable

# Tests + tooling
pytest
ruff check .
black --check .
mypy .
```

`.env` lives at `backend/.env` (copy from `backend/.env.example`). Real secrets
never leave the developer's machine; CI/prod supply env via the platform.

### Frontend

```bash
cd frontend

npm run dev          # Vite dev server on http://localhost:5173
npm run build        # tsc -b && vite build → frontend/dist
npm run preview      # serve the production build locally

npm run lint         # eslint .
npm run format       # prettier --write .
npm run typecheck    # tsc --noEmit
npm run test         # vitest run (jsdom, src/**/*.{test,spec}.{ts,tsx})
npm run test:watch   # vitest --watch
npm run test:e2e     # playwright test (boots dev server automatically)
```

`.env` lives at `frontend/.env` (Vite reads `VITE_*` prefixed vars). API base
URL belongs here.

## Conventions to enforce in later prompts

These are load-bearing and apply across every feature prompt that follows:

- **SSO match key is `oid`, never `email`.** The Entra `oid` claim is immutable
  per tenant; emails can change and be reused. Look up / link users by `oid`.
- **RBAC is table-driven.** Permissions live in three tables —
  `permissions`, `roles`, `role_permissions` — and are **resolved + cached per
  request** (via Django DatabaseCache). No hard-coded permission strings in
  view code; ask the cache.
- **Object storage uses signed URLs only.** No public-read buckets. Generate
  short-lived signed URLs server-side; SPA never touches credentials.
- **Optimistic locking on `tasks.version`.** Mutating endpoints accept the
  current `version`; mismatch ⇒ HTTP **409** and the SPA must **invalidate +
  refetch** (TanStack Query) before retrying.
- **One currency per platform.** Money columns are `NUMERIC(12,2)`. Never
  `SUM(JOD + USD)` — segregate or convert explicitly.
- **Postgres-side constraints live in `RunSQL` migrations.** CHECK constraints,
  partial-unique indexes, and EXCLUDE constraints are written as raw SQL in
  `migrations.RunSQL(forward, reverse)` blocks — not derived from Django
  validators.

## Open decisions to confirm before relevant prompts

Two design decisions are deferred. Surface them before any prompt that
implements the dispute chain or earnings reporting:

1. **One-shot dispute chain?** Can a single task be rejected more than once
   across its lifetime, or is the dispute chain strictly one-shot? Affects the
   shape of `task_disputes` and the state machine.
2. **Audit table for status transitions?** Do we need an `accepted_at`
   timestamp on `tasks`, or a full `task_status_history` audit table, to power
   earnings reports and dashboard date filtering? Affects both the task model
   and the aggregation queries.
