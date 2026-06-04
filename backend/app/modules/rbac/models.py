"""rbac models — roles, permissions, dashboards and their link tables.

Data + invariants only. RBAC is resolved + cached per request in the service
layer; nothing here hard-codes permission strings.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base
from app.core.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.modules.accounts.models import User


class Permission(UUIDMixin, Base):
    __tablename__ = "permissions"

    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    # Resource group, for UI grouping (e.g. "tasks", "disputes").
    resource: Mapped[str] = mapped_column(String(100), nullable=False)

    role_permissions: Mapped[list[RolePermission]] = relationship(
        back_populates="permission", cascade="all, delete-orphan"
    )


class Role(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    # System roles are editable but not deletable (enforced in the service layer).
    is_system: Mapped[bool] = mapped_column(
        default=False, server_default=text("false"), nullable=False
    )

    role_permissions: Mapped[list[RolePermission]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )
    role_dashboards: Mapped[list[RoleDashboard]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )
    user_roles: Mapped[list[UserRole]] = relationship(back_populates="role")


class RolePermission(UUIDMixin, Base):
    __tablename__ = "role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permissions"),
    )

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False
    )
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # Users are deactivated, never deleted ⇒ RESTRICT. Nullable for seed/system grants.
    granted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=True
    )

    role: Mapped[Role] = relationship(back_populates="role_permissions")
    permission: Mapped[Permission] = relationship(back_populates="role_permissions")


class Dashboard(UUIDMixin, SoftDeleteMixin, Base):
    __tablename__ = "dashboards"

    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    icon: Mapped[str | None] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(
        default=0, server_default=text("0"), nullable=False
    )

    role_dashboards: Mapped[list[RoleDashboard]] = relationship(
        back_populates="dashboard", cascade="all, delete-orphan"
    )


class RoleDashboard(UUIDMixin, Base):
    __tablename__ = "role_dashboards"
    __table_args__ = (
        UniqueConstraint("role_id", "dashboard_id", name="uq_role_dashboards"),
    )

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    dashboard_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False
    )
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    granted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=True
    )

    role: Mapped[Role] = relationship(back_populates="role_dashboards")
    dashboard: Mapped[Dashboard] = relationship(back_populates="role_dashboards")


class UserRole(UUIDMixin, Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        Index("ix_user_roles_user_role", "user_id", "role_id"),
        # At most one *active* (not-yet-unassigned) row per (user, role); soft
        # removal sets ``unassigned_at`` so the pair can be re-assigned later.
        Index(
            "uq_active_user_role",
            "user_id",
            "role_id",
            unique=True,
            postgresql_where=text("unassigned_at IS NULL"),
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    assigned_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=True
    )
    unassigned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Two FKs point at users (user_id, assigned_by) ⇒ disambiguate with foreign_keys.
    user: Mapped[User] = relationship(
        back_populates="user_roles", foreign_keys=[user_id]
    )
    role: Mapped[Role] = relationship(back_populates="user_roles")
