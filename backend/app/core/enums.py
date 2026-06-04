"""Single source of truth for enumerated values.

These ``StrEnum`` members build every CHECK-constraint string in the migrations
via :func:`in_clause`. The first five enums are confirmed against the frontend
schema mirror (`frontend/src/types/index.ts`); ``SkillType`` and ``Proficiency``
carry the values from the skills/catalog batch spec.
"""

from enum import StrEnum


def in_clause(column: str, enum: type[StrEnum]) -> str:
    """Render ``column IN ('a', 'b', …)`` from an enum's values (CHECK source)."""
    members = ", ".join(f"'{member.value}'" for member in enum)
    return f"{column} IN ({members})"


class TaskStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class AvailabilityStatus(StrEnum):
    ACTIVE = "active"
    ABSENT = "absent"
    BLOCKED = "blocked"


class LeadDecision(StrEnum):
    """Team-lead decision on a counter-argument (frontend: ``CounterDecision``)."""

    PENDING = "pending"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class DisputeOutcome(StrEnum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"


class Currency(StrEnum):
    JOD = "JOD"
    USD = "USD"


class SkillType(StrEnum):
    DEVELOPMENT_LANGUAGE = "development_language"
    SPOKEN_LANGUAGE = "spoken_language"
    DOMAIN = "domain"


class Proficiency(StrEnum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"
