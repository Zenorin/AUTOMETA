type ContractSchemaVersion = "2026-05-07.wbs-12";
type CorrelationId = string;
type RequestId = string;
type JobId = string;
type PipelineStage = "queued" | "running" | "completed" | "failed" | "cancelled";
type JobLifecycleState = "queued" | "running" | "completed" | "failed" | "cancelled";
type ApiErrorCode = "bad-request" | "forbidden" | "conflict" | "validation-failed";

type ErrorEnvelope = {
  readonly kind: "error-envelope";
  readonly schemaVersion: ContractSchemaVersion;
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly correlationId: CorrelationId;
  readonly retryable: boolean;
  readonly details: readonly [];
};

type JobState = {
  readonly kind: "job-state";
  readonly schemaVersion: ContractSchemaVersion;
  readonly jobId: JobId;
  readonly lifecycle: JobLifecycleState;
  readonly stage: PipelineStage;
  readonly cancel:
    | {
        readonly kind: "cancel-state";
        readonly status: "not-requested";
      }
    | {
        readonly kind: "cancel-state";
        readonly status: "cancelled";
        readonly cancelledAt: string;
        readonly reason: "user-requested";
      };
  readonly retry: {
    readonly kind: "retry-state";
    readonly status: "not-retryable";
    readonly reason: "policy" | "cancelled";
  };
  readonly updatedAt: string;
};

type PipelineProgressEvent = {
  readonly kind: "pipeline-progress";
  readonly schemaVersion: ContractSchemaVersion;
  readonly eventId: string;
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly emittedAt: string;
  readonly stage: PipelineStage;
  readonly completedUnits: number;
  readonly totalUnits: number;
  readonly message: string;
};

export const SOURCING_JOB_READY_CHECK = "autometa.sourcing.job.ready.check" as const;
export const SOURCING_JOB_FIXTURE_REQUEST = "autometa.sourcing.job.fixture.request" as const;
export const SOURCING_JOB_STATUS_QUERY = "autometa.sourcing.job.status.query" as const;
export const SOURCING_JOB_CANCEL_REQUEST = "autometa.sourcing.job.cancel.request" as const;
export const SOURCING_JOB_RETRY_REQUEST = "autometa.sourcing.job.retry.request" as const;

const contractSchemaVersion: ContractSchemaVersion = "2026-05-07.wbs-12";
const scaffoldTimestamp = "2026-05-07T00:00:00.000Z";
const fixtureCompletedAt = "2026-05-07T00:00:05.000Z";
const fixtureJobId = "job-fixture-core-validation";
const extensionSource: "extension-background" = "extension-background";
export const fixtureTrustedSenderId = "autometa-extension-fixture-boundary";

type RuntimeSender = {
  readonly id?: string;
  readonly url?: string;
};

type RuntimeSendResponse = (response: BoundaryResponse) => void;

type RuntimeOnMessage = {
  readonly addListener: (
    listener: (message: unknown, sender: RuntimeSender, sendResponse: RuntimeSendResponse) => boolean | void,
  ) => void;
};

type ChromeRuntimeApi = {
  readonly runtime: {
    readonly id?: string;
    readonly onMessage: RuntimeOnMessage;
  };
};

declare const chrome: ChromeRuntimeApi | undefined;

type StatusCommand = {
  readonly type: "autometa.job.status.get";
  readonly payload: {
    readonly jobId: JobId;
  };
};

type CancelCommand = {
  readonly type: "autometa.job.cancel";
  readonly payload: {
    readonly jobId: JobId;
    readonly reason: "user-requested" | "superseded";
  };
};

type ProgressCommand = {
  readonly type: "autometa.pipeline.progress.get";
  readonly payload: {
    readonly jobId: JobId;
  };
};

export type ExtensionSourcingJobReadinessRequest = {
  readonly type: typeof SOURCING_JOB_READY_CHECK;
  readonly payload: {
    readonly sourceType: "fixture";
  };
};

type ExtensionSourcingJobFixtureRequest = {
  readonly type: typeof SOURCING_JOB_FIXTURE_REQUEST;
  readonly payload: {
    readonly sourceType: "fixture";
    readonly jobId?: JobId;
  };
};

