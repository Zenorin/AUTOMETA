export const contractSchemaVersion = "2026-05-07.wbs-12" as const;

export type ContractSchemaVersion = typeof contractSchemaVersion;
export type IsoDateTimeString = string;
export type CorrelationId = string;
export type RequestId = string;
export type JobId = string;
export type SourcingJobId = JobId;
export type ProductId = string;
export type UrlString = string;
export type LocaleCode = string;
export type CurrencyCode = string;

export const marketIds = [
  "naver",
  "coupang",
  "gmarket",
  "auction",
  "elevenst",
  "lotteon",
  "unknown",
] as const;

export type MarketId = (typeof marketIds)[number];

export type SecretOwner = "api" | "collector" | "extension" | "web";
export type LocalSecretStorage = "browser-session" | "developer-env" | "local-keychain" | "process-memory";

export type LocalOnlySecretRef = {
  readonly kind: "local-only-secret-ref";
  readonly refId: string;
  readonly owner: SecretOwner;
  readonly storage: LocalSecretStorage;
  readonly material: "never-serialized";
};

export type LocalOnlySessionBoundaryMarker = {
  readonly kind: "local-only-session-boundary";
  readonly sessionRef: string;
  readonly owner: "collector" | "extension";
  readonly market: MarketId;
  readonly containsAuthCookies: boolean;
  readonly transfer: "same-device-only";
  readonly serialization: "metadata-only";
};

export type LocalOnlyBoundaryMarker = LocalOnlySecretRef | LocalOnlySessionBoundaryMarker;

export type SourcingSeed =
  | {
      readonly kind: "keyword";
      readonly value: string;
    }
  | {
      readonly kind: "product-url";
      readonly url: UrlString;
    }
  | {
      readonly kind: "market-product-id";
      readonly market: MarketId;
      readonly marketProductId: string;
    };

export type SourcingMode = "discover" | "refresh" | "resync";
export type SourcingCollectionMode = "public-page" | "authenticated-user-session";
export type SourcingRateLimitProfile = "interactive" | "conservative";

export type SourcingPolicy = {
  readonly consent: "user-initiated";
  readonly collectionMode: SourcingCollectionMode;
  readonly rateLimitProfile: SourcingRateLimitProfile;
  readonly allowStoredCredentials: false;
  readonly allowCaptchaSolving: false;
};

export type SourcingScope = {
  readonly markets: readonly MarketId[];
  readonly locale: LocaleCode;
  readonly currency: CurrencyCode;
  readonly maxProducts: number;
};

export type SourcingRequest = {
  readonly kind: "sourcing-request";
  readonly schemaVersion: ContractSchemaVersion;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly requestedAt: IsoDateTimeString;
  readonly mode: SourcingMode;
  readonly seed: SourcingSeed;
  readonly scope: SourcingScope;
  readonly policy: SourcingPolicy;
  readonly sessionBoundary?: LocalOnlySessionBoundaryMarker;
  readonly retry?: RetryState;
};

export const sourcingJobStatuses = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export type SourcingJobStatus = (typeof sourcingJobStatuses)[number];

export const sourcingJobSourceTypes = [
  "fixture",
  "manual-keyword",
  "manual-product-url",
  "manual-market-product-id",
] as const;

export type SourcingJobSourceType = (typeof sourcingJobSourceTypes)[number];

export type FixtureProvenance = {
  readonly kind: "fixture-provenance";
  readonly fixtureId: string;
  readonly revision: string;
  readonly source: "synthetic" | "sanitized";
  readonly containsSecrets: false;
  readonly containsSessionMaterial: false;
};

export type FixtureSafeSourcingPolicy = Omit<SourcingPolicy, "collectionMode"> & {
  readonly collectionMode: "public-page";
  readonly fixtureOnly: true;
  readonly allowExternalNetwork: false;
  readonly allowMarketplaceAutomation: false;
};

export type SourcingJobRequest = {
  readonly kind: "sourcing-job-request";
  readonly schemaVersion: ContractSchemaVersion;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly requestedAt: IsoDateTimeString;
  readonly sourceType: SourcingJobSourceType;
  readonly seed: SourcingSeed;
  readonly scope: SourcingScope;
  readonly policy: FixtureSafeSourcingPolicy;
  readonly fixture?: FixtureProvenance;
};

export type Money = {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
};

export type ProductAvailability =
  | "in-stock"
  | "limited"
  | "out-of-stock"
  | "preorder"
  | "unknown";

