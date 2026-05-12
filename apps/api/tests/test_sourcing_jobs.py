import json
from pathlib import Path
from typing import Any

import pytest
from fastapi import Response
from fastapi.responses import JSONResponse

from app.main import (
    CORRELATION_ID_HEADER,
    FIXTURE_JOB_ID,
    FIXTURE_REQUESTED_AT,
    LocalSourcingJobStore,
    SCHEMA_VERSION,
    _JOB_STORE,
    _load_persisted_store,
    app,
    create_sourcing_job,
    get_sourcing_job,
    get_sourcing_job_result,
    health,
    update_job_status,
)


def test_health_route_still_works() -> None:
    request = _RequestStub({CORRELATION_ID_HEADER: "health-correlation"})
    response = Response()

    body = health(request, response)

    assert body["ok"] is True
    assert body["data"]["status"] == "ok"
    assert body["meta"]["schemaVersion"] == SCHEMA_VERSION


def test_create_fixture_only_job() -> None:
    request = _RequestStub({CORRELATION_ID_HEADER: "create-correlation"})
    response = Response()

    body = create_sourcing_job(_fixture_request(), request, response)

    assert not isinstance(body, JSONResponse)
    assert response.status_code == 201
    assert response.headers[CORRELATION_ID_HEADER] == "create-correlation"
    assert body["kind"] == "api-response"
    assert body["ok"] is True
    assert body["data"] == {
        "kind": "sourcing-job-created-response",
        "schemaVersion": SCHEMA_VERSION,
        "jobId": FIXTURE_JOB_ID,
        "requestId": "req-api-fixture",
        "correlationId": "create-correlation",
        "status": "queued",
        "createdAt": "2026-05-07T00:00:00.000Z",
    }
    assert any(route.path == "/api/v1/sourcing/jobs" for route in app.routes)


def test_get_job_status() -> None:
    _create_job()
    request = _RequestStub({CORRELATION_ID_HEADER: "status-correlation"})
    response = Response()

    body = get_sourcing_job(FIXTURE_JOB_ID, request, response)

    assert not isinstance(body, JSONResponse)
    assert body["ok"] is True
    assert body["data"]["kind"] == "sourcing-job-status-response"
    assert body["data"]["schemaVersion"] == SCHEMA_VERSION
    assert body["data"]["jobId"] == FIXTURE_JOB_ID
    assert body["data"]["status"] == "completed"
    assert body["data"]["progress"] == {
        "kind": "sourcing-job-progress",
        "stage": "completed",
        "completedUnits": 8,
        "totalUnits": 8,
        "updatedAt": "2026-05-07T00:00:05.000Z",
    }
    assert body["data"]["resultSummary"]["collectorStatuses"] == ["success", "partial", "failed"]
    assert body["data"]["resultSummary"]["itemCount"] == 2
    assert body["data"]["resultSummary"]["failureCount"] == 2
    assert len(body["data"]["errors"]) == 2


def test_get_job_result_returns_deterministic_core_output() -> None:
    _create_job()
    request = _RequestStub({CORRELATION_ID_HEADER: "result-correlation"})
    response = Response()

    first = get_sourcing_job_result(FIXTURE_JOB_ID, request, response)
    second = get_sourcing_job_result(FIXTURE_JOB_ID, request, Response())

    assert first == second
    assert not isinstance(first, JSONResponse)
    result = first["data"]
    assert result["kind"] == "core-pipeline-result"
    assert result["status"] == "partial_failure"
    assert result["summary"]["markets"] == ["naver", "coupang", "unknown"]
    assert result["summary"]["itemCount"] == 2
    assert result["summary"]["failureCount"] == 2
    assert result["snapshot"]["stage"] == "summarize"
    assert result["snapshot"]["retry"]["status"] == "scheduled"
    assert [event["stage"] for event in result["events"] if event["kind"] == "core-pipeline-progress"] == [
        "collect",
        "normalize",
        "filter",
        "dedupe",
        "enrich",
        "image_search_ready",
        "save_ready",
        "summarize",
    ]
    assert "raw" not in result


def test_invalid_job_id_returns_typed_error_envelope() -> None:
    request = _RequestStub({CORRELATION_ID_HEADER: "missing-correlation"})

    response = get_sourcing_job("missing-job", request, Response())

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 404
    assert body["kind"] == "api-response"
    assert body["ok"] is False
    assert body["error"]["kind"] == "error-envelope"
    assert body["error"]["schemaVersion"] == SCHEMA_VERSION
    assert body["error"]["code"] == "not-found"
    assert body["error"]["details"] == [{"kind": "field", "field": "job_id", "issue": "invalid"}]


def test_unsupported_live_or_external_source_is_rejected() -> None:
    request = _RequestStub({CORRELATION_ID_HEADER: "unsupported-correlation"})

    response = create_sourcing_job(
        {
            **_fixture_request(),
            "sourceType": "manual-product-url",
            "policy": {
                "allowExternalNetwork": True,
                "allowMarketplaceAutomation": True,
                "allowStoredCredentials": False,
            },
        },
        request,
        Response(),
    )

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 422
    assert body["ok"] is False
    assert body["error"]["code"] == "validation-failed"
    assert body["error"]["details"] == [{"kind": "field", "field": "sourceType", "issue": "unsupported"}]