type ExtensionSourcingJobStatusQuery = {
  readonly type: typeof SOURCING_JOB_STATUS_QUERY;
  readonly payload: {
    readonly jobId: JobId;
    readonly status?: JobLifecycleState;
  };
};

type ExtensionSourcingJobCancelRequest = {
  readonly type: typeof SOURCING_JOB_CANCEL_REQUEST;
  readonly payload: {
    readonly jobId: JobId;
    readonly status: JobLifecycleState;
  };
};

type ExtensionSourcingJobRetryRequest = {
  readonly type: typeof SOURCING_JOB_RETRY_REQUEST;
  readonly payload: {
    readonly jobId: JobId;
    readonly status: JobLifecycleState;
  };
};

type AllowedScaffoldCommand =
  | StatusCommand
  | ProgressCommand
  | CancelCommand
  | ExtensionSourcingJobReadinessRequest
  | ExtensionSourcingJobFixtureRequest
  | ExtensionSourcingJobStatusQuery
  | ExtensionSourcingJobCancelRequest
  | ExtensionSourcingJobRetryRequest;

type BoundaryRequest = {
  readonly kind: "autometa.extension.request";
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly source: "web" | "extension-content";
  readonly sentAt: string;
  readonly message: AllowedScaffoldCommand;
};

type StatusReadiness = {
  readonly kind: "extension-status-readiness";
  readonly message: StatusCommand;
  readonly state: JobState;
  readonly note: "status-boundary-ready-no-live-collection";
};

type ProgressReadiness = {
  readonly kind: "extension-progress-readiness";
  readonly message: ProgressCommand;
  readonly progress: PipelineProgressEvent;
  readonly note: "progress-boundary-ready-no-live-collection";
};

type CancelReadiness = {
  readonly kind: "extension-cancel-readiness";
  readonly message: CancelCommand;
  readonly state: JobState;
  readonly note: "cancel-boundary-ready-no-live-side-effects";
};

export type ExtensionSourcingJobReadinessResponse = {
  readonly kind: "extension-sourcing-job-readiness";
  readonly allowed: true;
  readonly ready: true;
  readonly sourceType: "fixture";
  readonly jobId: JobId;
  readonly status: "completed";
  readonly apiBoundary: {
    readonly createRoute: "POST /api/v1/sourcing/jobs";
    readonly statusRoute: "GET /api/v1/sourcing/jobs/{job_id}";
    readonly cancelRoute: "POST /api/v1/sourcing/jobs/{job_id}/cancel";
    readonly retryRoute: "POST /api/v1/sourcing/jobs/{job_id}/retry";
    readonly resultRoute: "GET /api/v1/sourcing/jobs/{job_id}/result";
  };
  readonly resultSummary: {
    readonly kind: "sourcing-job-result-summary";
    readonly jobId: JobId;
    readonly status: "completed";
    readonly markets: readonly ["naver", "coupang", "unknown"];
    readonly itemCount: 2;
    readonly failureCount: 2;
    readonly collectorStatuses: readonly ["success", "partial", "failed"];
    readonly completedAt: typeof fixtureCompletedAt;
  };
  readonly note: "fixture-only-ready-no-live-access";
};

export type ExtensionUnsupportedLiveSourceResponse = {
  readonly kind: "extension-unsupported-live-source";
  readonly allowed: false;
  readonly ready: false;
  readonly reason: "unsupported-live-source";
  readonly message: "Only fixture-only sourcing job readiness is supported.";
};

type FixtureStatusReadiness = {
  readonly kind: "extension-sourcing-job-status";
  readonly jobId: JobId;
  readonly status: JobLifecycleState;
  readonly progress: {
    readonly completedUnits: 0 | 1 | 8;
    readonly totalUnits: 8;
    readonly updatedAt: typeof fixtureCompletedAt;
  };
  readonly apiBoundary: LocalApiBoundary;
  readonly cancellable: boolean;
  readonly retryable: boolean;
  readonly note: "fixture-status-ready-no-live-access";
};

type LocalApiBoundary = {
  readonly createRoute: "POST /api/v1/sourcing/jobs";
  readonly statusRoute: "GET /api/v1/sourcing/jobs/{job_id}";
  readonly cancelRoute: "POST /api/v1/sourcing/jobs/{job_id}/cancel";
  readonly retryRoute: "POST /api/v1/sourcing/jobs/{job_id}/retry";
  readonly resultRoute: "GET /api/v1/sourcing/jobs/{job_id}/result";
};

