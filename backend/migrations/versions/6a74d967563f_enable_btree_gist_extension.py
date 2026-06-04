"""enable btree_gist extension

Revision ID: 6a74d967563f
Revises:
Create Date: 2026-06-04 09:37:39.136956

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6a74d967563f"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # btree_gist enables EXCLUDE constraints over scalar columns (used by later
    # models for no-overlap guarantees). Idempotent so re-runs are safe.
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS btree_gist")
