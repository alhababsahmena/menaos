"""Constraint, trigger, optimistic-lock, and whole-graph tests for the
operations + disputes models. All hit a real (migrated) Postgres schema.
"""

from decimal import Decimal

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from app.modules.accounts.models import User
from app.modules.disputes.models import (
    CounterArgument,
    PlatformDispute,
    Rejection,
)
from app.modules.operations.models import AvailabilityLog, Task, TaskAttachment
from tests.factories import (
    AvailabilityLogFactory,
    CounterArgumentFactory,
    DashboardFactory,
    PermissionFactory,
    PlatformDisputeFactory,
    PlatformFactory,
    ProjectFactory,
    ProjectMemberFactory,
    ProjectRateFactory,
    ProjectSkillFactory,
    RejectionCategoryFactory,
    RejectionFactory,
    RoleDashboardFactory,
    RoleFactory,
    RolePermissionFactory,
    SkillFactory,
    TaskAttachmentFactory,
    TaskFactory,
    TaskTypeFactory,
    UserFactory,
    UserRoleFactory,
    UserSkillFactory,
)


def test_factories_create_operations_and_disputes(db_session: Session) -> None:
    assert TaskFactory().id is not None
    assert TaskAttachmentFactory().id is not None
    assert AvailabilityLogFactory().id is not None
    assert RejectionCategoryFactory().id is not None
    assert RejectionFactory().id is not None
    assert CounterArgumentFactory().id is not None
    assert PlatformDisputeFactory().id is not None


# --- CHECK constraints -------------------------------------------------------


def _bare_task(db_session: Session, **overrides: object) -> Task:
    project = ProjectFactory()
    ttype = TaskTypeFactory()
    user = UserFactory()
    kwargs: dict[str, object] = {
        "project_id": project.id,
        "task_type_id": ttype.id,
        "submitted_by": user.id,
        "external_task_id": "ext-bare",
        "description": "d",
        "time_spent_hours": Decimal("1.00"),
        "status": "pending",
        "rate_snapshot": Decimal("1.00"),
    }
    kwargs.update(overrides)
    task = Task(**kwargs)
    db_session.add(task)
    return task


