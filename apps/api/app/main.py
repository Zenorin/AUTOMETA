import copy
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal, TypeAlias, TypedDict
from uuid import uuid4

from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

SCHEMA_VERSION = "2026-05-07.wbs-12"
CORRELATION_ID_HEADER = "X-Correlation-ID"
FIXTURE_JOB_ID = "job-fixture-core-validation"
FIXTURE_REQUEST_ID = "req-fixture-core-validation"
FIXTURE_REQUESTED_AT = "2026-05-07T00:00:00.000Z"
FIXTURE_COMPLETED_AT = "2026-05-07T00:00:05.000Z"

app = FastAPI(title="AUTOMETA API")

ApiErrorCode = Literal[
    "bad-request",
    "unauthorized",
    "forbidden",
    "not-found",
    "conflict",
    "validation-failed",
    "rate-limited",
    "cancelled",
    "upstream-failed",
    "internal",
]

FieldErrorIssue = Literal["missing", "invalid", "unsupported"]


class FieldErrorDetail(TypedDict):
    kind: Literal["field"]
    field: str
    issue: FieldErrorIssue


ErrorDetail: TypeAlias = FieldErrorDetail


class ApiResponseMeta(TypedDict):
    schemaVersion: str
    correlationId: str
    emittedAt: str


class ErrorEnvelope(TypedDict):
    kind: Literal["error-envelope"]
    schemaVersion: str
    code: ApiErrorCode
    message: str
    correlationId: str
    retryable: bool
    details: list[ErrorDetail]


class SuccessResponseEnvelope(TypedDict):
    kind: Literal["api-response"]
    ok: Literal[True]
    data: dict[str, Any]
    meta: ApiResponseMeta


class ErrorResponseEnvelope(TypedDict):
    kind: Literal["api-response"]
    ok: Literal[False]
    error: ErrorEnvelope
    meta: ApiResponseMeta


class JobRecord(TypedDict):
    job: dict[str, Any]
    result: dict[str, Any]


class PersistedJob(TypedDict, total=False):
    job_id: str
    status: str
    source_type: str
    fixture_id: str
    created_at: str
    updated_at: str
    result_summary: dict[str, Any]
    error_code: str | None
    error_message: str | None


class PersistedJobStoreDocument(TypedDict):
    kind: Literal["local-sourcing-job-store"]
    schemaVersion: str
    storeVersion: str
    storage: Literal["local-only-safe"]
    jobs: dict[str, PersistedJob]


STATUS_TO_ERROR_CODE: dict[int, ApiErrorCode] = {
    400: "bad-request",
    401: "unauthorized",
    403: "forbidden",
    404: "not-found",
    409: "conflict",
    422: "validation-failed",
    429: "rate-limited",
}

CORE_PIPELINE_STAGES = [
    "collect",
    "normalize",
    "filter",
    "dedupe",
    "enrich",
    "image_search_ready",
    "save_ready",
    "summarize",
]

FORBIDDEN_FIELD_NAMES = {
    "accessToken",
    "authorization",
    "browserStorage",
    "credential",
    "credentials",
    "password",
    "cookie",
    "cookies",
    "localStorage",
    "marketplaceAccount",
    "marketplaceAccountId",
    "refreshToken",
    "secret",
    "session",
    "sessionBoundary",
    "sessionMaterial",
    "sessionRef",
    "token",
}
FORBIDDEN_NORMALIZED_FIELD_NAMES = {
    "accesstoken",
    "authorization",
    "browserstorage",
    "cookie",
    "cookies",
    "credential",
    "credentials",
    "localstorage",
    "marketplaceaccount",
    "marketplaceaccountid",
    "password",
    "refreshtoken",
    "secret",
    "session",
    "sessionboundary",
    "sessionmaterial",
    "sessionref",
    "token",
}
STORE_VERSION = "2026-05-12.wbs-21"

_JOB_STORE: dict[str, JobRecord] = {}
_FIXTURE_SET_CACHE: dict[str, Any] | None = None


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _correlation_id(request: Request) -> str:
    return request.headers.get(CORRELATION_ID_HEADER) or str(uuid4())


def _meta(correlation_id: str, emitted_at: str | None = None) -> ApiResponseMeta:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "correlationId": correlation_id,
        "emittedAt": emitted_at or _utc_now(),
    }


