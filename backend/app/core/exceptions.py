"""One domain-exception hierarchy. Routers/handlers map these to HTTP statuses.

SQLAlchemy's ``StaleDataError`` (optimistic-lock failure on ``tasks.version``) is
translated to ``ConflictError`` (409) in the app's exception handlers.
"""


class AppError(Exception):
    """Base domain error. Defaults to HTTP 400."""

    status_code: int = 400
    code: str = "app_error"

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.__class__.__doc__ or "Application error"
        super().__init__(self.message)


class NotFoundError(AppError):
    """Requested resource does not exist."""

    status_code = 404
    code = "not_found"


class PermissionDeniedError(AppError):
    """Caller lacks the required permission."""

    status_code = 403
    code = "permission_denied"


class ConflictError(AppError):
    """State/optimistic-lock conflict; client must invalidate + refetch."""

    status_code = 409
    code = "conflict"
