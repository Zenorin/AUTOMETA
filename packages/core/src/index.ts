import {
  collectorFailureReasons,
  contractSchemaVersion,
  type ApiErrorCode,
  type CorrelationId,
  type ErrorEnvelope,
  type FixtureCollectorInput,
  type FixtureCollectorResult,
  type FixtureProvenance,
  type IsoDateTimeString,
  type JobId,
  type MarketId,
  type MarketCollectorResult,
  type NormalizedProduct,
  type PartialFailure,
  type RequestId,
  type RetryState,
  type SourcingRequest,
  type SourcingJobResultSummary,
} from "@project/contracts/src/index";
import type {
  CollectorContract,
  CollectorExecutionResult,
  RawCollectorSnapshot,
  SupportedCollectorMarket,
} from "@project/collectors/src/index";

export const packageReady = true;

export const corePipelineStages = [
  "collect",
  "normalize",
  "filter",
  "dedupe",
  "enrich",
  "image_search_ready",
  "save_ready",
  "summarize",
] as const;

export type CorePipelineStage = (typeof corePipelineStages)[number];

export const corePipelineStates = [
  "pending",
  "running",
  "completed",
  "partial_failure",
  "failed",
  "cancelled",
] as const;

export type CorePipelineState = (typeof corePipelineStates)[number];

export type CorePipelineStatus = "completed" | "partial_failure" | "failed" | "cancelled";

export type CoreCancelReadiness =
  | {
      readonly kind: "core-cancel-readiness";
      readonly status: "not-requested";
      readonly cancellableStages: readonly CorePipelineStage[];
    }
  | {
      readonly kind: "core-cancel-readiness";
      readonly status: "requested";
      readonly requestedAt: IsoDateTimeString;
      readonly reason: "user-requested" | "superseded" | "shutdown";
    };

export type CoreRetryReadiness =
  | {
      readonly kind: "core-retry-readiness";
      readonly status: "not-retryable";
      readonly reason: "policy" | "completed" | "cancelled" | "invalid-input";
    }
  | {
      readonly kind: "core-retry-readiness";
      readonly status: "retryable";
      readonly retry: RetryState;
      readonly retryStages: readonly CorePipelineStage[];
    }
  | {
      readonly kind: "core-retry-readiness";
      readonly status: "scheduled";
      readonly retry: Extract<RetryState, { readonly status: "scheduled" }>;
      readonly retryStages: readonly CorePipelineStage[];
    };

export type CorePipelineEventBase = {
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly eventId: string;
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly emittedAt: IsoDateTimeString;
  readonly stage: CorePipelineStage;
};

export type CorePipelineProgressEvent = CorePipelineEventBase & {
  readonly kind: "core-pipeline-progress";
  readonly state: CorePipelineState;
  readonly completedStages: readonly CorePipelineStage[];
  readonly remainingStages: readonly CorePipelineStage[];
  readonly message: string;
};

export type CorePipelineLogEvent = CorePipelineEventBase & {
  readonly kind: "core-pipeline-log";
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
};

export type CorePipelineFailureEvent = CorePipelineEventBase & {
  readonly kind: "core-pipeline-failure";
  readonly failure: PartialFailure;
};

export type CorePipelineEvent =
  | CorePipelineProgressEvent
  | CorePipelineLogEvent
  | CorePipelineFailureEvent;

export type CorePipelineContract = {
  readonly kind: "core-pipeline-contract";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly stages: readonly CorePipelineStage[];
  readonly states: readonly CorePipelineState[];
  readonly inputs: {
    readonly sourcing: "sourcing-request";
    readonly collectors: "collector-contracts";
    readonly collectorResults: "market-collector-results";
  };
  readonly outputs: {
    readonly products: "normalized-products";
    readonly partialFailures: "preserved";
    readonly errors: "typed-error-envelope";
  };
  readonly boundaries: {
    readonly liveCrawling: false;
    readonly browserAutomation: false;
    readonly loginOrCookieHandling: false;
    readonly externalApiCalls: false;
  };
  readonly cancel: CoreCancelReadiness;
  readonly retry: CoreRetryReadiness;
};

