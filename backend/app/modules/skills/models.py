"""skills models — skills catalog, per-user proficiency, per-project requirements.

Data + invariants only. Enum membership is enforced by CHECK constraints built
from ``app.core.enums`` (the single source of truth).
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
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.core.enums import Proficiency, SkillType, in_clause
from app.core.mixins import SoftDeleteMixin, UUIDMixin

if TYPE_CHECKING:
    from app.modules.accounts.models import User
    from app.modules.catalog.models import Project


class Skill(UUIDMixin, SoftDeleteMixin, Base):
    __tablename__ = "skills"
    __table_args__ = (
        CheckConstraint(in_clause("skill_type", SkillType), name="ck_skills_type"),
        UniqueConstraint("skill_type", "name", name="uq_skills_type_name"),
    )

    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    # DECISION (flagged in PROGRESS.md): skill_type CHECK vs a skill_categories
    # lookup table — default is the CHECK above.
    skill_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))

    user_skills: Mapped[list[UserSkill]] = relationship(
        back_populates="skill", cascade="all, delete-orphan"
    )
    project_skills: Mapped[list[ProjectSkill]] = relationship(
        back_populates="skill", cascade="all, delete-orphan"
    )


class UserSkill(UUIDMixin, Base):
    __tablename__ = "user_skills"
    __table_args__ = (
        CheckConstraint(
            f"proficiency IS NULL OR {in_clause('proficiency', Proficiency)}",
            name="ck_user_skills_proficiency",
        ),
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("skills.id", ondelete="RESTRICT"), nullable=False
    )
    proficiency: Mapped[str | None] = mapped_column(String(50))
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    skill: Mapped[Skill] = relationship(back_populates="user_skills")
    user: Mapped[User] = relationship()


class ProjectSkill(UUIDMixin, Base):
    __tablename__ = "project_skills"
    __table_args__ = (
        UniqueConstraint("project_id", "skill_id", name="uq_project_skill"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("skills.id", ondelete="RESTRICT"), nullable=False
    )
    is_required: Mapped[bool] = mapped_column(
        default=True, server_default=text("true"), nullable=False
    )

    skill: Mapped[Skill] = relationship(back_populates="project_skills")
    project: Mapped[Project] = relationship()
