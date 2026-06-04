"""factory_boy factories for the domain models.

Each factory's ``sqlalchemy_session`` is bound per test by the ``_bind_factories``
fixture in conftest. ``sqlalchemy_session_persistence = "flush"`` so building an
object hits the DB (and fires constraints) immediately.
"""

from datetime import date
from decimal import Decimal

import factory
from factory.alchemy import SQLAlchemyModelFactory

from app.core.enums import SkillType
from app.modules.accounts.models import User
from app.modules.catalog.models import (
    Platform,
    Project,
    ProjectMember,
    ProjectRate,
    TaskType,
)
from app.modules.disputes.models import (
    CounterArgument,
    PlatformDispute,
    Rejection,
    RejectionCategory,
)
from app.modules.operations.models import AvailabilityLog, Task, TaskAttachment
from app.modules.rbac.models import (
    Dashboard,
    Permission,
    Role,
    RoleDashboard,
    RolePermission,
    UserRole,
)
from app.modules.skills.models import ProjectSkill, Skill, UserSkill


class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session_persistence = "flush"

    entra_object_id = factory.Sequence(lambda n: f"oid-{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = "Test"
    last_name = factory.Sequence(lambda n: f"User{n}")


class RoleFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Role
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"role-{n}")
    description = "A role"


class PermissionFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Permission
        sqlalchemy_session_persistence = "flush"

    key = factory.Sequence(lambda n: f"perm.action.{n}")
    name = factory.Sequence(lambda n: f"Permission {n}")
    resource = "tasks"


class DashboardFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Dashboard
        sqlalchemy_session_persistence = "flush"

    key = factory.Sequence(lambda n: f"dashboard-{n}")
    name = factory.Sequence(lambda n: f"Dashboard {n}")
    sort_order = 0


class RolePermissionFactory(SQLAlchemyModelFactory):
    class Meta:
        model = RolePermission
        sqlalchemy_session_persistence = "flush"

    role = factory.SubFactory(RoleFactory)
    permission = factory.SubFactory(PermissionFactory)


class RoleDashboardFactory(SQLAlchemyModelFactory):
    class Meta:
        model = RoleDashboard
        sqlalchemy_session_persistence = "flush"

    role = factory.SubFactory(RoleFactory)
    dashboard = factory.SubFactory(DashboardFactory)


class UserRoleFactory(SQLAlchemyModelFactory):
    class Meta:
        model = UserRole
        sqlalchemy_session_persistence = "flush"

    user = factory.SubFactory(UserFactory)
    role = factory.SubFactory(RoleFactory)


class SkillFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Skill
        sqlalchemy_session_persistence = "flush"

    key = factory.Sequence(lambda n: f"skill-{n}")
    name = factory.Sequence(lambda n: f"Skill {n}")
    skill_type = SkillType.DEVELOPMENT_LANGUAGE.value


class UserSkillFactory(SQLAlchemyModelFactory):
    class Meta:
        model = UserSkill
        sqlalchemy_session_persistence = "flush"

    user = factory.SubFactory(UserFactory)
    skill = factory.SubFactory(SkillFactory)


class PlatformFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Platform
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Platform {n}")
    currency = "USD"


class TaskTypeFactory(SQLAlchemyModelFactory):
    class Meta:
        model = TaskType
        sqlalchemy_session_persistence = "flush"

    key = factory.Sequence(lambda n: f"task-type-{n}")
    name = factory.Sequence(lambda n: f"Task Type {n}")


class ProjectFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Project
        sqlalchemy_session_persistence = "flush"

    platform = factory.SubFactory(PlatformFactory)
    name = factory.Sequence(lambda n: f"Project {n}")


class ProjectSkillFactory(SQLAlchemyModelFactory):
    class Meta:
        model = ProjectSkill
        sqlalchemy_session_persistence = "flush"

    project = factory.SubFactory(ProjectFactory)
    skill = factory.SubFactory(SkillFactory)


class ProjectRateFactory(SQLAlchemyModelFactory):
    class Meta:
        model = ProjectRate
        sqlalchemy_session_persistence = "flush"

    project = factory.SubFactory(ProjectFactory)
    task_type = factory.SubFactory(TaskTypeFactory)
    rate_per_task = Decimal("10.00")
    effective_from = date(2025, 1, 1)
    effective_to = None  # open-ended = current window


class ProjectMemberFactory(SQLAlchemyModelFactory):
    class Meta:
        model = ProjectMember
        sqlalchemy_session_persistence = "flush"

    project = factory.SubFactory(ProjectFactory)
    user = factory.SubFactory(UserFactory)


class TaskFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Task
        sqlalchemy_session_persistence = "flush"

    project = factory.SubFactory(ProjectFactory)
    task_type = factory.SubFactory(TaskTypeFactory)
    submitter = factory.SubFactory(UserFactory)
    external_task_id = factory.Sequence(lambda n: f"ext-{n}")
    description = "Logged work."
    time_spent_hours = Decimal("1.50")
    status = "pending"
    rate_snapshot = Decimal("10.00")


class TaskAttachmentFactory(SQLAlchemyModelFactory):
    class Meta:
        model = TaskAttachment
        sqlalchemy_session_persistence = "flush"

    task = factory.SubFactory(TaskFactory)
    uploader = factory.SubFactory(UserFactory)
    file_name = factory.Sequence(lambda n: f"file-{n}.pdf")
    file_type = "application/pdf"
    file_size_bytes = 1024
    storage_url = factory.Sequence(lambda n: f"s3://menaos/att/{n}")


class AvailabilityLogFactory(SQLAlchemyModelFactory):
    class Meta:
        model = AvailabilityLog
        sqlalchemy_session_persistence = "flush"

    user = factory.SubFactory(UserFactory)
    log_date = date(2025, 1, 1)
    status = "active"


class RejectionCategoryFactory(SQLAlchemyModelFactory):
    class Meta:
        model = RejectionCategory
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Category {n}")


class RejectionFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Rejection
        sqlalchemy_session_persistence = "flush"

    # The trigger requires the task to be 'rejected' before a rejection can exist.
    task = factory.SubFactory(TaskFactory, status="rejected")
    category = factory.SubFactory(RejectionCategoryFactory)
    feedback = "Did not meet quality bar."


class CounterArgumentFactory(SQLAlchemyModelFactory):
    class Meta:
        model = CounterArgument
        sqlalchemy_session_persistence = "flush"

    rejection = factory.SubFactory(RejectionFactory)
    argument = "The work meets the spec."
    lead_decision = "pending"


class PlatformDisputeFactory(SQLAlchemyModelFactory):
    class Meta:
        model = PlatformDispute
        sqlalchemy_session_persistence = "flush"

    counter_argument = factory.SubFactory(CounterArgumentFactory)
    outcome = "pending"


ALL_FACTORIES = (
    UserFactory,
    RoleFactory,
    PermissionFactory,
    DashboardFactory,
    RolePermissionFactory,
    RoleDashboardFactory,
    UserRoleFactory,
    SkillFactory,
    UserSkillFactory,
    PlatformFactory,
    TaskTypeFactory,
    ProjectFactory,
    ProjectSkillFactory,
    ProjectRateFactory,
    ProjectMemberFactory,
    TaskFactory,
    TaskAttachmentFactory,
    AvailabilityLogFactory,
    RejectionCategoryFactory,
    RejectionFactory,
    CounterArgumentFactory,
    PlatformDisputeFactory,
)
