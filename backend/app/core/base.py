"""Declarative base + a deterministic naming convention.

The naming convention gives FKs/indexes/constraints stable, predictable names so
Alembic autogenerate produces clean diffs. Explicit DBML constraint names are
still set per-constraint in the models where the DBML specifies one.
"""

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# No "ck" rule on purpose: CHECK constraints are always named explicitly to match
# the DBML (e.g. ck_skills_type). A "ck_%(constraint_name)s" rule would re-wrap
# those names (ck_skills_ck_skills_type), so we let explicit names pass verbatim.
NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "fk": "fk_%(table_name)s_%(column_0_N_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