export type CorePipelineOrchestrationRequest = {
  readonly kind: "core-pipeline-orchestration-request";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly requestedAt: IsoDateTimeString;
  readonly sourcing: SourcingRequest;
  readonly collectors: readonly CollectorContract[];
  readonly expectedMarkets: readonly SupportedCollectorMarket[];
};

export type CorePipelineSnapshot = {
  readonly kind: "core-pipeline-snapshot";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly state: CorePipelineState;
  readonly stage: CorePipelineStage;
  readonly completedStages: readonly CorePipelineStage[];
  readonly remainingStages: readonly CorePipelineStage[];
  readonly partialFailures: readonly PartialFailure[];
  readonly cancel: CoreCancelReadiness;
  readonly retry: CoreRetryReadiness;
  readonly updatedAt: IsoDateTimeString;
};

export type CorePipelineSummary = Omit<SourcingJobResultSummary, "status"> & {
  readonly status: CorePipelineStatus;
};

export type CorePipelineSuccessResult = {
  readonly kind: "core-pipeline-result";
  readonly ok: true;
  readonly status: "completed";
  readonly state: "completed";
  readonly summary: CorePipelineSummary;
  readonly snapshot: CorePipelineSnapshot;
  readonly collectorResults: readonly MarketCollectorResult[];
  readonly products: readonly NormalizedProduct[];
  readonly events: readonly CorePipelineEvent[];
};

export type CorePipelineFailureResult = {
  readonly kind: "core-pipeline-result";
  readonly ok: false;
  readonly status: Exclude<CorePipelineStatus, "completed">;
  readonly state: "partial_failure" | "failed" | "cancelled";
  readonly summary: CorePipelineSummary;
  readonly snapshot: CorePipelineSnapshot;
  readonly collectorResults: readonly MarketCollectorResult[];
  readonly products: readonly NormalizedProduct[];
  readonly partialFailures: readonly PartialFailure[];
  readonly error?: ErrorEnvelope;
  readonly events: readonly CorePipelineEvent[];
};

export type CorePipelineResult = CorePipelineSuccessResult | CorePipelineFailureResult;

export type CorePipelineInput = {
  readonly kind: "core-pipeline-input";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly jobId: JobId;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly requestedAt: IsoDateTimeString;
  readonly completedAt: IsoDateTimeString;
  readonly sourceType: "fixture";
  readonly fixture: FixtureProvenance;
  readonly collectorInputs: readonly FixtureCollectorInput[];
  readonly rawSnapshots: readonly RawCollectorSnapshot[];
  readonly collectorResults: readonly FixtureCollectorResult[];
};

export type CorePipelineValidationSuccess<TValue> = {
  readonly ok: true;
  readonly value: TValue;
};

export type CorePipelineValidationFailure = {
  readonly ok: false;
  readonly error: ErrorEnvelope;
};

export type CorePipelineValidationResult<TValue> =
  | CorePipelineValidationSuccess<TValue>
  | CorePipelineValidationFailure;

export type CorePipelineExecutionPlan = {
  readonly kind: "core-pipeline-execution-plan";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly request: CorePipelineOrchestrationRequest;
  readonly contract: CorePipelineContract;
  readonly initialSnapshot: CorePipelineSnapshot;
};

export const corePipelineContract: CorePipelineContract = {
  kind: "core-pipeline-contract",
  schemaVersion: contractSchemaVersion,
  stages: corePipelineStages,
  states: corePipelineStates,
  inputs: {
    sourcing: "sourcing-request",
    collectors: "collector-contracts",
    collectorResults: "market-collector-results",
  },
  outputs: {
    products: "normalized-products",
    partialFailures: "preserved",
    errors: "typed-error-envelope",
  },
  boundaries: {
    liveCrawling: false,
    browserAutomation: false,
    loginOrCookieHandling: false,
    externalApiCalls: false,
  },
  cancel: {
    kind: "core-cancel-readiness",
    status: "not-requested",
    cancellableStages: corePipelineStages,
  },
  retry: {
    kind: "core-retry-readiness",
    status: "not-retryable",
    reason: "policy",
  },
};