export type ProductSource = {
  readonly market: MarketId;
  readonly marketProductId: string;
  readonly collectedAt: IsoDateTimeString;
  readonly canonicalUrl: UrlString;
};

export type ProductImage = {
  readonly url: UrlString;
  readonly role: "primary" | "gallery" | "thumbnail";
  readonly altText?: string;
};

export type ProductAttribute = {
  readonly name: string;
  readonly value: string;
  readonly unit?: string;
  readonly source: "market-page" | "seller-page" | "derived";
};

export type SellerSummary = {
  readonly sellerId?: string;
  readonly name?: string;
  readonly rating?: number;
};

export type FulfillmentSummary = {
  readonly shippingFee?: Money;
  readonly shippingOrigin?: string;
  readonly deliveryEstimate?: string;
};

export type ProductOffer = {
  readonly price: Money;
  readonly listPrice?: Money;
  readonly availability: ProductAvailability;
  readonly seller?: SellerSummary;
  readonly fulfillment?: FulfillmentSummary;
};

export type NormalizedProduct = {
  readonly kind: "normalized-product";
  readonly schemaVersion: ContractSchemaVersion;
  readonly productId: ProductId;
  readonly source: ProductSource;
  readonly title: string;
  readonly brand?: string;
  readonly categoryPath: readonly string[];
  readonly offer: ProductOffer;
  readonly images: readonly ProductImage[];
  readonly attributes: readonly ProductAttribute[];
};

export type NormalizedMarketItem = NormalizedProduct;

export type FixtureCollectorInput = {
  readonly kind: "fixture-collector-input";
  readonly schemaVersion: ContractSchemaVersion;
  readonly jobId: SourcingJobId;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly sourceType: "fixture";
  readonly fixture: FixtureProvenance;
  readonly seed: SourcingSeed;
  readonly scope: SourcingScope;
  readonly requestedAt: IsoDateTimeString;
};

export const collectorFailureReasons = [
  "access-denied",
  "captcha-required",
  "consent-required",
  "network-timeout",
  "parse-mismatch",
  "rate-limited",
  "session-expired",
  "unsupported-market",
  "validation-failed",
  "unknown",
] as const;

export type CollectorFailureReason = (typeof collectorFailureReasons)[number];
export type FailureSeverity = "warning" | "recoverable" | "fatal";

export type FailureLocation =
  | {
      readonly kind: "market";
      readonly market: MarketId;
    }
  | {
      readonly kind: "product";
      readonly market: MarketId;
      readonly marketProductId: string;
    }
  | {
      readonly kind: "pipeline-stage";
      readonly stage: PipelineStage;
    };

export type PartialFailure = {
  readonly kind: "partial-failure";
  readonly reason: CollectorFailureReason;
  readonly severity: FailureSeverity;
  readonly message: string;
  readonly occurredAt: IsoDateTimeString;
  readonly location: FailureLocation;
  readonly retry: RetryState;
};

export type CollectorRunStats = {
  readonly requestedCount: number;
  readonly collectedCount: number;
  readonly skippedCount: number;
  readonly failedCount: number;
};

export type MarketCollectorResult =
  | {
      readonly kind: "collector-result";
      readonly status: "success";
      readonly schemaVersion: ContractSchemaVersion;
      readonly jobId: JobId;
      readonly market: MarketId;
      readonly products: readonly NormalizedProduct[];
      readonly stats: CollectorRunStats;
      readonly completedAt: IsoDateTimeString;
    }
  | {
      readonly kind: "collector-result";
      readonly status: "partial";
      readonly schemaVersion: ContractSchemaVersion;
      readonly jobId: JobId;
      readonly market: MarketId;
      readonly products: readonly NormalizedProduct[];
      readonly failures: readonly PartialFailure[];
      readonly stats: CollectorRunStats;
      readonly completedAt: IsoDateTimeString;
    }
  | {
      readonly kind: "collector-result";
      readonly status: "failed";
      readonly schemaVersion: ContractSchemaVersion;
      readonly jobId: JobId;
      readonly market: MarketId;
      readonly failures: readonly PartialFailure[];
      readonly stats: CollectorRunStats;
      readonly completedAt: IsoDateTimeString;
    };