type ExtensionLocalApiLifecycleReadinessResponse = {
  readonly kind: "extension-local-api-lifecycle-readiness";
  readonly action: "cancel" | "retry";
  readonly allowed: true;
  readonly ready: true;
  readonly jobId: JobId;
  readonly status: JobLifecycleState;
  readonly apiBoundary: LocalApiBoundary;
  readonly transition:
    | "queued-to-cancelled"
    | "running-to-cancelled"
    | "failed-to-queued"
    | "cancelled-to-queued";
  readonly note: "local-api-boundary-ready-no-browser-data";
};

type BoundaryData =
  | StatusReadiness
  | ProgressReadiness
  | CancelReadiness
  | ExtensionSourcingJobReadinessResponse
  | FixtureStatusReadiness
  | ExtensionLocalApiLifecycleReadinessResponse;

type BoundaryResponse =
  | {
      readonly kind: "autometa.extension.response";
      readonly ok: true;
      readonly requestId: RequestId;
      readonly correlationId: CorrelationId;
      readonly source: typeof extensionSource;
      readonly data: BoundaryData;
    }
  | {
      readonly kind: "autometa.extension.response";
      readonly ok: false;
      readonly requestId: RequestId;
      readonly correlationId: CorrelationId;
      readonly source: typeof extensionSource;
      readonly error: ErrorEnvelope;
    };

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(record: Readonly<Record<string, unknown>>, key: string): string | undefined {
  const value = record[key];
  return isNonEmptyString(value) ? value : undefined;
}

function isLifecycleStatus(value: unknown): value is JobLifecycleState {
  return value === "queued" || value === "running" || value === "completed" || value === "failed" || value === "cancelled";
}

function isCancellableStatus(value: JobLifecycleState): boolean {
  return value === "queued" || value === "running";
}

function isRetryableStatus(value: JobLifecycleState): boolean {
  return value === "failed" || value === "cancelled";
}

function normalizedFieldName(key: string): string {
  return key.replace(/[-_]/g, "").toLowerCase();
}

function hasPrivateBrowserMaterialField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasPrivateBrowserMaterialField);
  }

  if (!isRecord(value)) {
    return false;
  }

  for (const [key, child] of Object.entries(value)) {
    const normalized = normalizedFieldName(key);
    if (
      normalized === "cookie" ||
      normalized === "cookies" ||
      normalized === "session" ||
      normalized === "sessionref" ||
      normalized === "sessionmaterial" ||
      normalized === "token" ||
      normalized === "accesstoken" ||
      normalized === "refreshtoken" ||
      normalized === "credential" ||
      normalized === "credentials" ||
      normalized === "password" ||
      normalized === "authorization" ||
      normalized === "localstorage" ||
      normalized === "browserstorage"
    ) {
      return true;
    }

    if (hasPrivateBrowserMaterialField(child)) {
      return true;
    }
  }

  return false;
}

function errorEnvelope(
  code: ApiErrorCode,
  message: string,
  correlationId: CorrelationId,
  retryable = false,
): ErrorEnvelope {
  return {
    kind: "error-envelope",
    schemaVersion: contractSchemaVersion,
    code,
    message,
    correlationId,
    retryable,
    details: [],
  };
}

function errorResponse(
  requestId: RequestId,
  correlationId: CorrelationId,
  code: ApiErrorCode,
  message: string,
): BoundaryResponse {
  return {
    kind: "autometa.extension.response",
    ok: false,
    requestId,
    correlationId,
    source: extensionSource,
    error: errorEnvelope(code, message, correlationId),
  };
}

function isAllowedSource(value: unknown): value is BoundaryRequest["source"] {
  return value === "web" || value === "extension-content";
}

function parseJobIdPayload(value: unknown): { readonly jobId: JobId } | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const jobId = getString(value, "jobId");
  return jobId === undefined ? undefined : { jobId };
}

