import asyncio
import json

from fastapi import Response
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.main import (
    CORRELATION_ID_HEADER,
    SCHEMA_VERSION,
    app,
    health,
    http_exception_handler,
)


def test_health_returns_success_envelope() -> None:
    request = _RequestStub({CORRELATION_ID_HEADER: "test-correlation"})
    response = Response()

    body = health(request, response)

    assert response.headers[CORRELATION_ID_HEADER] == "test-correlation"
    assert body["kind"] == "api-response"
    assert body["ok"] is True
    assert body["data"] == {
        "kind": "health-status",
        "status": "ok",
        "service": "api",
    }
    assert body["meta"]["schemaVersion"] == SCHEMA_VERSION
    assert body["meta"]["correlationId"] == "test-correlation"
    assert "emittedAt" in body["meta"]
    assert any(route.path == "/health" for route in app.routes)


def test_health_generates_correlation_id_when_missing() -> None:
    request = _RequestStub({})
    response = Response()

    body = health(request, response)

    assert response.headers[CORRELATION_ID_HEADER]
    assert body["meta"]["correlationId"] == response.headers[CORRELATION_ID_HEADER]


def test_not_found_returns_error_envelope() -> None:
    request = _RequestStub({CORRELATION_ID_HEADER: "missing-correlation"})

    response = asyncio.run(http_exception_handler(request, StarletteHTTPException(404)))
    body = json.loads(response.body)

    assert response.status_code == 404
    assert response.headers[CORRELATION_ID_HEADER] == "missing-correlation"
    assert body["kind"] == "api-response"
    assert body["ok"] is False
    assert body["meta"]["schemaVersion"] == SCHEMA_VERSION
    assert body["meta"]["correlationId"] == "missing-correlation"
    assert body["error"] == {
        "kind": "error-envelope",
        "schemaVersion": SCHEMA_VERSION,
        "code": "not-found",
        "message": "Not Found",
        "correlationId": "missing-correlation",
        "retryable": False,
        "details": [],
    }


class _RequestStub:
    def __init__(self, headers: dict[str, str]) -> None:
        self.headers = headers
