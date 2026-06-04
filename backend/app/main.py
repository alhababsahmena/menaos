"""FastAPI application factory.

Wires CORS, the domain-exception handlers, and a ``/health`` probe. Domain routers
are registered as modules are implemented.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm.exc import StaleDataError

from app.core.config import settings
from app.core.exceptions import AppError, ConflictError


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
    )


def create_app() -> FastAPI:
    app = FastAPI(title="MENAOS API", debug=settings.debug)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def _handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
        # AppError subclasses (NotFound/PermissionDenied/Conflict) resolve via MRO.
        return _error_response(exc.status_code, exc.code, exc.message)

    @app.exception_handler(StaleDataError)
    async def _handle_stale_data(
        _request: Request, _exc: StaleDataError
    ) -> JSONResponse:
        conflict = ConflictError(
            "Resource was modified by another request; invalidate and refetch."
        )
        return _error_response(conflict.status_code, conflict.code, conflict.message)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
