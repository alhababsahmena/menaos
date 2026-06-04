# Schema parity tracker — 100% ✅

One row per table and per HIGH/MEDIUM constraint from the DBML v1.1 MIGRATION
LAYER. **All 22 tables + every HIGH/MEDIUM constraint are implemented and
migrated.** `alembic check` reports an empty diff (models == migrations); the full
chain is reversible base↔head (extension, exclusion, trigger included).
DBML v1.1 (`docs/schema.v1.1.dbml`) is authoritative.

## Extensions / infrastructure

- ☑ `btree_gist` extension (rev `6a74d967563f`) — P2

## Tables (22 per DBML v1.1)

| ☐ | Table | Module | Batch | Notes |
| --- | --- | --- | --- | --- |
| ☑ | users | accounts | P3 | match by Entra `oid` (`entra_object_id`) |
| ☑ | permissions | rbac | P3 | unique `key` + `resource` |
| ☑ | roles | rbac | P3 | `is_system` |
| ☑ | role_permissions | rbac | P3 | `uq_role_permissions` |
| ☑ | user_roles | accounts/rbac | P3 | soft-removal via `unassigned_at` |
| ☑ | dashboards | rbac | P3 | |
| ☑ | role_dashboards | rbac | P3 | `uq_role_dashboards` |
| ☑ | skills | skills | P4 | `skill_type` CHECK; `uq_skills_type_name` |
| ☑ | user_skills | skills | P4 | `proficiency` CHECK; `uq_user_skill` |
| ☑ | project_skills | skills | P4 | `uq_project_skill` |
| ☑ | platforms | catalog | P4 | one currency/platform; `ck_platforms_currency` |
| ☑ | task_types | catalog | P4 | global lookup (v1.1); replaces platform_rates pricing |
| ☑ | projects | catalog | P4 | `requires_review` |
| ☑ | project_rates | catalog | P4 | `NUMERIC(12,2)`; effective-dated; no-overlap exclusion |
| ☑ | project_members | catalog | P4 | partial-active unique |
| ☑ | tasks | operations | P5 | optimistic lock on `version`; `task_type_id`; `rate_id`→project_rates |
| ☑ | task_attachments | operations | P5 | signed-URL storage; CASCADE from task |
| ☑ | availability_logs | operations | P5 | `uq_availability_per_day`; status CHECK |
| ☑ | rejection_categories | disputes | P5 | soft-deprecate via `is_active` |
| ☑ | rejections | disputes | P5 | `uq_one_rejection_per_task` (1:1 task) |
| ☑ | counter_arguments | disputes | P5 | `uq_one_counter_per_rejection`; lead-decision CHECK |
| ☑ | platform_disputes | disputes | P5 | `uq_one_dispute_per_counter`; outcome CHECK |

> v1.0's `platform_rates` and `task_history` are **not** in v1.1. Pricing moved
> to `project_rates` keyed `(project_id, task_type_id)`; `task_types` is new.

## Extensions beyond v1.1 (documented)

| Item | Module | Batch | Note |
| --- | --- | --- | --- |
| `users.password` | accounts | P5 | **Dual auth** (local password + Entra SSO). Not in v1.1 DBML — deliberate extension. Stores a HASH (argon2/bcrypt), nullable for SSO-only users. Migration `b9bfadafa8b5`. |

## MIGRATION LAYER constraints

| ☐ | Constraint | Kind | Batch |
| --- | --- | --- | --- |
| ☑ | uq_active_user_role | partial unique | P3 |
| ☑ | uq_active_project_member | partial unique | P4 |
| ☑ | ck_platforms_currency | CHECK | P4 |
| ☑ | ck_skills_type | CHECK | P4 |
| ☑ | ck_user_skills_proficiency | CHECK | P4 |
| ☑ | ex_project_rate_no_overlap | EXCLUDE (gist) | P4 |
| ☑ | ck_project_rate_nonneg (hardening) | CHECK | P4 |
| ☑ | ck_tasks_status | CHECK | P5 |
| ☑ | ck_availability_status | CHECK | P5 |
| ☑ | ck_counter_lead_decision | CHECK | P5 |
| ☑ | ck_dispute_outcome | CHECK | P5 |
| ☑ | tasks.version optimistic lock | `version_id_col` (+ service action) | P5 |
| ☑ | uq_external_task_per_project | unique | P5 |
| ☑ | uq_availability_per_day | unique | P5 |
| ☑ | tasks.rate_id → project_rates integrity | FK (RESTRICT) | P5 |
| ☑ | trg_rejection_requires_rejected | trigger (raw DDL) | P5 |
| ☑ | ck_tasks_hours_nonneg / ck_tasks_snapshot_nonneg / ck_attachment_size_nonneg (hardening) | CHECK | P5 |

## Money — hardening

| ☐ | Column | Type | Batch |
| --- | --- | --- | --- |
| ☑ | project_rates.rate_per_task | `Numeric(12,2)` | P4 |
| ☑ | tasks.rate_snapshot | `Numeric(12,2)` | P5 |
| ☑ | tasks.time_spent_hours | `Numeric(5,2)` | P5 |
| ☑ | task_attachments.file_size_bytes | `BigInteger` | P5 |

## ERD / model inventory (22 models)

Key FK edges (`→` = RESTRICT, `⇒` = CASCADE):

```
accounts   User
rbac       Permission   Role   RolePermission(role⇒,permission⇒,granted_by→User)
           UserRole(user→User,role→Role,assigned_by→User)
           Dashboard    RoleDashboard(role⇒,dashboard⇒,granted_by→User)
skills     Skill        UserSkill(user→User,skill→Skill)
           ProjectSkill(project⇒Project,skill→Skill)
catalog    Platform     TaskType
           Project(platform→Platform)
           ProjectRate(project⇒Project,task_type→TaskType)   [EXCLUDE no-overlap]
           ProjectMember(project⇒Project,user→User)          [partial-active unique]
operations Task(project→Project,task_type→TaskType,submitted_by→User,
                reviewed_by→User,rate_id→ProjectRate)         [version_id_col]
           TaskAttachment(task⇒Task,uploaded_by→User)
           AvailabilityLog(user→User)
disputes   RejectionCategory
           Rejection(task→Task[1:1],category→RejectionCategory)   [trigger: task must be 'rejected']
           CounterArgument(rejection⇒Rejection[1:1],reviewed_by→User)
           PlatformDispute(counter_argument⇒CounterArgument[1:1],recorded_by→User)
```

A full DBML ERD (with column-level detail and `Ref:` edges) renders from
`docs/schema.v1.1.dbml` at https://dbdiagram.io.

## Migration chain

| Rev | Summary |
| --- | --- |
| `6a74d967563f` | btree_gist extension (P2) |
| `252ffd32950c` | accounts + rbac (P3) |
| `eb5bdeaf45c4` | skills + catalog, exclusion (P4) |
| `b9bfadafa8b5` | users.password (dual-auth extension, P5) |
| `c5d888e9fd6a` | operations + disputes + rejection trigger (P5) |
