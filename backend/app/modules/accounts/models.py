"""accounts models — the ``User``. Data + invariants only.

Dual authentication: Microsoft Entra SSO (matched on the immutable ``oid`` /
``entra_object_id``) **and** an optional local password. This extends the v1.1
DBML, which modelled SSO-only.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.core.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.modules.rbac.models import UserRole


class User(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"

    # SSO match key — the Entra ``oid`` claim. Immutable per tenant; lookups/links
    # go through this, never ``email`` (immutability enforced in the service layer).
    entra_object_id: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    # Display / notifications only — not an identity key.
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    # ALTERNATIVE (recommended): emails get reassigned when staff leave, and
    # deactivated users are never deleted, so a reused address collides on the
    # plain ``unique=True`` above. To allow reuse, drop ``unique=True`` from email
    # and add a partial unique over active rows only:
    #   __table_args__ = (
    #       Index("uq_active_email", "email", unique=True,
    #             postgresql_where=text("is_active")),
    #   )
    # Default keeps the DBML's plain unique; the choice is flagged in PROGRESS.md.
    first_name: Mapped[str] = mapped_column(String(150), nullable=False)
    last_name: Mapped[str] = mapped_column(String(150), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(1000))
    # Local-password auth (dual auth alongside Entra SSO). MUST store a password
    # HASH (argon2/bcrypt), never plaintext — hashing + verification live in the
    # auth service batch. NULL for SSO-only users who never set a local password.
    password: Mapped[str | None] = mapped_column(String(1000))

    user_roles: Mapped[list[UserRole]] = relationship(
        back_populates="user", foreign_keys="UserRole.user_id"
    )