function parseLifecyclePayload(
  value: unknown,
  options: { readonly requireStatus: boolean },
): { readonly jobId: JobId; readonly status?: JobLifecycleState } | undefined {
  const parsed = parseJobIdPayload(value);
  if (parsed === undefined || !isRecord(value)) {
    return undefined;
  }

  const status = value.status;
  if (status === undefined) {
    return options.requireStatus ? undefined : parsed;
  }

  return isLifecycleStatus(status) ? { ...parsed, status } : undefined;
}

function parseFixtureSourcePayload(value: unknown): { readonly sourceType: "fixture"; readonly jobId?: JobId } | undefined {
  if (!isRecord(value) || value.sourceType !== "fixture") {
    return undefined;
  }

  const jobId = getString(value, "jobId");
  return jobId === undefined ? { sourceType: "fixture" } : { sourceType: "fixture", jobId };
}

function hasUnsupportedLiveSourcePayload(value: unknown): boolean {
  return isRecord(value) && typeof value.sourceType === "string" && value.sourceType !== "fixture";
}

function parseCancelPayload(value: unknown): CancelCommand["payload"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const jobId = getString(value, "jobId");
  const reason = value.reason;
  if (jobId === undefined || (reason !== "user-requested" && reason !== "superseded")) {
    return undefined;
  }

  return { jobId, reason };
}

function parseAllowedCommand(value: unknown): AllowedScaffoldCommand | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const type = value.type;
  if (type === "autometa.job.status.get") {
    const payload = parseJobIdPayload(value.payload);
    return payload === undefined ? undefined : { type, payload };
  }

  if (type === "autometa.pipeline.progress.get") {
    const payload = parseJobIdPayload(value.payload);
    return payload === undefined ? undefined : { type, payload };
  }

  if (type === "autometa.job.cancel") {
    const payload = parseCancelPayload(value.payload);
    return payload === undefined ? undefined : { type, payload };
  }

  if (type === SOURCING_JOB_READY_CHECK) {
    const payload = parseFixtureSourcePayload(value.payload);
    return payload === undefined ? undefined : { type, payload: { sourceType: "fixture" } };
  }

  if (type === SOURCING_JOB_FIXTURE_REQUEST) {
    const payload = parseFixtureSourcePayload(value.payload);
    return payload === undefined ? undefined : { type, payload };
  }

  if (type === SOURCING_JOB_STATUS_QUERY) {
    const payload = parseLifecyclePayload(value.payload, { requireStatus: false });
    return payload === undefined ? undefined : { type, payload };
  }

  if (type === SOURCING_JOB_CANCEL_REQUEST) {
    const payload = parseLifecyclePayload(value.payload, { requireStatus: true });
    return payload === undefined ? undefined : { type, payload: payload as ExtensionSourcingJobCancelRequest["payload"] };
  }

  if (type === SOURCING_JOB_RETRY_REQUEST) {
    const payload = parseLifecyclePayload(value.payload, { requireStatus: true });
    return payload === undefined ? undefined : { type, payload: payload as ExtensionSourcingJobRetryRequest["payload"] };
  }

  return undefined;
}

function parseBoundaryRequest(message: unknown): BoundaryRequest | BoundaryResponse {
  if (!isRecord(message)) {
    return errorResponse("unknown-request", "unknown-correlation", "bad-request", "Message must be an object.");
  }

  const requestId: RequestId = getString(message, "requestId") ?? "unknown-request";
  const correlationId = getString(message, "correlationId") ?? "unknown-correlation";

  if (message.kind !== "autometa.extension.request") {
    return errorResponse(requestId, correlationId, "bad-request", "Unsupported extension message envelope.");
  }

  if (requestId === "unknown-request" || correlationId === "unknown-correlation") {
    return errorResponse(
      requestId,
      correlationId,
      "validation-failed",
      "Extension messages require requestId and correlationId.",
    );
  }

  if (!isAllowedSource(message.source)) {
    return errorResponse(requestId, correlationId, "forbidden", "Unsupported extension message source.");
  }

  const sentAt = getString(message, "sentAt");
  const rawCommand = isRecord(message.message) ? message.message : undefined;
  if (rawCommand !== undefined && hasPrivateBrowserMaterialField(rawCommand.payload)) {
    return errorResponse(
      requestId,
      correlationId,
      "validation-failed",
      "Private browser material is not accepted by the extension boundary.",
    );
  }

  if (
    rawCommand !== undefined &&
    (rawCommand.type === SOURCING_JOB_READY_CHECK || rawCommand.type === SOURCING_JOB_FIXTURE_REQUEST) &&
    hasUnsupportedLiveSourcePayload(rawCommand.payload)
  ) {
    return {
      kind: "autometa.extension.response",
      ok: false,
      requestId,
      correlationId,
      source: extensionSource,
      error: errorEnvelope(
        "validation-failed",
        "Only fixture-only sourcing job readiness is supported.",
        correlationId,
      ),
    };
  }

  const command = parseAllowedCommand(message.message);
  if (sentAt === undefined || command === undefined) {
    return errorResponse(requestId, correlationId, "validation-failed", "Unsupported or invalid scaffold command.");
  }

  return {
    kind: "autometa.extension.request",
    requestId,
    correlationId,
    source: message.source,
    sentAt,
    message: command,
  };
}

