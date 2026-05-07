import {
  contractSchemaVersion,
  type ApiErrorCode,
  type CorrelationId,
  type ErrorEnvelope,
  type IsoDateTimeString,
  type JobId,
  type MarketCollectorResult,
  type NormalizedProduct,
  type PartialFailure,
  type RetryState,
  type SourcingRequest,
} from "@project/contracts/src/index";
import type {
  CollectorContract,
  CollectorExecutionResult,
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

export type CorePipelineSuccessResult = {
  readonly kind: "core-pipeline-result";
  readonly ok: true;
  readonly state: "completed";
  readonly snapshot: CorePipelineSnapshot;
  readonly collectorResults: readonly MarketCollectorResult[];
  readonly products: readonly NormalizedProduct[];
  readonly events: readonly CorePipelineEvent[];
};

export type CorePipelineFailureResult = {
  readonly kind: "core-pipeline-result";
  readonly ok: false;
  readonly state: "partial_failure" | "failed" | "cancelled";
  readonly snapshot: CorePipelineSnapshot;
  readonly collectorResults: readonly MarketCollectorResult[];
  readonly products: readonly NormalizedProduct[];
  readonly partialFailures: readonly PartialFailure[];
  readonly error?: ErrorEnvelope;
  readonly events: readonly CorePipelineEvent[];
};

export type CorePipelineResult = CorePipelineSuccessResult | CorePipelineFailureResult;

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
      state: "partial_failure",
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
      events,
    };
  }

  return {
    kind: "core-pipeline-result",
    ok: true,
    state: "completed",
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
    events: createProgressEvents(request.jobId, request.correlationId, "completed", completedAt),
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
    state: "cancelled",
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
    state: "failed",
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
