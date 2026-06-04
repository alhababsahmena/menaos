"""Verify the test database session and the btree_gist extension."""

from sqlalchemy import text
from sqlalchemy.orm import Session


def test_session_executes(db_session: Session) -> None:
    assert db_session.execute(text("SELECT 1")).scalar_one() == 1


def test_btree_gist_enabled(db_session: Session) -> None:
    row = db_session.execute(
        text("SELECT 1 FROM pg_extension WHERE extname = 'btree_gist'")
    ).first()
    assert row is not None