def test_no_secret_session_cookie_or_token_fields_are_exposed() -> None:
    _create_job()
    status_body = get_sourcing_job(FIXTURE_JOB_ID, _RequestStub({CORRELATION_ID_HEADER: "safe"}), Response())
    result_body = get_sourcing_job_result(FIXTURE_JOB_ID, _RequestStub({CORRELATION_ID_HEADER: "safe"}), Response())

    serialized = json.dumps([status_body, result_body])

    for forbidden in ["accessToken", "refreshToken", "password", "cookie", "sessionRef", "sessionMaterial", "token"]:
        assert forbidden not in serialized

    blocked = create_sourcing_job(
        {**_fixture_request(), "sessionBoundary": {"sessionRef": "local-only"}},
        _RequestStub({CORRELATION_ID_HEADER: "blocked"}),
        Response(),
    )
    assert isinstance(blocked, JSONResponse)
    assert json.loads(blocked.body)["error"]["details"] == [{"kind": "field", "field": "body", "issue": "unsupported"}]


def test_persisted_job_survives_reload(isolated_store: Path) -> None:
    _create_job()

    assert FIXTURE_JOB_ID in _JOB_STORE
    assert _JOB_STORE[FIXTURE_JOB_ID]["job"]["status"] == "completed"

    assert isolated_store.exists()
    with isolated_store.open(encoding="utf-8") as f:
        document = json.load(f)

    assert document["kind"] == "local-sourcing-job-store"
    assert document["schemaVersion"] == SCHEMA_VERSION
    assert document["storeVersion"] == "2026-05-12.wbs-21"
    assert document["storage"] == "local-only-safe"
    assert document["jobs"][FIXTURE_JOB_ID] == {
        "job_id": FIXTURE_JOB_ID,
        "status": "completed",
        "source_type": "fixture",
        "fixture_id": "deterministic-collector-fixtures",
        "created_at": FIXTURE_REQUESTED_AT,
        "updated_at": "2026-05-07T00:00:05.000Z",
        "result_summary": {
            "kind": "sourcing-job-result-summary",
            "jobId": FIXTURE_JOB_ID,
            "status": "completed",
            "markets": ["naver", "coupang", "unknown"],
            "itemCount": 2,
            "failureCount": 2,
            "collectorStatuses": ["success", "partial", "failed"],
            "completedAt": "2026-05-07T00:00:05.000Z",
        },
        "error_code": "collector-failed",
        "error_message": "Synthetic retry-after fixture; no network request was made.",
    }

    _JOB_STORE.clear()
    assert FIXTURE_JOB_ID not in _JOB_STORE

    _load_persisted_store()
    assert FIXTURE_JOB_ID in _JOB_STORE
    assert _JOB_STORE[FIXTURE_JOB_ID]["job"]["status"] == "completed"


def test_get_job_after_reload() -> None:
    _create_job()

    _JOB_STORE.clear()
    _load_persisted_store()

    request = _RequestStub({CORRELATION_ID_HEADER: "reload-correlation"})
    response = Response()

    body = get_sourcing_job(FIXTURE_JOB_ID, request, response)

    assert not isinstance(body, JSONResponse)
    assert body["ok"] is True
    assert body["data"]["jobId"] == FIXTURE_JOB_ID
    assert body["data"]["status"] == "completed"


def test_get_job_result_after_reload() -> None:
    _create_job()

    _JOB_STORE.clear()
    _load_persisted_store()

    request = _RequestStub({CORRELATION_ID_HEADER: "result-reload-correlation"})
    response = Response()

    result_body = get_sourcing_job_result(FIXTURE_JOB_ID, request, response)

    assert not isinstance(result_body, JSONResponse)
    assert result_body["ok"] is True
    result = result_body["data"]
    assert result["kind"] == "core-pipeline-result"
    assert result["status"] == "partial_failure"
    assert result["summary"]["itemCount"] == 2
    assert result["summary"]["failureCount"] == 2


def test_update_job_status_persists_to_local_store(isolated_store: Path) -> None:
    _create_job()

    updated = update_job_status(
        FIXTURE_JOB_ID,
        "failed",
        error_code="validation-failed",
        error_message="Synthetic local store status update.",
    )

    assert updated is not None
    assert updated["job"]["status"] == "failed"
    assert updated["job"]["resultSummary"]["status"] == "failed"

    _JOB_STORE.clear()
    _load_persisted_store()
    assert _JOB_STORE[FIXTURE_JOB_ID]["job"]["status"] == "failed"

    with isolated_store.open(encoding="utf-8") as f:
        document = json.load(f)
    persisted = document["jobs"][FIXTURE_JOB_ID]
    assert persisted["status"] == "failed"
    assert persisted["error_code"] == "validation-failed"
    assert persisted["error_message"] == "Synthetic local store status update."