def _success_response(
    data: dict[str, Any],
    correlation_id: str,
    emitted_at: str | None = None,
) -> SuccessResponseEnvelope:
    return {
        "kind": "api-response",
        "ok": True,
        "data": data,
        "meta": _meta(correlation_id, emitted_at),
    }


def _error_response(
    *,
    status_code: int,
    code: ApiErrorCode,
    message: str,
    correlation_id: str,
    retryable: bool = False,
    details: list[ErrorDetail] | None = None,
    emitted_at: str | None = None,
) -> JSONResponse:
    envelope: ErrorEnvelope = {
        "kind": "error-envelope",
        "schemaVersion": SCHEMA_VERSION,
        "code": code,
        "message": message,
        "correlationId": correlation_id,
        "retryable": retryable,
        "details": details or [],
    }
    body: ErrorResponseEnvelope = {
        "kind": "api-response",
        "ok": False,
        "error": envelope,
        "meta": _meta(correlation_id, emitted_at),
    }
    return JSONResponse(
        status_code=status_code,
        content=body,
        headers={CORRELATION_ID_HEADER: correlation_id},
    )


def _http_error_code(status_code: int) -> ApiErrorCode:
    if status_code >= 500:
        return "internal"
    return STATUS_TO_ERROR_CODE.get(status_code, "bad-request")


def _validation_details(exc: RequestValidationError) -> list[ErrorDetail]:
    details: list[ErrorDetail] = []
    for error in exc.errors():
        location = ".".join(str(part) for part in error.get("loc", ()))
        issue: FieldErrorIssue = "missing" if error.get("type") == "missing" else "invalid"
        details.append({"kind": "field", "field": location, "issue": issue})
    return details


def _fixture_path() -> Path:
    return Path(__file__).resolve().parents[3] / "packages" / "collectors" / "fixtures" / "deterministic-results.json"


def _load_fixture_set() -> dict[str, Any]:
    global _FIXTURE_SET_CACHE
    if _FIXTURE_SET_CACHE is None:
        with _fixture_path().open(encoding="utf-8") as fixture_file:
            _FIXTURE_SET_CACHE = json.load(fixture_file)
    return copy.deepcopy(_FIXTURE_SET_CACHE)


def _has_forbidden_field(value: Any) -> bool:
    if isinstance(value, dict):
        for key, child in value.items():
            if _is_forbidden_field_name(str(key)):
                return True
            if _has_forbidden_field(child):
                return True
    if isinstance(value, list):
        return any(_has_forbidden_field(child) for child in value)
    return False


def _normalized_field_name(key: str) -> str:
    return key.replace("_", "").replace("-", "").lower()


def _is_forbidden_field_name(key: str) -> bool:
    normalized = _normalized_field_name(key)
    return key in FORBIDDEN_FIELD_NAMES or normalized in FORBIDDEN_NORMALIZED_FIELD_NAMES


def _assert_no_forbidden_persisted_data(value: Any) -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if _is_forbidden_field_name(str(key)):
                raise ValueError(f"Forbidden persisted field: {key}")
            _assert_no_forbidden_persisted_data(child)
    elif isinstance(value, list):
        for child in value:
            _assert_no_forbidden_persisted_data(child)


def _validate_fixture_job_request(body: dict[str, Any], correlation_id: str) -> JSONResponse | None:
    if _has_forbidden_field(body):
        return _error_response(
            status_code=422,
            code="validation-failed",
            message="Fixture sourcing jobs must not include secret, session, cookie, or token fields.",
            correlation_id=correlation_id,
            details=[{"kind": "field", "field": "body", "issue": "unsupported"}],
            emitted_at=FIXTURE_REQUESTED_AT,
        )

    source_type = body.get("sourceType", "fixture")
    if source_type != "fixture":
        return _error_response(
            status_code=422,
            code="validation-failed",
            message="Only fixture-backed sourcing jobs are supported in WBS-15.",
            correlation_id=correlation_id,
            details=[{"kind": "field", "field": "sourceType", "issue": "unsupported"}],
            emitted_at=FIXTURE_REQUESTED_AT,
        )

    policy = body.get("policy")
    if isinstance(policy, dict) and (
        policy.get("allowExternalNetwork") is not False
        or policy.get("allowMarketplaceAutomation") is not False
        or policy.get("allowStoredCredentials") is not False
    ):
        return _error_response(
            status_code=422,
            code="validation-failed",
            message="Fixture sourcing policy must keep network, marketplace automation, and stored credentials disabled.",
            correlation_id=correlation_id,
            details=[{"kind": "field", "field": "policy", "issue": "unsupported"}],
            emitted_at=FIXTURE_REQUESTED_AT,
        )

    return None


