"""Alembic environment (synchronous).

URL is sourced from application ``Settings``; every module's models module is
imported so autogenerate sees all tables registered on ``Base.metadata``.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.base import Base
from app.core.config import settings

# Import model modules for autogenerate side effects (tables register on Base.metadata).
from app.modules.accounts import models as accounts_models  # noqa: F401
from app.modules.catalog import models as catalog_models  # noqa: F401
from app.modules.disputes import models as disputes_models  # noqa: F401
from app.modules.operations import models as operations_models  # noqa: F401
from app.modules.rbac import models as rbac_models  # noqa: F401
from app.modules.skills import models as skills_models  # noqa: F401

config = context.config
# Use a URL already set on the config (e.g. the test DB, set by tests/conftest.py);
# otherwise fall back to the application's DATABASE_URL.
if not config.get_main_option("sqlalchemy.url"):
    config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