export type FixtureCollectorResult = {
  readonly kind: "fixture-collector-result";
  readonly schemaVersion: ContractSchemaVersion;
  readonly jobId: SourcingJobId;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly sourceType: "fixture";
  readonly fixture: FixtureProvenance;
  readonly result: MarketCollectorResult;
  readonly completedAt: IsoDateTimeString;
};

export type PipelineStage =
  | "queued"
  | "sourcing"
  | "collecting"
  | "normalizing"
  | "persisting"
  | "completed"
  | "cancelled"
  | "failed";

export type PipelineLogLevel = "debug" | "info" | "warn" | "error";

export type PipelineEventBase = {
  readonly schemaVersion: ContractSchemaVersion;
  readonly eventId: string;
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly emittedAt: IsoDateTimeString;
};

export type PipelineProgressEvent = PipelineEventBase & {
  readonly kind: "pipeline-progress";
  readonly stage: PipelineStage;
  readonly completedUnits: number;
  readonly totalUnits: number;
  readonly message?: string;
};

export type PipelineLogEvent = PipelineEventBase & {
  readonly kind: "pipeline-log";
  readonly level: PipelineLogLevel;
  readonly stage: PipelineStage;
  readonly message: string;
};

export type PipelineFailureEvent = PipelineEventBase & {
  readonly kind: "pipeline-failure";
  readonly stage: PipelineStage;
  readonly failure: PartialFailure;
};

export type PipelineEvent = PipelineProgressEvent | PipelineLogEvent | PipelineFailureEvent;

export type CancelState =
  | {
      readonly kind: "cancel-state";
      readonly status: "not-requested";
    }
  | {
      readonly kind: "cancel-state";
      readonly status: "requested";
      readonly requestedAt: IsoDateTimeString;
      readonly requestedBy: "web" | "api" | "extension";
    }
  | {
      readonly kind: "cancel-state";
      readonly status: "accepted";
      readonly acceptedAt: IsoDateTimeString;
    }
  | {
      readonly kind: "cancel-state";
      readonly status: "cancelled";
      readonly cancelledAt: IsoDateTimeString;
      readonly reason: "user-requested" | "superseded" | "shutdown";
    };

export type RetryState =
  | {
      readonly kind: "retry-state";
      readonly status: "not-retryable";
      readonly reason: "policy" | "fatal-error" | "completed" | "cancelled";
    }
  | {
      readonly kind: "retry-state";
      readonly status: "retryable";
      readonly maxAttempts: number;
      readonly attempt: number;
    }
  | {
      readonly kind: "retry-state";
      readonly status: "scheduled";
      readonly attempt: number;
      readonly runAfter: IsoDateTimeString;
    }
  | {
      readonly kind: "retry-state";
      readonly status: "exhausted";
      readonly attempts: number;
      readonly lastFailureReason: CollectorFailureReason;
    };

export type JobLifecycleState =
  | "queued"
  | "running"
  | "partially-completed"
  | "completed"
  | "failed"
  | "cancelled";

export type JobState = {
  readonly kind: "job-state";
  readonly schemaVersion: ContractSchemaVersion;
  readonly jobId: JobId;
  readonly lifecycle: JobLifecycleState;
  readonly stage: PipelineStage;
  readonly cancel: CancelState;
  readonly retry: RetryState;
  readonly updatedAt: IsoDateTimeString;
};

export type SourcingJobProgress = {
  readonly kind: "sourcing-job-progress";
  readonly stage: PipelineStage;
  readonly completedUnits: number;
  readonly totalUnits: number;
  readonly updatedAt: IsoDateTimeString;
};

export const sourcingJobErrorReasons = [
  "unsupported-source",
  "fixture-not-found",
  "validation-failed",
  "cancelled",
  "collector-failed",
  "pipeline-failed",
  "unknown",
] as const;

export type SourcingJobErrorReason = (typeof sourcingJobErrorReasons)[number];

export type SourcingJobError = {
  readonly kind: "sourcing-job-error";
  readonly reason: SourcingJobErrorReason;
  readonly message: string;
  readonly retryable: boolean;
  readonly occurredAt: IsoDateTimeString;
  readonly failure?: PartialFailure;
};

export type SourcingJobResultSummary = {
  readonly kind: "sourcing-job-result-summary";
  readonly jobId: SourcingJobId;
  readonly status: SourcingJobStatus;
  readonly markets: readonly MarketId[];
  readonly itemCount: number;
  readonly failureCount: number;
  readonly collectorStatuses: readonly MarketCollectorResult["status"][];
  readonly completedAt?: IsoDateTimeString;
};