export function createCorePipelinePlan(
  request: CorePipelineOrchestrationRequest,
): CorePipelineExecutionPlan | ErrorEnvelope {
  if (request.sourcing.kind !== "sourcing-request") {
    return createCoreError("validation-failed", request.correlationId, "Core pipeline requires a sourcing request.");
  }

  if (request.collectors.length === 0 || request.expectedMarkets.length === 0) {
    return createCoreError(
      "validation-failed",
      request.correlationId,
      "Core pipeline requires collector contracts and expected markets.",
    );
  }

  const collectorMarkets = new Set(request.collectors.map((collector) => collector.market));
  const missingMarket = request.expectedMarkets.find((market) => !collectorMarkets.has(market));
  if (missingMarket !== undefined) {
    return createCoreError(
      "validation-failed",
      request.correlationId,
      `Core pipeline is missing a collector contract for ${missingMarket}.`,
    );
  }

  return {
    kind: "core-pipeline-execution-plan",
    schemaVersion: contractSchemaVersion,
    request,
    contract: corePipelineContract,
    initialSnapshot: createCoreSnapshot({
      jobId: request.jobId,
      correlationId: request.correlationId,
      state: "pending",
      stage: "collect",
      completedStages: [],
      partialFailures: [],
      updatedAt: request.requestedAt,
      retry: corePipelineContract.retry,
    }),
  };
}

export function createCoreResultFromCollectorResults(
  request: CorePipelineOrchestrationRequest,
  collectorResults: readonly MarketCollectorResult[],
  completedAt: IsoDateTimeString,
): CorePipelineResult {
  if (collectorResults.length === 0) {
    const error = createCoreError(
      "validation-failed",
      request.correlationId,
      "Core pipeline cannot complete without collector results.",
    );

    return createFailedCoreResult(request, collectorResults, [], [], error, completedAt);
  }

  const products = collectProducts(collectorResults);
  const partialFailures = collectPartialFailures(collectorResults);
  const failedResults = collectorResults.filter((result) => result.status === "failed");

  if (failedResults.length === collectorResults.length) {
    const error = createCoreError(
      "upstream-failed",
      request.correlationId,
      "All collector results failed before core pipeline processing.",
    );

    return createFailedCoreResult(request, collectorResults, products, partialFailures, error, completedAt);
  }

  if (partialFailures.length > 0 || failedResults.length > 0) {
    const events: readonly CorePipelineEvent[] = [
      ...createProgressEvents(request.jobId, request.correlationId, "partial_failure", completedAt),
      ...partialFailures.map((failure, index) =>
        createFailureEvent(request.jobId, request.correlationId, failure, completedAt, index),
      ),
    ];

    return {
      kind: "core-pipeline-result",
      ok: false,
      status: "partial_failure",
      state: "partial_failure",
      summary: createCoreSummary(request.jobId, "partial_failure", collectorResults, products, partialFailures, completedAt),
      snapshot: createCoreSnapshot({
        jobId: request.jobId,
        correlationId: request.correlationId,
        state: "partial_failure",
        stage: "summarize",
        completedStages: corePipelineStages,
        partialFailures,
        updatedAt: completedAt,
        retry: createRetryReadiness(partialFailures),
      }),
      collectorResults,
      products,
      partialFailures,
      events: [
        ...events,
        createLogEvent(
          request.jobId,
          request.correlationId,
          "summarize",
          "warn",
          "Core pipeline completed with preserved fixture collector failures.",
          completedAt,
        ),
      ],
    };
  }

  return {
    kind: "core-pipeline-result",
    ok: true,
    status: "completed",
    state: "completed",
    summary: createCoreSummary(request.jobId, "completed", collectorResults, products, [], completedAt),
    snapshot: createCoreSnapshot({
      jobId: request.jobId,
      correlationId: request.correlationId,
      state: "completed",
      stage: "summarize",
      completedStages: corePipelineStages,
      partialFailures: [],
      updatedAt: completedAt,
      retry: {
        kind: "core-retry-readiness",
        status: "not-retryable",
        reason: "completed",
      },
    }),
    collectorResults,
    products,
    events: [
      ...createProgressEvents(request.jobId, request.correlationId, "completed", completedAt),
      createLogEvent(
        request.jobId,
        request.correlationId,
        "summarize",
        "info",
        "Core pipeline completed fixture-only validation.",
        completedAt,
      ),
    ],
  };
}

