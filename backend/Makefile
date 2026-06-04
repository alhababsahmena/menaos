.PHONY: run test lint fmt revision upgrade downgrade

run:                       ## Run the dev server (reload)
	uvicorn app.main:app --reload

test:                      ## Run the test suite
	pytest

lint:                      ## Lint + format-check + type-check
	ruff check .
	black --check .
	mypy app

fmt:                       ## Auto-fix lint + format
	ruff check --fix .
	black .

revision:                  ## Autogenerate a migration: make revision m="message"
	alembic revision --autogenerate -m "$(m)"

upgrade:                   ## Apply migrations to head
	alembic upgrade head

downgrade:                 ## Revert the last migration
	alembic downgrade -1
