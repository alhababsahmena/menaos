"""operations models — the task lifecycle: tasks, attachments, availability logs.

Data + invariants only. Two deferred contracts the service batch implements
(documented here so the data shape supports them):

pricing_rule
    On submit, atomically resolve the active ``ProjectRate`` for
    ``(project_id, task_type_id)`` as of the submit date
    (``effective_from <= d AND (effective_to IS NULL OR effective_to >= d)``),
    set ``rate_id`` to that row and copy its ``rate_per_task`` into
    ``rate_snapshot``. No active rate ⇒ reject the submit (never default to 0).
    ``rate_id`` and ``rate_snapshot`` must never disagree.

dispute_chain_rule (see ``app/modules/disputes/RULES.md``)
    ``status`` round-trips ``rejected -> escalated -> (won ⇒ accepted | lost ⇒
    rejected)``. Every status-affecting write bumps ``version`` (native optimistic
    lock); a stale write raises ``StaleDataError`` ⇒ HTTP 409.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.core.enums import AvailabilityStatus, TaskStatus, in_clause
from app.core.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.modules.accounts.models import User
    from app.modules.catalog.models import Project, ProjectRate, TaskType
    from app.modules.disputes.models import Rejection


class Task(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "tasks"
    __table_args__ = (
        UniqueConstraint(
            "project_id", "external_task_id", name="uq_external_task_per_project"
        ),
        CheckConstraint(in_clause("status", TaskStatus), name="ck_tasks_status"),
        CheckConstraint("time_spent_hours >= 0", name="ck_tasks_hours_nonneg"),
        CheckConstraint("rate_snapshot >= 0", name="ck_tasks_snapshot_nonneg"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False
    )
    # NOT NULL: a task cannot be priced without a type.
    task_type_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("task_types.id", ondelete="RESTRICT"), nullable=False
    )
    submitted_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    external_task_id: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    time_spent_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)

    status: Mapped[str] = mapped_column(
        String(20), server_default=text("'pending'"), nullable=False
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT")
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Provenance of the frozen snapshot. DECISION (flagged in PROGRESS.md): nullable
    # per DBML (legacy rows); recommended NOT NULL for greenfield — carried to the
    # service batch.
    rate_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("project_rates.id", ondelete="RESTRICT")
    )
    rate_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    platform_submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    escalated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Native optimistic lock: SQLAlchemy bumps this on every UPDATE and raises
    # StaleDataError when the read version no longer matches (→ ConflictError/409).
    version: Mapped[int] = mapped_column(
        Integer, server_default=text("1"), nullable=False
    )

    __mapper_args__ = {"version_id_col": version}

    project: Mapped[Project] = relationship()
    task_type: Mapped[TaskType] = relationship()
    submitter: Mapped[User] = relationship(foreign_keys=[submitted_by])
    reviewer: Mapped[User | None] = relationship(foreign_keys=[reviewed_by])
    rate: Mapped[ProjectRate | None] = relationship()
    attachments: Mapped[list[TaskAttachment]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )
    rejection: Mapped[Rejection | None] = relationship(
        back_populates="task", uselist=False
    )


class TaskAttachment(UUIDMixin, Base):
    __tablename__ = "task_attachments"
    __table_args__ = (
        CheckConstraint("file_size_bytes >= 0", name="ck_attachment_size_nonneg"),
    )

    # Owned child of the task ⇒ CASCADE.
    task_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(150), nullable=False)  # MIME type
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    # Internal object-storage path — never exposed raw; signed URLs at the API layer.
    storage_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    task: Mapped[Task] = relationship(back_populates="attachments")
    uploader: Mapped[User] = relationship()


class AvailabilityLog(UUIDMixin, Base):
    __tablename__ = "availability_logs"
    __table_args__ = (
        CheckConstraint(
            in_clause("status", AvailabilityStatus), name="ck_availability_status"
        ),
        UniqueConstraint("user_id", "log_date", name="uq_availability_per_day"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # NOTE (flagged in PROGRESS.md): no updated_at. F4 "log correction" + accurate
    # financial date-filtering will need updated_at plus a future
    # task_status_history / accepted_at source.

    user: Mapped[User] = relationship()
