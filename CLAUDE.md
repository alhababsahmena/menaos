# MENAOS — Data Ops & Tracking System

MENAOS is a data-ops logging, dispute-chain, and financial-tracking system. It
keeps an audit-grade record of operational tasks, the disputes raised against
them, and the money those tasks generate. The product surface is a decoupled
SPA (React) talking to a FastAPI API backed by PostgreSQL 16, Microsoft Entra
SSO, and S3/MinIO for signed-URL object storage.

This file is the workspace contract for future prompts: stack pins, commands,
and conventions to enforce.

## Stack reconciliation

The backend is **FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL 16**
(canonical), Python 3.12, **synchronous** (`psycopg` v3; FastAPI runs sync routes
in a threadpool). Async is a valid alternative not currently adopted — if it is
chosen later, only the driver/session/Alembic/test layer flips.

Any reference in the schema DBML or earlier docs to "Laravel migrations" / raw
`DB::statement(...)`, **or to Django/DRF**, is **superseded** by the FastAPI
stack above. Postgres-side constraints (CHECKs, partial-unique indexes, EXCLUDE
constraints) and the `btree_gist` extension + rejection trigger are written as
raw DDL via Alembic `op.execute(...)` in the relevant migration — not via Laravel
or Django migrations. DBML table names are used verbatim as SQLAlchemy
`__tablename__` (no prefixing).

The canonical schema is **`docs/schema.v1.1.dbml`** — the field-level source of
truth (22 tables + a MIGRATION LAYER section for the partial-unique indexes,
CHECK/EXCLUDE constraints, and the dispute-chain trigger that DBML can't express).

## Directory layout

```
menaos/
  backend/         # FastAPI + SQLAlchemy 2.0 + Alembic, Python 3.12 (sync)
    app/          #   application package (core/ + modules/)
    migrations/   #   Alembic env + versions/
    tests/        #   pytest test suite (mirrors app/)
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

Frontend versions were web-checked on **2026-05-31**; the FastAPI backend
versions were web-checked against the PyPI registry on **2026-06-04**. All pin
the latest stable release (with the line constraints from the canonical stack
honored).

### Backend (Python 3.12, runtime — `backend/requirements.txt`)

| Package | Pinned | Notes |
| --- | --- | --- |
| fastapi | 0.136.3 | |
| uvicorn[standard] | 0.49.0 | ASGI server |
| sqlalchemy | 2.0.50 | 2.0.x line |
| alembic | 1.18.4 | migrations |
| psycopg[binary] | 3.3.4 | psycopg 3 (not psycopg2) |
| pydantic | 2.13.4 | v2 |
| pydantic-settings | 2.14.1 | |
| python-multipart | 0.0.30 | file uploads |
| httpx | 0.28.1 | |
| pyjwt[crypto] | 2.13.0 | Entra JWT validation (not yet wired into auth) |
| boto3 | 1.43.22 | S3/MinIO |
| cachetools | 7.1.4 | in-process TTL cache for resolved permissions (no Redis) |
| gunicorn | 26.0.0 | prod process manager fronting uvicorn workers |

### Backend (dev — `backend/requirements-dev.txt`)

| Package | Pinned | Notes |
| --- | --- | --- |
| pytest | 9.0.3 | |
| factory_boy | 3.3.3 | |
| ruff | 0.15.15 | |
| black | 26.5.1 | |
| mypy | 2.1.0 | |
| pytest-cov | 7.1.0 | optional |
| boto3-stubs[s3] | 1.43.22 | optional |

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

- **React Router 7.x** — stack pin is React Router 6. Migrating to 7 is a
  separate effort (data-router APIs, framework mode).

Flagged here so future prompts know to ask before upgrading.

## Commands

### Backend

```bash
cd backend
source .venv/bin/activate          # activate the Python 3.12 venv

# Run server (PostgreSQL must be reachable per .env POSTGRES_* vars)
uvicorn app.main:app --reload      # dev

# Migrations (Alembic)
alembic upgrade head
alembic revision --autogenerate -m "message"

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
  `permissions`, `roles`, `role_permissions` — and are **resolved + cached**
  (via an in-process `cachetools` TTL cache; no Redis). No hard-coded permission
  strings in route code; ask the cache.
- **Object storage uses signed URLs only.** No public-read buckets. Generate
  short-lived signed URLs server-side; SPA never touches credentials.
- **Optimistic locking on `tasks.version`.** Mutating endpoints accept the
  current `version`; mismatch ⇒ HTTP **409** and the SPA must **invalidate +
  refetch** (TanStack Query) before retrying.
- **One currency per platform.** Money columns are `NUMERIC(12,2)`. Never
  `SUM(JOD + USD)` — segregate or convert explicitly.
- **Postgres-side constraints live in raw-DDL Alembic migrations.** CHECK
  constraints, partial-unique indexes, EXCLUDE constraints, the `btree_gist`
  extension, and the rejection trigger are written as raw SQL via
  `op.execute(forward)` with a matching `op.execute(reverse)` in `downgrade()`
  — not derived from SQLAlchemy/Pydantic validators.

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
