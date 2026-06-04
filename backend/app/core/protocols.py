"""External-concern interfaces (DI seams).

Concrete implementations (boto3 S3, Entra Graph, SMTP) live in adapter modules and
are injected via ``Depends``; tests supply fakes. Routers/services depend only on
these Protocols, never on the concrete clients.
"""

from typing import Protocol


class StorageClient(Protocol):
    """Object storage. Signed URLs only — no public-read buckets."""

    def signed_url(self, key: str, *, expires_in: int = 900) -> str: ...

    def upload(self, key: str, data: bytes, *, content_type: str) -> str: ...


class IdentityClient(Protocol):
    """Entra/OIDC identity lookups. Match users by immutable ``oid``, never email."""

    def fetch_user(self, oid: str) -> dict[str, object]: ...


class EmailClient(Protocol):
    def send(self, *, to: str, subject: str, body: str) -> None: ...