class LocalSourcingJobStore:
    def __init__(self, path: Path | None = None) -> None:
        self._path = path

    @property
    def path(self) -> Path:
        if self._path is not None:
            return self._path

        env_path = os.environ.get("AUTOMETA_JOB_STORE_PATH")
        if env_path:
            return Path(env_path)

        return Path(__file__).resolve().parents[3] / ".runtime" / "sourcing-jobs.json"

    def load_jobs(self) -> dict[str, JobRecord]:
        document = self._load_document()
        return {
            job_id: _record_from_persisted_job(persisted_job)
            for job_id, persisted_job in document["jobs"].items()
        }

    def save_jobs(self, jobs: dict[str, JobRecord]) -> None:
        _assert_no_forbidden_persisted_data(jobs)
        persisted_jobs = {
            job_id: _persisted_job_from_record(job_id, record)
            for job_id, record in jobs.items()
        }
        document: PersistedJobStoreDocument = {
            "kind": "local-sourcing-job-store",
            "schemaVersion": SCHEMA_VERSION,
            "storeVersion": STORE_VERSION,
            "storage": "local-only-safe",
            "jobs": persisted_jobs,
        }
        _assert_no_forbidden_persisted_data(document)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("w", encoding="utf-8") as store_file:
            json.dump(document, store_file, indent=2, sort_keys=True)
            store_file.write("\n")

    def create_job(self, record: JobRecord) -> JobRecord:
        global _JOB_STORE
        _JOB_STORE[record["job"]["jobId"]] = copy.deepcopy(record)
        self.save_jobs(_JOB_STORE)
        return copy.deepcopy(record)

    def get_job(self, job_id: str) -> JobRecord | None:
        _JOB_STORE.clear()
        _JOB_STORE.update(self.load_jobs())
        record = _JOB_STORE.get(job_id)
        return copy.deepcopy(record) if record is not None else None

    def update_job_status(
        self,
        job_id: str,
        status_value: str,
        *,
        error_code: str | None = None,
        error_message: str | None = None,
    ) -> JobRecord | None:
        global _JOB_STORE
        record = self.get_job(job_id)
        if record is None:
            return None

        record["job"]["status"] = status_value
        record["job"]["updatedAt"] = FIXTURE_COMPLETED_AT
        record["job"]["resultSummary"]["status"] = status_value
        if error_code or error_message:
            record["job"]["errors"] = [
                {
                    "kind": "sourcing-job-error",
                    "reason": error_code or "unknown",
                    "message": error_message or "Local job status update recorded.",
                    "retryable": False,
                    "occurredAt": FIXTURE_COMPLETED_AT,
                }
            ]
        _JOB_STORE[job_id] = copy.deepcopy(record)
        self.save_jobs(_JOB_STORE)
        return copy.deepcopy(record)

    def get_job_result(self, job_id: str) -> dict[str, Any] | None:
        record = self.get_job(job_id)
        return copy.deepcopy(record["result"]) if record is not None else None

    def reset_store_for_tests(self, *, delete_file: bool = True) -> None:
        global _JOB_STORE
        _JOB_STORE.clear()
        if delete_file and self.path.exists():
            self.path.unlink()

    def _load_document(self) -> PersistedJobStoreDocument:
        if not self.path.exists():
            return _empty_store_document()
        try:
            with self.path.open(encoding="utf-8") as store_file:
                document = json.load(store_file)
        except json.JSONDecodeError:
            return _empty_store_document()

        if not isinstance(document, dict) or document.get("kind") != "local-sourcing-job-store":
            return _empty_store_document()
        jobs = document.get("jobs")
        if not isinstance(jobs, dict):
            return _empty_store_document()
        _assert_no_forbidden_persisted_data(document)
        return {
            "kind": "local-sourcing-job-store",
            "schemaVersion": SCHEMA_VERSION,
            "storeVersion": STORE_VERSION,
            "storage": "local-only-safe",
            "jobs": {
                job_id: persisted_job
                for job_id, persisted_job in jobs.items()
                if isinstance(job_id, str) and isinstance(persisted_job, dict)
            },
        }


