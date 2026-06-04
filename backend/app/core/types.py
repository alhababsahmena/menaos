"""Base DTOs shared across modules.

``DTO`` is the response/transfer base: frozen (immutable) and ORM-friendly
(``from_attributes``). Request schemas subclass ``pydantic.BaseModel`` directly.
"""

from pydantic import BaseModel, ConfigDict


class DTO(BaseModel):
    """Immutable, ORM-readable data-transfer object."""

    model_config = ConfigDict(frozen=True, from_attributes=True)
