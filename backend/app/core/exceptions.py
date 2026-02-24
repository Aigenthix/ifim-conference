"""
Global exception classes and FastAPI exception handlers.

All exceptions carry a machine-readable `code` for client consumption.
"""
from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


# ── Custom Exception Hierarchy ─────────────────────────────

class AppError(Exception):
    """Base application error."""
    status_code: int = 500
    code: str = "INTERNAL_ERROR"

    def __init__(self, detail: str = "An unexpected error occurred", **extra: Any) -> None:
        self.detail = detail
        self.extra = extra
        super().__init__(detail)


class AuthError(AppError):
    status_code = 401
    code = "AUTH_ERROR"

    def __init__(self, detail: str = "Authentication failed") -> None:
        super().__init__(detail)


class ForbiddenError(AppError):
    status_code = 403
    code = "FORBIDDEN"

    def __init__(self, detail: str = "Access denied") -> None:
        super().__init__(detail)


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"

    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(detail)


class ConflictError(AppError):
    status_code = 409
    code = "CONFLICT"

    def __init__(self, detail: str = "Resource already exists") -> None:
        super().__init__(detail)


class RateLimitError(AppError):
    status_code = 429
    code = "RATE_LIMITED"

    def __init__(self, detail: str = "Too many requests") -> None:
        super().__init__(detail)


class ValidationError(AppError):
    status_code = 422
    code = "VALIDATION_ERROR"

    def __init__(self, detail: str = "Validation failed") -> None:
        super().__init__(detail)


# ── Exception Handlers ─────────────────────────────────────

def _build_error_response(exc: AppError) -> JSONResponse:
    body: dict[str, Any] = {
        "error": {
            "code": exc.code,
            "message": exc.detail,
        }
    }
    if exc.extra:
        body["error"]["details"] = exc.extra
    return JSONResponse(status_code=exc.status_code, content=body)


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return _build_error_response(exc)


async def unhandled_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            }
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_error_handler)