_LOCAL_JOB_STORE = LocalSourcingJobStore()


def _empty_store_document() -> PersistedJobStoreDocument:
    return {
        "kind": "local-sourcing-job-store",
        "schemaVersion": SCHEMA_VERSION,
        "storeVersion": STORE_VERSION,
        "storage": "local-only-safe",
        "jobs": {},
    }


def _persisted_job_from_record(job_id: str, record: JobRecord) -> PersistedJob:
    job = record["job"]
    errors = job.get("errors", [])
    first_error = errors[0] if errors else {}
    persisted_job: PersistedJob = {
        "job_id": job_id,
        "status": job["status"],
        "source_type": "fixture",
        "fixture_id": "deterministic-collector-fixtures",
        "created_at": FIXTURE_REQUESTED_AT,
        "updated_at": job.get("updatedAt", FIXTURE_COMPLETED_AT),
        "result_summary": copy.deepcopy(job["resultSummary"]),
        "error_code": first_error.get("reason") if isinstance(first_error, dict) else None,
        "error_message": first_error.get("message") if isinstance(first_error, dict) else None,
    }
    _assert_no_forbidden_persisted_data(persisted_job)
    return persisted_job


def _record_from_persisted_job(persisted_job: PersistedJob) -> JobRecord:
    correlation_id = "local-runtime-store"
    request_id = FIXTURE_REQUEST_ID
    result = _build_core_pipeline_result(_load_fixture_set(), correlation_id)
    job = _build_job_status(result, correlation_id, request_id)
    status_value = persisted_job.get("status", "completed")
    job["status"] = status_value
    job["updatedAt"] = persisted_job.get("updated_at", FIXTURE_COMPLETED_AT)
    job["resultSummary"] = copy.deepcopy(persisted_job.get("result_summary", job["resultSummary"]))
    return {"job": job, "result": result}


def load_jobs() -> dict[str, JobRecord]:
    return _LOCAL_JOB_STORE.load_jobs()


def save_jobs(jobs: dict[str, JobRecord]) -> None:
    _LOCAL_JOB_STORE.save_jobs(jobs)


def create_job(record: JobRecord) -> JobRecord:
    return _LOCAL_JOB_STORE.create_job(record)


def get_job(job_id: str) -> JobRecord | None:
    return _LOCAL_JOB_STORE.get_job(job_id)


def update_job_status(
    job_id: str,
    status_value: str,
    *,
    error_code: str | None = None,
    error_message: str | None = None,
) -> JobRecord | None:
    return _LOCAL_JOB_STORE.update_job_status(
        job_id,
        status_value,
        error_code=error_code,
        error_message=error_message,
    )


def get_job_result(job_id: str) -> dict[str, Any] | None:
    return _LOCAL_JOB_STORE.get_job_result(job_id)


def reset_store_for_tests(*, delete_file: bool = True) -> None:
    _LOCAL_JOB_STORE.reset_store_for_tests(delete_file=delete_file)


def _load_persisted_store() -> dict[str, JobRecord]:
    _JOB_STORE.clear()
    _JOB_STORE.update(load_jobs())
    return _JOB_STORE


def _create_fixture_job(correlation_id: str, request_id: str) -> JobRecord:
    fixture_set = _load_fixture_set()
    result = _build_core_pipeline_result(fixture_set, correlation_id)
    job = _build_job_status(result, correlation_id, request_id)
    record: JobRecord = {"job": job, "result": result}
    return create_job(record)


def _build_job_created_response(correlation_id: str, request_id: str) -> dict[str, Any]:
    return {
        "kind": "sourcing-job-created-response",
        "schemaVersion": SCHEMA_VERSION,
        "jobId": FIXTURE_JOB_ID,
        "requestId": request_id,
        "correlationId": correlation_id,
        "status": "queued",
        "createdAt": FIXTURE_REQUESTED_AT,
    }


