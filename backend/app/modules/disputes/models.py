"""disputes models — the one-shot rejection → counter → dispute chain.

Data + invariants only. The full state machine (and the won ⇒ accepted earnings
round-trip) is documented in ``RULES.md`` and implemented by the service batch.
Each link is strictly 1:1 (unique FK + ``uselist=False``). A defence-in-depth
trigger (``trg_rejection_requires_rejected``) blocks creating a rejection for a
task that is not ``rejected`` — see the operations+disputes migration.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.core.enums import DisputeOutcome, LeadDecision, in_clause
from app.core.mixins import SoftDeleteMixin, UUIDMixin

if TYPE_CHECKING:
    from app.modules.accounts.models import User
    from app.modules.operations.models import Task


class RejectionCategory(UUIDMixin, SoftDeleteMixin, Base):
    __tablename__ = "rejection_categories"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    rejections: Mapped[list[Rejection]] = relationship(back_populates="category")


class Rejection(UUIDMixin, Base):
    __tablename__ = "rejections"
    __table_args__ = (UniqueConstraint("task_id", name="uq_one_rejection_per_task"),)

    # 1:1 with the task. RESTRICT — never cascade-destroy audit/financial history.
    task_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="RESTRICT"), nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rejection_categories.id", ondelete="RESTRICT"), nullable=False
    )
    feedback: Mapped[str] = mapped_column(Text, nullable=False)
    rejected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    task: Mapped[Task] = relationship(back_populates="rejection")
    category: Mapped[RejectionCategory] = relationship(back_populates="rejections")
    counter_argument: Mapped[CounterArgument | None] = relationship(
        back_populates="rejection", uselist=False, cascade="all, delete-orphan"
    )


class CounterArgument(UUIDMixin, Base):
    __tablename__ = "counter_arguments"
    __table_args__ = (
        UniqueConstraint("rejection_id", name="uq_one_counter_per_rejection"),
        CheckConstraint(
            in_clause("lead_decision", LeadDecision), name="ck_counter_lead_decision"
        ),
    )

    # 1:1 with the rejection; owned child ⇒ CASCADE.
    rejection_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rejections.id", ondelete="CASCADE"), nullable=False
    )
    argument: Mapped[str] = mapped_column(Text, nullable=False)
    lead_decision: Mapped[str] = mapped_column(
        String(20), server_default=text("'pending'"), nullable=False
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    rejection: Mapped[Rejection] = relationship(back_populates="counter_argument")
    reviewer: Mapped[User | None] = relationship(foreign_keys=[reviewed_by])
    platform_dispute: Mapped[PlatformDispute | None] = relationship(
        back_populates="counter_argument", uselist=False, cascade="all, delete-orphan"
    )


class PlatformDispute(UUIDMixin, Base):
    __tablename__ = "platform_disputes"
    __table_args__ = (
        UniqueConstraint("counter_argument_id", name="uq_one_dispute_per_counter"),
        CheckConstraint(
            in_clause("outcome", DisputeOutcome), name="ck_dispute_outcome"
        ),
    )

    # 1:1 with the counter-argument; owned child ⇒ CASCADE.
    counter_argument_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("counter_arguments.id", ondelete="CASCADE"), nullable=False
    )
    outcome: Mapped[str] = mapped_column(
        String(20), server_default=text("'pending'"), nullable=False
    )
    recorded_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT")
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    platform_notes: Mapped[str | None] = mapped_column(Text)

    counter_argument: Mapped[CounterArgument] = relationship(
        back_populates="platform_dispute"
    )
    recorder: Mapped[User | None] = relationship(foreign_keys=[recorded_by])
