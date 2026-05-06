from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

SCHEMA_VERSION = "2026-05-06.wbs-04"
CORRELATION_ID_HEADER = "X-Correlation-ID"

app = FastAPI(title="AUTOMETA API")

STATUS_TO_ERROR_CODE = {
    400: "bad-request",
    401: "unauthorized",
    403: "forbidden",
    404: "not-found",
    409: "conflict",
    422: "validation-failed",
    429: "rate-limited",
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _correlation_id(request: Request) -> str:
    return request.headers.get(CORRELATION_ID_HEADER) or str(uuid4())


def _meta(correlation_id: str) -> dict[str, str]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "correlationId": correlation_id,
        "emittedAt": _utc_now(),
    }


def _success_response(data: dict[str, Any], correlation_id: str) -> dict[str, Any]:
    return {
        "kind": "api-response",
        "ok": True,
        "data": data,
        "meta": _meta(correlation_id),
    }


def _error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    correlation_id: str,
    retryable: bool = False,
    details: list[dict[str, Any]] | None = None,
) -> JSONResponse:
    envelope = {
        "kind": "error-envelope",
        "schemaVersion": SCHEMA_VERSION,
        "code": code,
        "message": message,
        "correlationId": correlation_id,
        "retryable": retryable,
        "details": details or [],
    }
    return JSONResponse(
        status_code=status_code,
        content={
            "kind": "api-response",
            "ok": False,
            "error": envelope,
            "meta": _meta(correlation_id),
        },
        headers={CORRELATION_ID_HEADER: correlation_id},
    )


def _http_error_code(status_code: int) -> str:
    if status_code >= 500:
        return "internal"
    return STATUS_TO_ERROR_CODE.get(status_code, "bad-request")


def _validation_details(exc: RequestValidationError) -> list[dict[str, str]]:
    details: list[dict[str, str]] = []
    for error in exc.errors():
        location = ".".join(str(part) for part in error.get("loc", ()))
        issue = "missing" if error.get("type") == "missing" else "invalid"
        details.append({"kind": "field", "field": location, "issue": issue})
    return details


@app.get("/health")
def health(request: Request, response: Response) -> dict[str, Any]:
    correlation_id = _correlation_id(request)
    response.headers[CORRELATION_ID_HEADER] = correlation_id
    return _success_response(
        {
            "kind": "health-status",
            "status": "ok",
            "service": "api",
        },
        correlation_id,
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    correlation_id = _correlation_id(request)
    message = exc.detail if isinstance(exc.detail, str) else "HTTP request failed."
    return _error_response(
        status_code=exc.status_code,
        code=_http_error_code(exc.status_code),
        message=message,
        correlation_id=correlation_id,
        retryable=exc.status_code == 429 or exc.status_code >= 500,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    correlation_id = _correlation_id(request)
    return _error_response(
        status_code=422,
        code="validation-failed",
        message="Request validation failed.",
        correlation_id=correlation_id,
        details=_validation_details(exc),
    )
