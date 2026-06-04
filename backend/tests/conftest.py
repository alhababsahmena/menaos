"""Shared test fixtures.

The test schema is built by **running the Alembic migrations** against the
``menaos_test`` database (so the test DB is byte-for-byte the migrated schema —
extension, exclusion constraint, and the rejection trigger all present, not just
what ``create_all`` would emit). Each test runs inside a SAVEPOINT-joined
transaction that is rolled back on teardown, so tests never see each other's writes.
"""

from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Import every module's models so the mapper registry is fully configured before
# any test resolves a cross-module relationship.
from app.modules.accounts import models as _accounts_models  # noqa: F401
from app.modules.catalog import models as _catalog_models  # noqa: F401
from app.modules.disputes import models as _disputes_models  # noqa: F401
from app.modules.operations import models as _operations_models  # noqa: F401
from app.modules.rbac import models as _rbac_models  # noqa: F401
from app.modules.skills import models as _skills_models  # noqa: F401
from tests.factories import ALL_FACTORIES

BACKEND_DIR = Path(__file__).resolve().parent.parent

test_engine = create_engine(settings.test_database_url, pool_pre_ping=True, future=True)
TestingSessionLocal = sessionmaker(
    bind=test_engine,
    class_=Session,
    expire_on_commit=False,
    autoflush=False,
    join_transaction_mode="create_savepoint",
)


def _alembic_config() -> Config:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", settings.test_database_url)
    return config


def _reset_schema() -> None:
    with test_engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))


@pytest.fixture(scope="session", autouse=True)
def _create_schema() -> Iterator[None]:
    # Clean slate, then apply all migrations to head (extension, tables,
    # exclusion, trigger). Reset again on teardown.
    _reset_schema()
    command.upgrade(_alembic_config(), "head")
    yield
    _reset_schema()


@pytest.fixture
def db_session() -> Iterator[Session]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(autouse=True)
def _bind_factories(db_session: Session) -> Iterator[None]:
    """Point every factory at the per-test transactional session."""
    for factory_cls in ALL_FACTORIES:
        factory_cls._meta.sqlalchemy_session = db_session
    yield
    for factory_cls in ALL_FACTORIES:
        factory_cls._meta.sqlalchemy_session = None