function scaffoldJobState(jobId: JobId, lifecycle: JobState["lifecycle"]): JobState {
  return {
    kind: "job-state",
    schemaVersion: contractSchemaVersion,
    jobId,
    lifecycle,
    stage: lifecycle,
    cancel:
      lifecycle === "cancelled"
        ? {
            kind: "cancel-state",
            status: "cancelled",
            cancelledAt: scaffoldTimestamp,
            reason: "user-requested",
          }
        : {
            kind: "cancel-state",
            status: "not-requested",
          },
    retry: {
      kind: "retry-state",
      status: "not-retryable",
      reason: lifecycle === "cancelled" ? "cancelled" : "policy",
    },
    updatedAt: lifecycle === "completed" ? fixtureCompletedAt : scaffoldTimestamp,
  };
}

function scaffoldProgress(jobId: JobId, correlationId: CorrelationId): PipelineProgressEvent {
  return {
    kind: "pipeline-progress",
    schemaVersion: contractSchemaVersion,
    eventId: `progress-${jobId}`,
    jobId,
    correlationId,
    emittedAt: scaffoldTimestamp,
    stage: "queued",
    completedUnits: 0,
    totalUnits: 0,
    message: "Progress boundary is ready; live collection is not implemented in WBS-07.",
  };
}

function localApiBoundary(): LocalApiBoundary {
  return {
    createRoute: "POST /api/v1/sourcing/jobs",
    statusRoute: "GET /api/v1/sourcing/jobs/{job_id}",
    cancelRoute: "POST /api/v1/sourcing/jobs/{job_id}/cancel",
    retryRoute: "POST /api/v1/sourcing/jobs/{job_id}/retry",
    resultRoute: "GET /api/v1/sourcing/jobs/{job_id}/result",
  };
}

function fixtureReadiness(jobId: JobId): ExtensionSourcingJobReadinessResponse {
  return {
    kind: "extension-sourcing-job-readiness",
    allowed: true,
    ready: true,
    sourceType: "fixture",
    jobId,
    status: "completed",
    apiBoundary: localApiBoundary(),
    resultSummary: {
      kind: "sourcing-job-result-summary",
      jobId,
      status: "completed",
      markets: ["naver", "coupang", "unknown"],
      itemCount: 2,
      failureCount: 2,
      collectorStatuses: ["success", "partial", "failed"],
      completedAt: fixtureCompletedAt,
    },
    note: "fixture-only-ready-no-live-access",
  };
}

function progressUnits(status: JobLifecycleState): 0 | 1 | 8 {
  if (status === "queued") {
    return 0;
  }

  return status === "running" ? 1 : 8;
}

function fixtureStatus(jobId: JobId, status: JobLifecycleState = "completed"): FixtureStatusReadiness {
  return {
    kind: "extension-sourcing-job-status",
    jobId,
    status,
    progress: {
      completedUnits: progressUnits(status),
      totalUnits: 8,
      updatedAt: fixtureCompletedAt,
    },
    apiBoundary: localApiBoundary(),
    cancellable: isCancellableStatus(status),
    retryable: isRetryableStatus(status),
    note: "fixture-status-ready-no-live-access",
  };
}