export function createCoreResultFromCollectorExecutions(
  request: CorePipelineOrchestrationRequest,
  executions: readonly CollectorExecutionResult[],
  completedAt: IsoDateTimeString,
): CorePipelineResult {
  return createCoreResultFromCollectorResults(
    request,
    executions.map((execution) => execution.normalized),
    completedAt,
  );
}

export function createCancelledCoreResult(
  request: CorePipelineOrchestrationRequest,
  cancelledAt: IsoDateTimeString,
  reason: "user-requested" | "superseded" | "shutdown",
): CorePipelineFailureResult {
  const snapshot = createCoreSnapshot({
    jobId: request.jobId,
    correlationId: request.correlationId,
    state: "cancelled",
    stage: "collect",
    completedStages: [],
    partialFailures: [],
    updatedAt: cancelledAt,
    cancel: {
      kind: "core-cancel-readiness",
      status: "requested",
      requestedAt: cancelledAt,
      reason,
    },
    retry: {
      kind: "core-retry-readiness",
      status: "not-retryable",
      reason: "cancelled",
    },
  });

  return {
    kind: "core-pipeline-result",
    ok: false,
    status: "cancelled",
    state: "cancelled",
    summary: createCoreSummary(request.jobId, "cancelled", [], [], [], cancelledAt),
    snapshot,
    collectorResults: [],
    products: [],
    partialFailures: [],
    error: createCoreError("cancelled", request.correlationId, "Core pipeline cancellation was requested."),
    events: [
      {
        kind: "core-pipeline-log",
        schemaVersion: contractSchemaVersion,
        eventId: `${request.jobId}:cancelled`,
        jobId: request.jobId,
        correlationId: request.correlationId,
        emittedAt: cancelledAt,
        stage: "collect",
        level: "warn",
        message: "Core pipeline marked cancelled; no collector or external work was started by core.",
      },
    ],
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function normalizeFixtureCollectorResult(
  value: unknown,
  correlationId = "unknown-correlation",
): CorePipelineValidationResult<FixtureCollectorResult> {
  if (!isFixtureCollectorResult(value)) {
    return {
      ok: false,
      error: createCoreError(
        "validation-failed",
        correlationId,
        "Fixture collector result does not match the shared fixture collector contract.",
      ),
    };
  }

  return {
    ok: true,
    value,
  };
}

export function validateCorePipelineInput(value: unknown): CorePipelineValidationResult<CorePipelineInput> {
  const correlationId = readCorrelationId(value);

  if (!isRecord(value) || value.kind !== "core-pipeline-input") {
    return {
      ok: false,
      error: createCoreError("validation-failed", correlationId, "Core pipeline input envelope is invalid."),
    };
  }

  if (
    value.schemaVersion !== contractSchemaVersion ||
    value.sourceType !== "fixture" ||
    typeof value.jobId !== "string" ||
    typeof value.requestId !== "string" ||
    typeof value.correlationId !== "string" ||
    typeof value.requestedAt !== "string" ||
    typeof value.completedAt !== "string" ||
    !isFixtureProvenance(value.fixture) ||
    !Array.isArray(value.collectorInputs) ||
    !Array.isArray(value.rawSnapshots) ||
    !Array.isArray(value.collectorResults) ||
    value.collectorInputs.length === 0 ||
    value.collectorResults.length === 0
  ) {
    return {
      ok: false,
      error: createCoreError(
        "validation-failed",
        correlationId,
        "Core pipeline input requires fixture-only collector inputs, raw snapshots, and normalized results.",
      ),
    };
  }

  if (!value.collectorInputs.every(isFixtureCollectorInput)) {
    return {
      ok: false,
      error: createCoreError("validation-failed", correlationId, "Core pipeline input contains invalid fixture input."),
    };
  }

  if (!value.rawSnapshots.every(isRawSnapshotBoundarySafe)) {
    return {
      ok: false,
      error: createCoreError(
        "validation-failed",
        correlationId,
        "Core pipeline input raw snapshots must stay sanitized and credential-free.",
      ),
    };
  }

  const normalizedResults = value.collectorResults.map((result) =>
    normalizeFixtureCollectorResult(result, correlationId),
  );
  const invalidResult = normalizedResults.find((result) => !result.ok);
  if (invalidResult !== undefined && !invalidResult.ok) {
    return invalidResult;
  }

  const inputJobIds = new Set(value.collectorInputs.map((input) => input.jobId));
  const missingInput = value.collectorResults.find((result) => !inputJobIds.has(result.jobId));
  if (missingInput !== undefined) {
    return {
      ok: false,
      error: createCoreError(
        "validation-failed",
        value.correlationId,
        `Core pipeline input is missing fixture collector input for ${missingInput.jobId}.`,
      ),
    };
  }

  return {
    ok: true,
    value: value as CorePipelineInput,
  };
}

export function validateCorePipelineResult(value: unknown): CorePipelineValidationResult<CorePipelineResult> {
  const correlationId = readCorrelationId(value);

  if (!isRecord(value) || value.kind !== "core-pipeline-result") {
    return {
      ok: false,
      error: createCoreError("validation-failed", correlationId, "Core pipeline result envelope is invalid."),
    };
  }

  if (
    typeof value.ok !== "boolean" ||
    !isCorePipelineStatus(value.status) ||
    value.state !== value.status ||
    !isCoreSummary(value.summary) ||
    !isRecord(value.snapshot) ||
    !Array.isArray(value.collectorResults) ||
    !Array.isArray(value.products) ||
    !Array.isArray(value.events)
  ) {
    return {
      ok: false,
      error: createCoreError(
        "validation-failed",
        correlationId,
        "Core pipeline result is missing deterministic status, summary, snapshot, products, or events.",
      ),
    };
  }

  if (!value.collectorResults.every(isMarketCollectorResult)) {
    return {
      ok: false,
      error: createCoreError("validation-failed", correlationId, "Core pipeline result has invalid collector results."),
    };
  }

  const progressStages = new Set(
    value.events
      .filter((event): event is CorePipelineProgressEvent =>
        isRecord(event) && event.kind === "core-pipeline-progress" && typeof event.stage === "string",
      )
      .map((event) => event.stage),
  );
  const hasAllStageProgress = corePipelineStages.every((stage) => progressStages.has(stage));
  const hasLogEvent = value.events.some((event) => isRecord(event) && event.kind === "core-pipeline-log");

  if (!hasAllStageProgress || !hasLogEvent) {
    return {
      ok: false,
      error: createCoreError(
        "validation-failed",
        correlationId,
        "Core pipeline result must include typed progress for every stage and at least one typed log event.",
      ),
    };
  }

  return {
    ok: true,
    value: value as CorePipelineResult,
  };
}

export function runDeterministicSourcingPipeline(input: CorePipelineInput): CorePipelineResult | ErrorEnvelope {
  const validated = validateCorePipelineInput(input);
  if (!validated.ok) {
    return validated.error;
  }

  const firstCollectorInput = validated.value.collectorInputs[0];
  const request: CorePipelineOrchestrationRequest = {
    kind: "core-pipeline-orchestration-request",
    schemaVersion: contractSchemaVersion,
    jobId: validated.value.jobId,
    correlationId: validated.value.correlationId,
    requestedAt: validated.value.requestedAt,
    sourcing: {
      kind: "sourcing-request",
      schemaVersion: contractSchemaVersion,
      requestId: validated.value.requestId,
      correlationId: validated.value.correlationId,
      requestedAt: validated.value.requestedAt,
      mode: "discover",
      seed: firstCollectorInput.seed,
      scope: firstCollectorInput.scope,
      policy: {
        consent: "user-initiated",
        collectionMode: "public-page",
        rateLimitProfile: "conservative",
        allowStoredCredentials: false,
        allowCaptchaSolving: false,
      },
    },
    collectors: [],
    expectedMarkets: collectSupportedMarkets(validated.value.collectorResults),
  };

  return createCoreResultFromCollectorResults(
    request,
    validated.value.collectorResults.map((result) => result.result),
    validated.value.completedAt,
  );
}

function createFailedCoreResult(
  request: CorePipelineOrchestrationRequest,
  collectorResults: readonly MarketCollectorResult[],
  products: readonly NormalizedProduct[],
  partialFailures: readonly PartialFailure[],
  error: ErrorEnvelope,
  completedAt: IsoDateTimeString,
): CorePipelineFailureResult {
  const preservedFailures = partialFailures.length > 0 ? partialFailures : createFailureDetails(error, completedAt);

  return {
    kind: "core-pipeline-result",
    ok: false,
    status: "failed",
    state: "failed",
    summary: createCoreSummary(request.jobId, "failed", collectorResults, products, preservedFailures, completedAt),
    snapshot: createCoreSnapshot({
      jobId: request.jobId,
      correlationId: request.correlationId,
      state: "failed",
      stage: "collect",
      completedStages: [],
      partialFailures: preservedFailures,
      updatedAt: completedAt,
      retry: {
        kind: "core-retry-readiness",
        status: "not-retryable",
        reason: "invalid-input",
      },
    }),
    collectorResults,
    products,
    partialFailures: preservedFailures,
    error,
    events: [
      ...createProgressEvents(request.jobId, request.correlationId, "failed", completedAt),
      {
        kind: "core-pipeline-log",
        schemaVersion: contractSchemaVersion,
        eventId: `${request.jobId}:failed`,
        jobId: request.jobId,
        correlationId: request.correlationId,
        emittedAt: completedAt,
        stage: "collect",
        level: "error",
        message: error.message,
      },
      createLogEvent(
        request.jobId,
        request.correlationId,
        "summarize",
        "error",
        "Core pipeline failed fixture-only validation.",
        completedAt,
      ),
    ],
  };
}

function createCoreSnapshot(input: {
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly state: CorePipelineState;
  readonly stage: CorePipelineStage;
  readonly completedStages: readonly CorePipelineStage[];
  readonly partialFailures: readonly PartialFailure[];
  readonly updatedAt: IsoDateTimeString;
  readonly cancel?: CoreCancelReadiness;
  readonly retry: CoreRetryReadiness;
}): CorePipelineSnapshot {
  return {
    kind: "core-pipeline-snapshot",
    schemaVersion: contractSchemaVersion,
    jobId: input.jobId,
    correlationId: input.correlationId,
    state: input.state,
    stage: input.stage,
    completedStages: input.completedStages,
    remainingStages: corePipelineStages.filter((stage) => !input.completedStages.includes(stage)),
    partialFailures: input.partialFailures,
    cancel: input.cancel ?? corePipelineContract.cancel,
    retry: input.retry,
    updatedAt: input.updatedAt,
  };
}

function collectProducts(results: readonly MarketCollectorResult[]): readonly NormalizedProduct[] {
  return results.flatMap((result) => (result.status === "failed" ? [] : result.products));
}

function collectPartialFailures(results: readonly MarketCollectorResult[]): readonly PartialFailure[] {
  return results.flatMap((result) => (result.status === "success" ? [] : result.failures));
}

function createProgressEvents(
  jobId: JobId,
  correlationId: CorrelationId,
  state: CorePipelineState,
  emittedAt: IsoDateTimeString,
): readonly CorePipelineProgressEvent[] {
  return corePipelineStages.map((stage, index) => ({
    kind: "core-pipeline-progress",
    schemaVersion: contractSchemaVersion,
    eventId: `${jobId}:${stage}:progress`,
    jobId,
    correlationId,
    emittedAt,
    stage,
    state,
    completedStages: corePipelineStages.slice(0, index + 1),
    remainingStages: corePipelineStages.slice(index + 1),
    message: `Core pipeline scaffold reached ${stage}.`,
  }));
}

function createFailureEvent(
  jobId: JobId,
  correlationId: CorrelationId,
  failure: PartialFailure,
  emittedAt: IsoDateTimeString,
  index: number,
): CorePipelineFailureEvent {
  return {
    kind: "core-pipeline-failure",
    schemaVersion: contractSchemaVersion,
    eventId: `${jobId}:partial-failure:${index}`,
    jobId,
    correlationId,
    emittedAt,
    stage: "summarize",
    failure,
  };
}

function createRetryReadiness(partialFailures: readonly PartialFailure[]): CoreRetryReadiness {
  const scheduled = partialFailures.find((failure) => failure.retry.status === "scheduled");
  if (scheduled !== undefined && scheduled.retry.status === "scheduled") {
    return {
      kind: "core-retry-readiness",
      status: "scheduled",
      retry: scheduled.retry,
      retryStages: ["collect", "normalize"],
    };
  }

  const retryable = partialFailures.find((failure) => failure.retry.status === "retryable");
  if (retryable === undefined || retryable.retry.status !== "retryable") {
    return {
      kind: "core-retry-readiness",
      status: "not-retryable",
      reason: "policy",
    };
  }

  return {
    kind: "core-retry-readiness",
    status: "retryable",
    retry: retryable.retry,
    retryStages: ["collect", "normalize"],
  };
}

function createCoreSummary(
  jobId: JobId,
  status: CorePipelineStatus,
  collectorResults: readonly MarketCollectorResult[],
  products: readonly NormalizedProduct[],
  partialFailures: readonly PartialFailure[],
  completedAt: IsoDateTimeString,
): CorePipelineSummary {
  return {
    kind: "sourcing-job-result-summary",
    jobId,
    status,
    markets: uniqueMarkets(collectorResults.map((result) => result.market)),
    itemCount: products.length,
    failureCount: partialFailures.length,
    collectorStatuses: collectorResults.map((result) => result.status),
    completedAt,
  };
}

function createLogEvent(
  jobId: JobId,
  correlationId: CorrelationId,
  stage: CorePipelineStage,
  level: CorePipelineLogEvent["level"],
  message: string,
  emittedAt: IsoDateTimeString,
): CorePipelineLogEvent {
  return {
    kind: "core-pipeline-log",
    schemaVersion: contractSchemaVersion,
    eventId: `${jobId}:${stage}:${level}:log`,
    jobId,
    correlationId,
    emittedAt,
    stage,
    level,
    message,
  };
}

function collectSupportedMarkets(results: readonly FixtureCollectorResult[]): readonly SupportedCollectorMarket[] {
  return uniqueMarkets(results.map((result) => result.result.market)).filter(isSupportedCollectorMarket);
}

function uniqueMarkets(markets: readonly MarketId[]): readonly MarketId[] {
  return [...new Set(markets)];
}

function isCorePipelineStatus(value: unknown): value is CorePipelineStatus {
  return value === "completed" || value === "partial_failure" || value === "failed" || value === "cancelled";
}

function isCoreSummary(value: unknown): value is CorePipelineSummary {
  return (
    isRecord(value) &&
    value.kind === "sourcing-job-result-summary" &&
    typeof value.jobId === "string" &&
    isCorePipelineStatus(value.status) &&
    Array.isArray(value.markets) &&
    value.markets.every((market) => typeof market === "string") &&
    typeof value.itemCount === "number" &&
    typeof value.failureCount === "number" &&
    Array.isArray(value.collectorStatuses)
  );
}

function isFixtureCollectorInput(value: unknown): value is FixtureCollectorInput {
  return (
    isRecord(value) &&
    value.kind === "fixture-collector-input" &&
    value.schemaVersion === contractSchemaVersion &&
    typeof value.jobId === "string" &&
    typeof value.requestId === "string" &&
    typeof value.correlationId === "string" &&
    value.sourceType === "fixture" &&
    isFixtureProvenance(value.fixture) &&
    isRecord(value.seed) &&
    isRecord(value.scope) &&
    typeof value.requestedAt === "string"
  );
}

function isFixtureCollectorResult(value: unknown): value is FixtureCollectorResult {
  return (
    isRecord(value) &&
    value.kind === "fixture-collector-result" &&
    value.schemaVersion === contractSchemaVersion &&
    typeof value.jobId === "string" &&
    typeof value.requestId === "string" &&
    typeof value.correlationId === "string" &&
    value.sourceType === "fixture" &&
    isFixtureProvenance(value.fixture) &&
    isMarketCollectorResult(value.result) &&
    typeof value.completedAt === "string" &&
    value.result.jobId === value.jobId
  );
}

function isFixtureProvenance(value: unknown): value is FixtureProvenance {
  return (
    isRecord(value) &&
    value.kind === "fixture-provenance" &&
    typeof value.fixtureId === "string" &&
    typeof value.revision === "string" &&
    (value.source === "synthetic" || value.source === "sanitized") &&
    value.containsSecrets === false &&
    value.containsSessionMaterial === false
  );
}

function isMarketCollectorResult(value: unknown): value is MarketCollectorResult {
  if (
    !isRecord(value) ||
    value.kind !== "collector-result" ||
    value.schemaVersion !== contractSchemaVersion ||
    typeof value.jobId !== "string" ||
    typeof value.market !== "string" ||
    typeof value.completedAt !== "string" ||
    !isRecord(value.stats)
  ) {
    return false;
  }

  if (value.status === "success") {
    return Array.isArray(value.products) && !("failures" in value);
  }

  if (value.status === "partial") {
    return Array.isArray(value.products) && Array.isArray(value.failures) && value.failures.every(isPartialFailure);
  }

  if (value.status === "failed") {
    return !("products" in value) && Array.isArray(value.failures) && value.failures.every(isPartialFailure);
  }

  return false;
}

function isPartialFailure(value: unknown): value is PartialFailure {
  return (
    isRecord(value) &&
    value.kind === "partial-failure" &&
    typeof value.reason === "string" &&
    collectorFailureReasons.includes(value.reason as (typeof collectorFailureReasons)[number]) &&
    (value.severity === "warning" || value.severity === "recoverable" || value.severity === "fatal") &&
    typeof value.message === "string" &&
    typeof value.occurredAt === "string" &&
    isRecord(value.location) &&
    isRecord(value.retry)
  );
}

function isRawSnapshotBoundarySafe(value: unknown): value is RawCollectorSnapshot {
  return (
    isRecord(value) &&
    value.kind === "collector-raw-snapshot" &&
    value.schemaVersion === contractSchemaVersion &&
    typeof value.jobId === "string" &&
    isRecord(value.body) &&
    value.body.serialization === "not-persisted" &&
    value.body.redaction === "html-and-script-content-excluded" &&
    isRecord(value.credentialBoundary) &&
    value.credentialBoundary.cookies === "not-collected" &&
    value.credentialBoundary.credentials === "not-collected" &&
    value.credentialBoundary.sessionMaterial === "metadata-only"
  );
}

function isSupportedCollectorMarket(value: MarketId): value is SupportedCollectorMarket {
  return value !== "unknown";
}

function readCorrelationId(value: unknown): CorrelationId {
  return isRecord(value) && typeof value.correlationId === "string" ? value.correlationId : "unknown-correlation";
}

function createCoreError(
  code: ApiErrorCode,
  correlationId: CorrelationId,
  message: string,
): ErrorEnvelope {
  return {
    kind: "error-envelope",
    schemaVersion: contractSchemaVersion,
    code,
    message,
    correlationId,
    retryable: code === "upstream-failed" || code === "rate-limited",
    details: [],
  };
}

function createFailureDetails(
  error: ErrorEnvelope,
  occurredAt: IsoDateTimeString,
): readonly PartialFailure[] {
  return [
    {
      kind: "partial-failure",
      reason: error.code === "upstream-failed" ? "unknown" : "validation-failed",
      severity: "fatal",
      message: error.message,
      occurredAt,
      location: {
        kind: "pipeline-stage",
        stage: "failed",
      },
      retry: {
        kind: "retry-state",
        status: "not-retryable",
        reason: "fatal-error",
      },
    },
  ];
}