def test_persisted_store_does_not_contain_secrets(isolated_store: Path) -> None:
    _create_job()

    assert isolated_store.exists()
    with isolated_store.open(encoding="utf-8") as f:
        serialized = f.read()

    forbidden_keys = [
        "accessToken",
        "authorization",
        "browserStorage",
        "credential",
        "secret",
        "refreshToken",
        "password",
        "cookie",
        "cookies",
        "session",
        "sessionBoundary",
        "sessionMaterial",
        "sessionRef",
        "token",
        "localStorage",
    ]

    for key in forbidden_keys:
        assert key not in serialized, f"Persisted store should not contain key: {key}"


def test_local_store_rejects_secret_like_persisted_fields(isolated_store: Path) -> None:
    store = LocalSourcingJobStore(isolated_store)
    _create_job()
    poisoned = dict(_JOB_STORE)
    poisoned[FIXTURE_JOB_ID]["job"]["authorization"] = "Bearer not-allowed"

    with pytest.raises(ValueError, match="Forbidden persisted field"):
        store.save_jobs(poisoned)


def test_local_store_uses_only_test_configured_path(isolated_store: Path) -> None:
    store = LocalSourcingJobStore(isolated_store)
    _create_job()

    assert store.path == isolated_store
    assert isolated_store.exists()
    assert ".runtime" not in str(isolated_store)


def test_store_rejects_cookie_field_in_request() -> None:
    """Test that store rejects requests with cookie fields."""
    request = _RequestStub({CORRELATION_ID_HEADER: "cookie-test"})

    response = create_sourcing_job(
        {**_fixture_request(), "cookie": "session-id=abc123"},
        request,
        Response(),
    )

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 422
    assert body["error"]["code"] == "validation-failed"
    assert body["error"]["details"] == [{"kind": "field", "field": "body", "issue": "unsupported"}]


def test_store_rejects_session_field_in_request() -> None:
    """Test that store rejects requests with session fields."""
    request = _RequestStub({CORRELATION_ID_HEADER: "session-test"})

    response = create_sourcing_job(
        {**_fixture_request(), "session": {"id": "sess-123"}},
        request,
        Response(),
    )

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 422
    assert body["error"]["code"] == "validation-failed"


def test_store_rejects_token_field_in_request() -> None:
    """Test that store rejects requests with token fields."""
    request = _RequestStub({CORRELATION_ID_HEADER: "token-test"})

    response = create_sourcing_job(
        {**_fixture_request(), "token": "bearer-token-123"},
        request,
        Response(),
    )

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 422
    assert body["error"]["code"] == "validation-failed"


def test_store_rejects_password_field_in_request() -> None:
    """Test that store rejects requests with password fields."""
    request = _RequestStub({CORRELATION_ID_HEADER: "password-test"})

    response = create_sourcing_job(
        {**_fixture_request(), "password": "secret123"},
        request,
        Response(),
    )

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 422
    assert body["error"]["code"] == "validation-failed"


def test_store_rejects_access_token_field_in_request() -> None:
    """Test that store rejects requests with accessToken fields."""
    request = _RequestStub({CORRELATION_ID_HEADER: "accesstoken-test"})

    response = create_sourcing_job(
        {**_fixture_request(), "accessToken": "token-abc123"},
        request,
        Response(),
    )

    assert isinstance(response, JSONResponse)
    body = json.loads(response.body)
    assert response.status_code == 422
    assert body["error"]["code"] == "validation-failed"


def _create_job() -> None:
    create_sourcing_job(_fixture_request(), _RequestStub({CORRELATION_ID_HEADER: "create-correlation"}), Response())


def _fixture_request() -> dict[str, Any]:
    return {
        "kind": "sourcing-job-request",
        "schemaVersion": SCHEMA_VERSION,
        "requestId": "req-api-fixture",
        "correlationId": "create-correlation",
        "requestedAt": "2026-05-07T00:00:00.000Z",
        "sourceType": "fixture",
        "seed": {
            "kind": "keyword",
            "value": "synthetic desk lamp",
        },
        "scope": {
            "markets": ["naver", "coupang", "unknown"],
            "locale": "ko-KR",
            "currency": "KRW",
            "maxProducts": 3,
        },
        "policy": {
            "consent": "user-initiated",
            "collectionMode": "public-page",
            "rateLimitProfile": "conservative",
            "allowStoredCredentials": False,
            "allowCaptchaSolving": False,
            "fixtureOnly": True,
            "allowExternalNetwork": False,
            "allowMarketplaceAutomation": False,
        },
        "fixture": {
            "kind": "fixture-provenance",
            "fixtureId": "deterministic-collector-fixtures",
            "revision": "wbs-13.2026-05-07",
            "source": "synthetic",
            "containsSecrets": False,
            "containsSessionMaterial": False,
        },
    }


class _RequestStub:
    def __init__(self, headers: dict[str, str]) -> None:
        self.headers = headers
