"""catalog models — platforms, task types, projects, project rates & members.

v1.1 billing redesign: pricing is per (project, task_type) and effective-dated,
with a no-overlap exclusion constraint. Money is ``Numeric(12,2)`` and
non-negative. Data + invariants only.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
    literal_column,
    text,
)
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.core.enums import Currency, in_clause
from app.core.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.modules.accounts.models import User


class Platform(UUIDMixin, SoftDeleteMixin, Base):
    __tablename__ = "platforms"
    __table_args__ = (
        CheckConstraint(in_clause("currency", Currency), name="ck_platforms_currency"),
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    # One currency per platform; every amount under it is in this currency.
    # DECISION (flagged in PROGRESS.md): currency at platform vs project — default platform.
    currency: Mapped[str] = mapped_column(
        String(3), server_default=text("'USD'"), nullable=False
    )

    projects: Mapped[list[Project]] = relationship(back_populates="platform")


class TaskType(UUIDMixin, SoftDeleteMixin, Base):
    __tablename__ = "task_types"

    # DECISION (flagged in PROGRESS.md): global vs platform-scoped task types —
    # default global. If scoped, a ``platform_id`` FK→platforms (RESTRICT) would
    # go here plus a UniqueConstraint("platform_id", "key").
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))

    project_rates: Mapped[list[ProjectRate]] = relationship(back_populates="task_type")


class Project(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "projects"

    platform_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("platforms.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    requires_review: Mapped[bool] = mapped_column(
        default=False, server_default=text("false"), nullable=False
    )

    platform: Mapped[Platform] = relationship(back_populates="projects")
    rates: Mapped[list[ProjectRate]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    members: Mapped[list[ProjectMember]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class ProjectRate(UUIDMixin, Base):
    __tablename__ = "project_rates"
    __table_args__ = (
        Index(
            "ix_project_rates_lookup", "project_id", "task_type_id", "effective_from"
        ),
        CheckConstraint("rate_per_task >= 0", name="ck_project_rate_nonneg"),
        # No two rate windows for the same (project, task_type) may overlap.
        # effective_to NULL = open-ended (coalesced to 'infinity'); bounds inclusive.
        # Requires btree_gist (enabled in the first migration).
        ExcludeConstraint(
            ("project_id", "="),
            ("task_type_id", "="),
            (
                literal_column(
                    "daterange(effective_from, "
                    "coalesce(effective_to, 'infinity'::date), '[]')"
                ),
                "&&",
            ),
            name="ex_project_rate_no_overlap",
            using="gist",
        ),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    # A priced type in use must not vanish ⇒ RESTRICT (deprecate via is_active).
    task_type_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("task_types.id", ondelete="RESTRICT"), nullable=False
    )
    rate_per_task: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date | None] = mapped_column(Date)  # null = current

    project: Mapped[Project] = relationship(back_populates="rates")
    task_type: Mapped[TaskType] = relationship(back_populates="project_rates")


class ProjectMember(UUIDMixin, Base):
    __tablename__ = "project_members"
    __table_args__ = (
        Index("ix_project_members_proj_user", "project_id", "user_id"),
        Index(
            "uq_active_project_member",
            "project_id",
            "user_id",
            unique=True,
            postgresql_where=text("unassigned_at IS NULL"),
        ),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    unassigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    project: Mapped[Project] = relationship(back_populates="members")
    user: Mapped[User] = relationship()
