"""Engine, session factory, and the FastAPI ``get_session`` dependency.

Synchronous: psycopg v3 driver, FastAPI runs sync routes in a threadpool.
"""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(
    bind=engine, class_=Session, expire_on_commit=False, autoflush=False
)


def get_session() -> Iterator[Session]:
    """Yield a session and guarantee it is closed.

    Services own transactions (``with session.begin(): ...``); this dependency
    only manages the session lifecycle.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
