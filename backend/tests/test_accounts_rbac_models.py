"""Constraint tests for accounts + rbac models. These hit a real Postgres and
assert ``IntegrityError`` on flush where a constraint must bite.
"""

from datetime import UTC, datetime

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.modules.accounts.models import User
from app.modules.rbac.models import RoleDashboard, RolePermission, UserRole
from tests.factories import (
    DashboardFactory,
    PermissionFactory,
    RoleDashboardFactory,
    RoleFactory,
    RolePermissionFactory,
    UserFactory,
    UserRoleFactory,
)


def test_factories_create_all_seven(db_session: Session) -> None:
    assert UserFactory().id is not None
    assert RoleFactory().id is not None
    assert PermissionFactory().id is not None
    assert DashboardFactory().id is not None
    assert RolePermissionFactory().id is not None
    assert RoleDashboardFactory().id is not None
    assert UserRoleFactory().id is not None


def test_entra_object_id_unique(db_session: Session) -> None:
    UserFactory(entra_object_id="dup-oid")
    db_session.add(
        User(
            entra_object_id="dup-oid",
            email="other@example.com",
            first_name="A",
            last_name="B",
        )
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_uq_role_permissions_rejects_duplicate(db_session: Session) -> None:
    rp = RolePermissionFactory()
    db_session.add(RolePermission(role_id=rp.role_id, permission_id=rp.permission_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_uq_role_dashboards_rejects_duplicate(db_session: Session) -> None:
    rd = RoleDashboardFactory()
    db_session.add(RoleDashboard(role_id=rd.role_id, dashboard_id=rd.dashboard_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_active_user_role_rejects_second_active(db_session: Session) -> None:
    ur = UserRoleFactory()
    db_session.add(UserRole(user_id=ur.user_id, role_id=ur.role_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_active_user_role_reassign_after_soft_remove(db_session: Session) -> None:
    first = UserRoleFactory()
    # Soft-remove: the partial unique only covers rows with unassigned_at IS NULL.
    first.unassigned_at = datetime.now(UTC)
    db_session.flush()

    second = UserRole(user_id=first.user_id, role_id=first.role_id)
    db_session.add(second)
    db_session.flush()  # succeeds — only one active row for the pair

    assert second.id is not None
    assert second.unassigned_at is None


def test_restrict_delete_user_referenced_by_granted_by(db_session: Session) -> None:
    actor = UserFactory()
    RolePermissionFactory(granted_by=actor.id)
    db_session.delete(actor)
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_restrict_delete_user_referenced_by_assigned_by(db_session: Session) -> None:
    actor = UserFactory()
    UserRoleFactory(assigned_by=actor.id)
    db_session.delete(actor)
    with pytest.raises(IntegrityError):
        db_session.flush()
