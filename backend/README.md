# MENAOS backend

FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL 16 (Python 3.12, synchronous).

## Prerequisites

- Python 3.12
- A reachable PostgreSQL 16. For local dev a container is used:

  ```bash
  docker run -d --name menaos-db16 \
    -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=menaos \
    -p 5433:5432 postgres:16-alpine
  docker exec menaos-db16 psql -U postgres -c "CREATE DATABASE menaos_test;"
  ```

## Setup

```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env          # adjust as needed
```

## Run

```bash
make run        # uvicorn app.main:app --reload  → http://127.0.0.1:8000
# health check:
curl http://127.0.0.1:8000/health    # {"status":"ok"}
```

## Migrations

```bash
make upgrade                  # alembic upgrade head
make revision m="message"     # autogenerate a new migration
make downgrade                # revert the last migration
```

## Quality gates

```bash
make lint       # ruff check . && black --check . && mypy app
make test       # pytest  (runs against the menaos_test database)
```

## Layout

```
app/
  core/       config, db, base, mixins, enums, exceptions, protocols, types, security
  modules/    accounts, rbac, skills, catalog, operations, disputes
              each: models / schemas / services / selectors / router / deps
migrations/   Alembic env + versions
tests/        pytest suite (transactional-rollback session fixture)
```

See `CLAUDE.md` for the design-pattern doctrine and conventions.