def _build_job_status(core_result: dict[str, Any], correlation_id: str, request_id: str) -> dict[str, Any]:
    errors = [_sourcing_error_from_failure(failure) for failure in core_result.get("partialFailures", [])]
    summary = dict(core_result["summary"])
    summary["status"] = "completed"
    return {
        "kind": "sourcing-job-status-response",
        "schemaVersion": SCHEMA_VERSION,
        "jobId": FIXTURE_JOB_ID,
        "requestId": request_id,
        "correlationId": correlation_id,
        "status": "completed",
        "progress": {
            "kind": "sourcing-job-progress",
            "stage": "completed",
            "completedUnits": len(CORE_PIPELINE_STAGES),
            "totalUnits": len(CORE_PIPELINE_STAGES),
            "updatedAt": FIXTURE_COMPLETED_AT,
        },
        "cancel": {
            "kind": "cancel-state",
            "status": "not-requested",
        },
        "retry": _job_retry_state(core_result.get("partialFailures", [])),
        "resultSummary": summary,
        "errors": errors,
        "updatedAt": FIXTURE_COMPLETED_AT,
    }


def _build_core_pipeline_result(fixture_set: dict[str, Any], correlation_id: str) -> dict[str, Any]:
    collector_results = [example["normalized"]["result"] for example in fixture_set["examples"]]
    products = [
        product
        for result in collector_results
        if result["status"] != "failed"
        for product in result.get("products", [])
    ]
    partial_failures = [
        failure
        for result in collector_results
        if result["status"] != "success"
        for failure in result.get("failures", [])
    ]
    pipeline_status = "partial_failure" if partial_failures else "completed"
    return {
        "kind": "core-pipeline-result",
        "ok": pipeline_status == "completed",
        "status": pipeline_status,
        "state": pipeline_status,
        "summary": {
            "kind": "sourcing-job-result-summary",
            "jobId": FIXTURE_JOB_ID,
            "status": pipeline_status,
            "markets": _unique([result["market"] for result in collector_results]),
            "itemCount": len(products),
            "failureCount": len(partial_failures),
            "collectorStatuses": [result["status"] for result in collector_results],
            "completedAt": FIXTURE_COMPLETED_AT,
        },
        "snapshot": {
            "kind": "core-pipeline-snapshot",
            "schemaVersion": SCHEMA_VERSION,
            "jobId": FIXTURE_JOB_ID,
            "correlationId": correlation_id,
            "state": pipeline_status,
            "stage": "summarize",
            "completedStages": CORE_PIPELINE_STAGES,
            "remainingStages": [],
            "partialFailures": partial_failures,
            "cancel": {
                "kind": "core-cancel-readiness",
                "status": "not-requested",
                "cancellableStages": CORE_PIPELINE_STAGES,
            },
            "retry": _core_retry_readiness(partial_failures),
            "updatedAt": FIXTURE_COMPLETED_AT,
        },
        "collectorResults": collector_results,
        "products": products,
        "partialFailures": partial_failures,
        "events": _core_events(correlation_id, pipeline_status, partial_failures),
    }