export type SourcingJobCreatedResponse = {
  readonly kind: "sourcing-job-created-response";
  readonly schemaVersion: ContractSchemaVersion;
  readonly jobId: SourcingJobId;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly status: "queued";
  readonly createdAt: IsoDateTimeString;
};

export type SourcingJobStatusResponse = {
  readonly kind: "sourcing-job-status-response";
  readonly schemaVersion: ContractSchemaVersion;
  readonly jobId: SourcingJobId;
  readonly requestId: RequestId;
  readonly correlationId: CorrelationId;
  readonly status: SourcingJobStatus;
  readonly progress: SourcingJobProgress;
  readonly cancel: CancelState;
  readonly retry: RetryState;
  readonly resultSummary?: SourcingJobResultSummary;
  readonly errors: readonly SourcingJobError[];
  readonly updatedAt: IsoDateTimeString;
};

export const apiErrorCodes = [
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
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export type ErrorDetail =
  | {
      readonly kind: "field";
      readonly field: string;
      readonly issue: "missing" | "invalid" | "unsupported";
    }
  | {
      readonly kind: "collector";
      readonly market: MarketId;
      readonly reason: CollectorFailureReason;
    }
  | {
      readonly kind: "job";
      readonly jobId: JobId;
      readonly lifecycle: JobLifecycleState;
    }
  | {
      readonly kind: "boundary";
      readonly boundary: LocalOnlyBoundaryMarker;
      readonly issue: "secret-material-rejected" | "session-transfer-rejected";
    };

export type ErrorEnvelope = {
  readonly kind: "error-envelope";
  readonly schemaVersion: ContractSchemaVersion;
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly correlationId: CorrelationId;
  readonly retryable: boolean;
  readonly details: readonly ErrorDetail[];
};

export type ApiResponseMeta = {
  readonly schemaVersion: ContractSchemaVersion;
  readonly correlationId: CorrelationId;
  readonly emittedAt: IsoDateTimeString;
};

export type ApiResponseEnvelope<TData> =
  | {
      readonly kind: "api-response";
      readonly ok: true;
      readonly data: TData;
      readonly meta: ApiResponseMeta;
    }
  | {
      readonly kind: "api-response";
      readonly ok: false;
      readonly error: ErrorEnvelope;
      readonly meta: ApiResponseMeta;
    };

export type SourcingJobCreateApiResponse = ApiResponseEnvelope<SourcingJobCreatedResponse>;
export type SourcingJobStatusApiResponse = ApiResponseEnvelope<SourcingJobStatusResponse>;

export type ExtensionMessageSource = "web" | "api" | "extension-background" | "extension-content";

export type ExtensionCommandMessage =
  | {
      readonly type: "autometa.sourcing.start";
      readonly payload: SourcingRequest;
    }
  | {
      readonly type: "autometa.job.cancel";
      readonly payload: {
        readonly jobId: JobId;
        readonly reason: "user-requested" | "superseded";
      };
    }
  | {
      readonly type: "autometa.job.retry";
      readonly payload: {
        readonly jobId: JobId;
        readonly retry: RetryState;
      };
    }
  | {
      readonly type: "autometa.job.status.get";
      readonly payload: {
        readonly jobId: JobId;
      };
    }
  | {
      readonly type: "autometa.session.boundary.mark";
      readonly payload: LocalOnlySessionBoundaryMarker;
    };

export type ExtensionEventMessage =
  | {
      readonly type: "autometa.job.state";
      readonly payload: JobState;
    }
  | {
      readonly type: "autometa.pipeline.event";
      readonly payload: PipelineEvent;
    }
  | {
      readonly type: "autometa.collector.result";
      readonly payload: MarketCollectorResult;
    }
  | {
      readonly type: "autometa.error";
      readonly payload: ErrorEnvelope;
    };

export type ExtensionMessage = ExtensionCommandMessage | ExtensionEventMessage;

export type ExtensionMessageEnvelope<TMessage extends ExtensionMessage = ExtensionMessage> = {
  readonly kind: "extension-message-envelope";
  readonly schemaVersion: ContractSchemaVersion;
  readonly messageId: string;
  readonly correlationId: CorrelationId;
  readonly source: ExtensionMessageSource;
  readonly target: ExtensionMessageSource;
  readonly sentAt: IsoDateTimeString;
  readonly message: TMessage;
};