def test_ck_tasks_status_rejects_bad(db_session: Session) -> None:
    _bare_task(db_session, status="bogus")
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_tasks_hours_nonneg(db_session: Session) -> None:
    _bare_task(db_session, time_spent_hours=Decimal("-1.00"))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_tasks_snapshot_nonneg(db_session: Session) -> None:
    _bare_task(db_session, rate_snapshot=Decimal("-1.00"))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_availability_status_rejects_bad(db_session: Session) -> None:
    user = UserFactory()
    db_session.add(AvailabilityLog(user_id=user.id, log_date="2025-02-01", status="x"))
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_attachment_size_nonneg(db_session: Session) -> None:
    task = TaskFactory()
    user = UserFactory()
    db_session.add(
        TaskAttachment(
            task_id=task.id,
            uploaded_by=user.id,
            file_name="f",
            file_type="application/pdf",
            file_size_bytes=-1,
            storage_url="s3://x",
        )
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_counter_lead_decision_rejects_bad(db_session: Session) -> None:
    rejection = RejectionFactory()
    db_session.add(
        CounterArgument(rejection_id=rejection.id, argument="a", lead_decision="bogus")
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_ck_dispute_outcome_rejects_bad(db_session: Session) -> None:
    counter = CounterArgumentFactory()
    db_session.add(PlatformDispute(counter_argument_id=counter.id, outcome="bogus"))
    with pytest.raises(IntegrityError):
        db_session.flush()


# --- Unique constraints (incl. 1:1 chain) ------------------------------------


def test_uq_external_task_per_project(db_session: Session) -> None:
    task = TaskFactory(external_task_id="dup")
    _bare_task(
        db_session,
        project_id=task.project_id,
        task_type_id=task.task_type_id,
        submitted_by=task.submitted_by,
        external_task_id="dup",
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_uq_availability_per_day(db_session: Session) -> None:
    log = AvailabilityLogFactory()
    db_session.add(
        AvailabilityLog(user_id=log.user_id, log_date=log.log_date, status="absent")
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_one_rejection_per_task(db_session: Session) -> None:
    rejection = RejectionFactory()  # its task is already 'rejected'
    db_session.add(
        Rejection(
            task_id=rejection.task_id,
            category_id=rejection.category_id,
            feedback="again",
        )
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_one_counter_per_rejection(db_session: Session) -> None:
    counter = CounterArgumentFactory()
    db_session.add(
        CounterArgument(rejection_id=counter.rejection_id, argument="another")
    )
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_one_dispute_per_counter(db_session: Session) -> None:
    dispute = PlatformDisputeFactory()
    db_session.add(PlatformDispute(counter_argument_id=dispute.counter_argument_id))
    with pytest.raises(IntegrityError):
        db_session.flush()


# --- FK cascade policy -------------------------------------------------------


def test_restrict_delete_user_referenced_by_task_submitter(db_session: Session) -> None:
    task = TaskFactory()
    submitter = db_session.get(User, task.submitted_by)
    assert submitter is not None
    db_session.delete(submitter)
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_cascade_delete_task_removes_attachments(db_session: Session) -> None:
    attachment = TaskAttachmentFactory()
    task = db_session.get(Task, attachment.task_id)
    assert task is not None
    attachment_id = attachment.id
    db_session.delete(task)
    db_session.flush()
    assert db_session.get(TaskAttachment, attachment_id) is None


# --- Trigger: a rejection requires a 'rejected' task -------------------------


def test_trigger_blocks_rejection_on_non_rejected_task(db_session: Session) -> None:
    task = TaskFactory(status="pending")  # not rejected
    category = RejectionCategoryFactory()
    db_session.add(Rejection(task_id=task.id, category_id=category.id, feedback="nope"))
    with pytest.raises(DBAPIError) as exc_info:
        db_session.flush()
    assert "not rejected" in str(exc_info.value).lower()


def test_trigger_allows_rejection_on_rejected_task(db_session: Session) -> None:
    task = TaskFactory(status="rejected")
    category = RejectionCategoryFactory()
    rejection = Rejection(task_id=task.id, category_id=category.id, feedback="ok")
    db_session.add(rejection)
    db_session.flush()
    assert rejection.id is not None


# --- Optimistic lock (version_id_col) ----------------------------------------


def test_stale_version_update_raises(db_session: Session) -> None:
    task = TaskFactory()
    db_session.flush()
    # Bump the version directly in the DB, behind the ORM's back.
    db_session.execute(
        text("UPDATE tasks SET version = version + 1 WHERE id = :id"), {"id": task.id}
    )
    # The ORM still holds the old version; this write should be rejected.
    task.notes = "stale write"
    with pytest.raises(StaleDataError):
        db_session.flush()


# --- Whole-graph pipeline ----------------------------------------------------


def test_whole_graph_referential_integrity(db_session: Session) -> None:
    # Identity & access control
    user = UserFactory()
    role = RoleFactory()
    permission = PermissionFactory()
    dashboard = DashboardFactory()
    RolePermissionFactory(role=role, permission=permission)
    RoleDashboardFactory(role=role, dashboard=dashboard)
    UserRoleFactory(user=user, role=role)

    # Skills
    skill = SkillFactory()
    UserSkillFactory(user=user, skill=skill, proficiency="expert")

    # Catalog (platform → task_type → project → rate → member/skill)
    platform = PlatformFactory()
    project = ProjectFactory(platform=platform)
    task_type = TaskTypeFactory()
    rate = ProjectRateFactory(project=project, task_type=task_type)
    ProjectMemberFactory(project=project, user=user)
    ProjectSkillFactory(project=project, skill=skill)

    category = RejectionCategoryFactory()
    chains: dict[str, PlatformDispute] = {}
    for external_id, outcome in (("won-1", "won"), ("lost-1", "lost")):
        task = TaskFactory(
            project=project,
            task_type=task_type,
            submitter=user,
            external_task_id=external_id,
            status="rejected",
            rate=rate,
            rate_snapshot=rate.rate_per_task,
        )
        rejection = RejectionFactory(task=task, category=category)
        counter = CounterArgumentFactory(rejection=rejection, lead_decision="escalated")
        dispute = PlatformDisputeFactory(counter_argument=counter, outcome=outcome)

        # Touch the last two tables.
        TaskAttachmentFactory(task=task, uploader=user)

        # 1:1 chain links resolve.
        assert rejection.task_id == task.id
        assert counter.rejection_id == rejection.id
        assert dispute.counter_argument_id == counter.id
        # Pricing provenance: snapshot frozen from the rate row.
        assert task.rate_id == rate.id
        assert task.rate_snapshot == rate.rate_per_task
        chains[outcome] = dispute

    AvailabilityLogFactory(user=user)
    db_session.flush()

    assert chains["won"].outcome == "won"
    assert chains["lost"].outcome == "lost"
    # Relationship navigation (uselist=False 1:1) works both directions.
    assert chains["won"].counter_argument.rejection.task.status == "rejected"
