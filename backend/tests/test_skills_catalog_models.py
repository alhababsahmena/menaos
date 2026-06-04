"""Constraint tests for skills + catalog models. These hit real Postgres and
assert ``IntegrityError`` on flush where a CHECK / unique / exclusion must bite.
"""

from datetime import UTC, date, datetime
from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.modules.catalog.models import Platform, ProjectMember, ProjectRate, TaskType
from app.modules.skills.models import ProjectSkill, Skill, UserSkill
from tests.factories import (
    PlatformFactory,
    ProjectFactory,
    ProjectMemberFactory,
    ProjectRateFactory,
    ProjectSkillFactory,
    SkillFactory,
    TaskTypeFactory,
    UserFactory,
    UserSkillFactory,
)


def test_factories_create_all_new(db_session: Session) -> None:
    assert SkillFactory().id is not None
    assert UserSkillFactory().id is not None
    assert PlatformFactory().id is not None
    assert TaskTypeFactory().id is not None
    assert ProjectFactory().id is not None
    assert ProjectSkillFactory().id is not None
    assert ProjectRateFactory().id is not None
    assert ProjectMemberFactory().id is not None


# --- CHECK constraints -------------------------------------------------------


def test_ck_platforms_currency_accepts_valid(db_session: Session) -> None:
    platform = Platform(name="P", currency="JOD")
    db_session.add(platform)
    db_session.flush()
    assert platform.id is not None


def test_ck_platforms_currency_rejects_bad(db_session: Session) -> None:
    db_session.add(Platform(name="P", currency="EUR"))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_skills_type_accepts_valid(db_session: Session) -> None:
    skill = Skill(key="k1", name="n1", skill_type="domain")
    db_session.add(skill)
    db_session.flush()
    assert skill.id is not None


def test_ck_skills_type_rejects_bad(db_session: Session) -> None:
    db_session.add(Skill(key="k2", name="n2", skill_type="bogus"))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_proficiency_allows_null(db_session: Session) -> None:
    assert UserSkillFactory(proficiency=None).id is not None


def test_ck_proficiency_allows_valid(db_session: Session) -> None:
    assert UserSkillFactory(proficiency="expert").id is not None


def test_ck_proficiency_rejects_bad(db_session: Session) -> None:
    user = UserFactory()
    skill = SkillFactory()
    db_session.add(UserSkill(user_id=user.id, skill_id=skill.id, proficiency="guru"))
    with pytest.raises(IntegrityError):
        db_session.flush()


# --- Unique constraints ------------------------------------------------------


def test_uq_skills_type_name_rejects_dup(db_session: Session) -> None:
    SkillFactory(skill_type="domain", name="Finance")
    db_session.add(Skill(key="finance-2", name="Finance", skill_type="domain"))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_uq_user_skill_rejects_dup(db_session: Session) -> None:
    us = UserSkillFactory()
    db_session.add(UserSkill(user_id=us.user_id, skill_id=us.skill_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_uq_project_skill_rejects_dup(db_session: Session) -> None:
    ps = ProjectSkillFactory()
    db_session.add(ProjectSkill(project_id=ps.project_id, skill_id=ps.skill_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


# --- Partial-active unique (project_members) ---------------------------------


def test_uq_active_project_member_rejects_second_active(db_session: Session) -> None:
    pm = ProjectMemberFactory()
    db_session.add(ProjectMember(project_id=pm.project_id, user_id=pm.user_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_active_project_member_reassign_after_unassign(db_session: Session) -> None:
    first = ProjectMemberFactory()
    first.unassigned_at = datetime.now(UTC)
    db_session.flush()

    second = ProjectMember(project_id=first.project_id, user_id=first.user_id)
    db_session.add(second)
    db_session.flush()
    assert second.id is not None and second.unassigned_at is None


# --- Exclusion: no overlapping rate windows ----------------------------------


def test_rate_overlap_same_project_tasktype_rejected(db_session: Session) -> None:
    rate = ProjectRateFactory()  # [2025-01-01, infinity)
    db_session.add(
        ProjectRate(
            project_id=rate.project_id,
            task_type_id=rate.task_type_id,
            rate_per_task=Decimal("5.00"),
            effective_from=date(2025, 6, 1),
            effective_to=None,
        )
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_rate_overlap_different_tasktype_allowed(db_session: Session) -> None:
    rate = ProjectRateFactory()
    other_type = TaskTypeFactory()
    ok = ProjectRate(
        project_id=rate.project_id,
        task_type_id=other_type.id,
        rate_per_task=Decimal("7.00"),
        effective_from=date(2025, 1, 1),
        effective_to=None,
    )
    db_session.add(ok)
    db_session.flush()  # different task_type ⇒ no conflict
    assert ok.id is not None


def test_rate_closed_prior_then_new_open_succeeds(db_session: Session) -> None:
    project = ProjectFactory()
    ttype = TaskTypeFactory()
    prior = ProjectRate(
        project_id=project.id,
        task_type_id=ttype.id,
        rate_per_task=Decimal("10.00"),
        effective_from=date(2025, 1, 1),
        effective_to=date(2025, 5, 31),
    )
    db_session.add(prior)
    db_session.flush()

    new_open = ProjectRate(
        project_id=project.id,
        task_type_id=ttype.id,
        rate_per_task=Decimal("12.00"),
        effective_from=date(2025, 6, 1),
        effective_to=None,
    )
    db_session.add(new_open)
    db_session.flush()  # adjacent, non-overlapping window
    assert new_open.id is not None


def test_ck_project_rate_nonneg_rejects_negative(db_session: Session) -> None:
    project = ProjectFactory()
    ttype = TaskTypeFactory()
    db_session.add(
        ProjectRate(
            project_id=project.id,
            task_type_id=ttype.id,
            rate_per_task=Decimal("-1.00"),
            effective_from=date(2025, 1, 1),
        )
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


# --- RESTRICT: a priced task_type in use must not vanish ----------------------


def test_restrict_delete_tasktype_referenced_by_rate(db_session: Session) -> None:
    rate = ProjectRateFactory()
    ttype = db_session.get(TaskType, rate.task_type_id)
    assert ttype is not None
    db_session.delete(ttype)
    with pytest.raises(IntegrityError):
        db_session.flush()