function lifecycleReadiness(
  action: ExtensionLocalApiLifecycleReadinessResponse["action"],
  jobId: JobId,
  fromStatus: JobLifecycleState,
): ExtensionLocalApiLifecycleReadinessResponse {
  const status = action === "cancel" ? "cancelled" : "queued";
  const transition =
    action === "cancel"
      ? fromStatus === "running"
        ? "running-to-cancelled"
        : "queued-to-cancelled"
      : fromStatus === "cancelled"
        ? "cancelled-to-queued"
        : "failed-to-queued";

  return {
    kind: "extension-local-api-lifecycle-readiness",
    action,
    allowed: true,
    ready: true,
    jobId,
    status,
    apiBoundary: localApiBoundary(),
    transition,
    note: "local-api-boundary-ready-no-browser-data",
  };
}

function handleAllowedRequest(request: BoundaryRequest): BoundaryResponse {
  const base = {
    kind: "autometa.extension.response" as const,
    ok: true as const,
    requestId: request.requestId,
    correlationId: request.correlationId,
    source: extensionSource,
  };

  if (request.message.type === "autometa.job.status.get") {
    return {
      ...base,
      data: {
        kind: "extension-status-readiness",
        message: request.message,
        state: scaffoldJobState(request.message.payload.jobId, "queued"),
        note: "status-boundary-ready-no-live-collection",
      },
    };
  }

  if (request.message.type === SOURCING_JOB_READY_CHECK) {
    return {
      ...base,
      data: fixtureReadiness(fixtureJobId),
    };
  }

  if (request.message.type === SOURCING_JOB_FIXTURE_REQUEST) {
    return {
      ...base,
      data: fixtureReadiness(request.message.payload.jobId ?? fixtureJobId),
    };
  }

  if (request.message.type === SOURCING_JOB_STATUS_QUERY) {
    return {
      ...base,
      data: fixtureStatus(request.message.payload.jobId, request.message.payload.status),
    };
  }

  if (request.message.type === SOURCING_JOB_CANCEL_REQUEST) {
    if (!isCancellableStatus(request.message.payload.status)) {
      return errorResponse(
        request.requestId,
        request.correlationId,
        "conflict",
        "Requested local API lifecycle transition is not allowed.",
      );
    }

    return {
      ...base,
      data: lifecycleReadiness("cancel", request.message.payload.jobId, request.message.payload.status),
    };
  }

  if (request.message.type === SOURCING_JOB_RETRY_REQUEST) {
    if (!isRetryableStatus(request.message.payload.status)) {
      return errorResponse(
        request.requestId,
        request.correlationId,
        "conflict",
        "Requested local API lifecycle transition is not allowed.",
      );
    }

    return {
      ...base,
      data: lifecycleReadiness("retry", request.message.payload.jobId, request.message.payload.status),
    };
  }

  if (request.message.type === "autometa.pipeline.progress.get") {
    return {
      ...base,
      data: {
        kind: "extension-progress-readiness",
        message: request.message,
        progress: scaffoldProgress(request.message.payload.jobId, request.correlationId),
        note: "progress-boundary-ready-no-live-collection",
      },
    };
  }

  return {
    ...base,
    data: {
      kind: "extension-cancel-readiness",
      message: request.message,
      state: scaffoldJobState(request.message.payload.jobId, "cancelled"),
      note: "cancel-boundary-ready-no-live-side-effects",
    },
  };
}

function isTrustedInternalSender(sender: RuntimeSender): boolean {
  if (typeof chrome === "undefined") {
    return sender.id === fixtureTrustedSenderId;
  }

  return chrome.runtime.id !== undefined && sender.id === chrome.runtime.id;
}

function isBoundaryResponse(value: BoundaryRequest | BoundaryResponse): value is BoundaryResponse {
  return value.kind === "autometa.extension.response";
}

export function handleExtensionBoundaryMessage(message: unknown, sender: RuntimeSender): BoundaryResponse {
  const parsed = parseBoundaryRequest(message);
  const requestId = parsed.requestId;
  const correlationId = parsed.correlationId;

  if (!isTrustedInternalSender(sender)) {
    return errorResponse(requestId, correlationId, "forbidden", "External extension messages are not trusted.");
  }

  if (isBoundaryResponse(parsed)) {
    return parsed;
  }

  return handleAllowedRequest(parsed);
}

if (typeof chrome !== "undefined") {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    sendResponse(handleExtensionBoundaryMessage(message, sender));
    return false;
  });
}