def _core_events(
    correlation_id: str,
    pipeline_status: str,
    partial_failures: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for index, stage_name in enumerate(CORE_PIPELINE_STAGES):
        events.append(
            {
                "kind": "core-pipeline-progress",
                "schemaVersion": SCHEMA_VERSION,
                "eventId": f"{FIXTURE_JOB_ID}:{stage_name}:progress",
                "jobId": FIXTURE_JOB_ID,
                "correlationId": correlation_id,
                "emittedAt": FIXTURE_COMPLETED_AT,
                "stage": stage_name,
                "state": pipeline_status,
                "completedStages": CORE_PIPELINE_STAGES[: index + 1],
                "remainingStages": CORE_PIPELINE_STAGES[index + 1 :],
                "message": f"Core pipeline scaffold reached {stage_name}.",
            }
        )
    for index, failure in enumerate(partial_failures):
        events.append(
            {
                "kind": "core-pipeline-failure",
                "schemaVersion": SCHEMA_VERSION,
                "eventId": f"{FIXTURE_JOB_ID}:partial-failure:{index}",
                "jobId": FIXTURE_JOB_ID,
                "correlationId": correlation_id,
                "emittedAt": FIXTURE_COMPLETED_AT,
                "stage": "summarize",
                "failure": failure,
            }
        )
    events.append(
        {
            "kind": "core-pipeline-log",
            "schemaVersion": SCHEMA_VERSION,
            "eventId": f"{FIXTURE_JOB_ID}:summarize:warn:log",
            "jobId": FIXTURE_JOB_ID,
            "correlationId": correlation_id,
            "emittedAt": FIXTURE_COMPLETED_AT,
            "stage": "summarize",
            "level": "warn" if partial_failures else "info",
            "message": "Core pipeline completed fixture-only validation.",
        }
    )
    return events


def _core_retry_readiness(partial_failures: list[dict[str, Any]]) -> dict[str, Any]:
    scheduled = _first_retry(partial_failures, "scheduled")
    if scheduled is not None:
        return {
            "kind": "core-retry-readiness",
            "status": "scheduled",
            "retry": scheduled,
            "retryStages": ["collect", "normalize"],
        }
    return {
        "kind": "core-retry-readiness",
        "status": "not-retryable",
        "reason": "completed" if not partial_failures else "policy",
    }


def _job_retry_state(partial_failures: list[dict[str, Any]]) -> dict[str, Any]:
    scheduled = _first_retry(partial_failures, "scheduled")
    if scheduled is not None:
        return scheduled
    return {
        "kind": "retry-state",
        "status": "not-retryable",
        "reason": "completed",
    }


def _first_retry(partial_failures: list[dict[str, Any]], status_value: str) -> dict[str, Any] | None:
    for failure in partial_failures:
        retry = failure.get("retry")
        if isinstance(retry, dict) and retry.get("status") == status_value:
            return retry
    return None


def _sourcing_error_from_failure(failure: dict[str, Any]) -> dict[str, Any]:
    return {
        "kind": "sourcing-job-error",
        "reason": "collector-failed",
        "message": failure["message"],
        "retryable": failure.get("retry", {}).get("status") in {"retryable", "scheduled"},
        "occurredAt": failure["occurredAt"],
        "failure": failure,
    }


def _unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    unique_values: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            unique_values.append(value)
    return unique_values


def _job_not_found(job_id: str, correlation_id: str) -> JSONResponse:
    return _error_response(
        status_code=404,
        code="not-found",
        message=f"Sourcing job {job_id} was not found.",
        correlation_id=correlation_id,
        details=[{"kind": "field", "field": "job_id", "issue": "invalid"}],
        emitted_at=FIXTURE_COMPLETED_AT,
    )


@app.get("/health")
def health(request: Request, response: Response) -> SuccessResponseEnvelope:
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


@app.post("/api/v1/sourcing/jobs", status_code=status.HTTP_201_CREATED, response_model=None)
def create_sourcing_job(
    body: dict[str, Any],
    request: Request,
    response: Response,
) -> SuccessResponseEnvelope | JSONResponse:
    correlation_id = _correlation_id(request)
    validation_error = _validate_fixture_job_request(body, correlation_id)
    if validation_error is not None:
        return validation_error

    request_id = body.get("requestId") if isinstance(body.get("requestId"), str) else FIXTURE_REQUEST_ID
    _create_fixture_job(correlation_id, request_id)
    response.headers[CORRELATION_ID_HEADER] = correlation_id
    response.status_code = status.HTTP_201_CREATED
    return _success_response(_build_job_created_response(correlation_id, request_id), correlation_id, FIXTURE_REQUESTED_AT)


@app.get("/api/v1/sourcing/jobs/{job_id}", response_model=None)
def get_sourcing_job(
    job_id: str,
    request: Request,
    response: Response,
) -> SuccessResponseEnvelope | JSONResponse:
    correlation_id = _correlation_id(request)
    record = get_job(job_id)
    if record is None:
        return _job_not_found(job_id, correlation_id)

    response.headers[CORRELATION_ID_HEADER] = correlation_id
    return _success_response(copy.deepcopy(record["job"]), correlation_id, FIXTURE_COMPLETED_AT)


@app.get("/api/v1/sourcing/jobs/{job_id}/result", response_model=None)
def get_sourcing_job_result(
    job_id: str,
    request: Request,
    response: Response,
) -> SuccessResponseEnvelope | JSONResponse:
    correlation_id = _correlation_id(request)
    record = get_job(job_id)
    if record is None:
        return _job_not_found(job_id, correlation_id)

    result = copy.deepcopy(record["result"])
    result["snapshot"]["correlationId"] = correlation_id
    for event in result["events"]:
        event["correlationId"] = correlation_id
    response.headers[CORRELATION_ID_HEADER] = correlation_id
    return _success_response(result, correlation_id, FIXTURE_COMPLETED_AT)


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
