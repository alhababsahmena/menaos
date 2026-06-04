# MENAOS backend — workspace contract

FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL 16, Python 3.12, **synchronous**
(`psycopg` v3; FastAPI runs sync routes in a threadpool). The repo-root
`../CLAUDE.md` is the product-level contract; this file is the backend's.

## Stack & pinned versions

Web-checked against the PyPI registry on **2026-06-04** (latest stable). Full
table in `requirements.txt` / `requirements-dev.txt`. Highlights:

| | |
| --- | --- |
| fastapi | 0.136.3 |
| uvicorn[standard] | 0.49.0 |
| sqlalchemy | 2.0.50 (2.0.x line) |
| alembic | 1.18.4 |
| psycopg[binary] | 3.3.4 (psycopg **3**) |
| pydantic / pydantic-settings | 2.13.4 / 2.14.1 |
| pyjwt[crypto] | 2.13.0 |
| boto3 | 1.43.22 |
| cachetools | 7.1.4 (in-process perm cache; no Redis) |
| gunicorn | 26.0.0 |

Dev: pytest 9.0.3 · factory_boy 3.3.3 · ruff 0.15.15 · black 26.5.1 · mypy 2.1.0.

## Sync vs async

This backend is **synchronous**. Async is a valid alternative; if adopted later,
only the driver/session/Alembic/test layer flips — application structure stays
identical.

## Design patterns — non-negotiable, one-way dependency

```
router (HTTP) → schema (I/O) · service (writes) · selector (reads) → models
```

- **Models** (`models.py`): columns, relationships, `__table_args__`
  constraints/indexes, mixins. **No business logic.**
- **Services** (`services.py`): every write/operation. Verb-named, own the unit
  of work (`with session.begin():`), raise domain exceptions.
- **Selectors** (`selectors.py`): every non-trivial read + permission/visibility
  scoping. Routers and schemas never build queries.
- **Schemas** (`schemas.py`): Pydantic request/response shape + validation only;
  they call a service/selector.
- **Routers** (`router.py`): thin, no ORM.
- **External concerns** (storage, OIDC/Graph, email) sit behind
  `app/core/protocols.py` interfaces, injected via `Depends`, faked in tests.
- **One exception hierarchy** in `app/core/exceptions.py`. SQLAlchemy
  `StaleDataError` → `ConflictError` (HTTP 409).
- **`StrEnum`s** in `app/core/enums.py` are the single source of truth and build
  every CHECK string.

## Postgres-side constraints → raw-DDL Alembic

CHECK constraints, partial-unique indexes, EXCLUDE constraints, the `btree_gist`
extension, and the rejection trigger are written as raw SQL via
`op.execute(forward)` with a matching `op.execute(reverse)` in `downgrade()` —
never derived from SQLAlchemy/Pydantic validators. Never edit an applied
revision; add a new one. Every revision must downgrade cleanly.

DBML v1.1 (`../docs/schema.v1.1.dbml`) is the field-level source of truth; use
its table names verbatim as `__tablename__` (no prefixing). Its MIGRATION LAYER
section lists every constraint DBML can't express (partial-unique indexes,
CHECKs, the rate-overlap exclusion, the dispute-chain trigger).

## Conventions (load-bearing)

- **SSO match key is `oid`, never `email`.**
- **RBAC is table-driven** (`permissions`, `roles`, `role_permissions`), resolved
  + cached via in-process `cachetools` TTL cache. No hard-coded permission
  strings in route code; ask the cache.
- **Signed URLs only** for object storage.
- **Optimistic locking on `tasks.version`** ⇒ 409 on mismatch; SPA refetches.
- **One currency per platform**; money is `NUMERIC(12,2)`. Never `SUM(JOD + USD)`.

## Commands

```bash
cd backend && source .venv/bin/activate
make run        # uvicorn app.main:app --reload
make test       # pytest
make lint       # ruff check . && black --check . && mypy app
make fmt        # ruff --fix + black
make revision m="add X"   # alembic revision --autogenerate
make upgrade    # alembic upgrade head
make downgrade  # alembic downgrade -1
```

Local Postgres 16 for dev/test runs in the `menaos-db16` Docker container
(host port **5433**, dev DB `menaos`, test DB `menaos_test`).
