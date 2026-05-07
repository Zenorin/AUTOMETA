import {
  contractSchemaVersion,
  type CollectorFailureReason,
  type CorrelationId,
  type IsoDateTimeString,
  type JobId,
  type LocalOnlySessionBoundaryMarker,
  type MarketCollectorResult,
  type MarketId,
  type NormalizedProduct,
  type PartialFailure,
  type RetryState,
  type SourcingPolicy,
  type SourcingSeed,
  type SourcingScope,
  type UrlString,
} from "@project/contracts/src/index";

export const packageReady = true;

export const supportedCollectorMarkets = [
  "naver",
  "coupang",
  "gmarket",
  "auction",
  "elevenst",
  "lotteon",
] as const satisfies readonly MarketId[];

export type SupportedCollectorMarket = (typeof supportedCollectorMarkets)[number];

export const collectorReferenceClasses = ["naver", "coupang", "china-cross-border"] as const;

export type CollectorReferenceClass = (typeof collectorReferenceClasses)[number];

export type ChinaCrossBorderReferenceMarket = "1688" | "taobao" | "aliexpress";

export type CollectorAccessMode = "public-page" | "manual-user-session";

export type CollectorEntryPageKind = "search-results" | "product-detail" | "seller-store";

export type CollectorEntryPage = {
  readonly kind: CollectorEntryPageKind;
  readonly url: UrlString;
  readonly market: SupportedCollectorMarket;
};

export type CollectorRunRequest = {
  readonly kind: "collector-run-request";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly jobId: JobId;
  readonly correlationId: CorrelationId;
  readonly market: SupportedCollectorMarket;
  readonly requestedAt: IsoDateTimeString;
  readonly seed: SourcingSeed;
  readonly scope: SourcingScope;
  readonly policy: SourcingPolicy;
  readonly entry: CollectorEntryPage;
  readonly sessionBoundary?: LocalOnlySessionBoundaryMarker;
};

export type CollectorHeaderName =
  | "accept"
  | "accept-language"
  | "cache-control"
  | "content-language"
  | "content-type"
  | "etag"
  | "last-modified"
  | "retry-after";

export type SanitizedCollectorHeader = {
  readonly name: CollectorHeaderName;
  readonly value: string;
};

export type RawFieldPurpose =
  | "title"
  | "price"
  | "availability"
  | "seller"
  | "image"
  | "category"
  | "canonical-url"
  | "market-product-id";

export type RawCollectorField = {
  readonly purpose: RawFieldPurpose;
  readonly source: "structured-data" | "visible-text" | "metadata";
  readonly value: string;
};

export type RawCollectorSnapshot = {
  readonly kind: "collector-raw-snapshot";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly jobId: JobId;
  readonly market: SupportedCollectorMarket;
  readonly capturedAt: IsoDateTimeString;
  readonly entry: CollectorEntryPage;
  readonly statusCode?: number;
  readonly headers: readonly SanitizedCollectorHeader[];
  readonly fields: readonly RawCollectorField[];
  readonly body: {
    readonly kind: "raw-body";
    readonly serialization: "not-persisted";
    readonly redaction: "html-and-script-content-excluded";
  };
  readonly credentialBoundary: {
    readonly cookies: "not-collected";
    readonly credentials: "not-collected";
    readonly sessionMaterial: "metadata-only";
  };
};

export type SelectorStrategy = "structured-data" | "semantic-text" | "dom-query" | "network-metadata";

export type SelectorEvidenceRequirement =
  | "canonical-url-present"
  | "visible-field-present"
  | "schema-field-present"
  | "status-code-observed";

export type CollectorSelectorCandidate = {
  readonly purpose: RawFieldPurpose;
  readonly strategy: SelectorStrategy;
  readonly requiredEvidence: readonly SelectorEvidenceRequirement[];
};

export type CollectorFallbackPath =
  | {
      readonly kind: "structured-data";
      readonly when: "dom-query-missing" | "visible-text-ambiguous";
    }
  | {
      readonly kind: "canonical-url";
      readonly when: "market-product-id-missing";
    }
  | {
      readonly kind: "manual-review";
      readonly when: "captcha-or-access-control" | "parse-mismatch";
    };

export type CollectorBlockedSignal = {
  readonly reason: Extract<
    CollectorFailureReason,
    "access-denied" | "captcha-required" | "rate-limited" | "session-expired"
  >;
  readonly evidence:
    | "http-status"
    | "retry-after-header"
    | "login-required-page"
    | "captcha-page"
    | "session-expired-page";
};

export type CollectorContract = {
  readonly kind: "collector-contract";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly market: SupportedCollectorMarket;
  readonly referenceClass: CollectorReferenceClass;
  readonly allowedEntries: readonly CollectorEntryPageKind[];
  readonly access: {
    readonly mode: CollectorAccessMode;
    readonly requiresUserInitiatedConsent: true;
    readonly allowStoredCredentials: false;
    readonly allowCookieExport: false;
    readonly allowCaptchaSolving: false;
  };
  readonly rateLimit: {
    readonly profile: SourcingPolicy["rateLimitProfile"];
    readonly retryAfterHeader: "honored-when-present";
    readonly defaultBackoff: "conservative";
  };
  readonly selectors: {
    readonly primary: readonly CollectorSelectorCandidate[];
    readonly fallbacks: readonly CollectorFallbackPath[];
    readonly blockedSignals: readonly CollectorBlockedSignal[];
  };
  readonly output: {
    readonly raw: "sanitized-metadata-only";
    readonly normalized: "market-collector-result";
    readonly partialFailures: "explicit";
  };
};

export type CollectorExecutionResult = {
  readonly kind: "collector-execution-result";
  readonly schemaVersion: typeof contractSchemaVersion;
  readonly request: CollectorRunRequest;
  readonly raw: readonly RawCollectorSnapshot[];
  readonly normalized: MarketCollectorResult;
};

export type MarketCollector = {
  readonly market: SupportedCollectorMarket;
  readonly contract: CollectorContract;
  readonly collect: (request: CollectorRunRequest) => Promise<CollectorExecutionResult>;
};

const blockedSignals: readonly CollectorBlockedSignal[] = [
  { reason: "access-denied", evidence: "http-status" },
  { reason: "captcha-required", evidence: "captcha-page" },
  { reason: "rate-limited", evidence: "retry-after-header" },
  { reason: "session-expired", evidence: "session-expired-page" },
];

const commonSelectorCandidates: readonly CollectorSelectorCandidate[] = [
  {
    purpose: "market-product-id",
    strategy: "structured-data",
    requiredEvidence: ["schema-field-present", "canonical-url-present"],
  },
  {
    purpose: "title",
    strategy: "semantic-text",
    requiredEvidence: ["visible-field-present"],
  },
  {
    purpose: "price",
    strategy: "semantic-text",
    requiredEvidence: ["visible-field-present"],
  },
  {
    purpose: "canonical-url",
    strategy: "network-metadata",
    requiredEvidence: ["canonical-url-present", "status-code-observed"],
  },
];

const commonFallbacks: readonly CollectorFallbackPath[] = [
  { kind: "structured-data", when: "dom-query-missing" },
  { kind: "canonical-url", when: "market-product-id-missing" },
  { kind: "manual-review", when: "captcha-or-access-control" },
  { kind: "manual-review", when: "parse-mismatch" },
];

export const collectorContracts: readonly CollectorContract[] = supportedCollectorMarkets.map((market) => ({
  kind: "collector-contract",
  schemaVersion: contractSchemaVersion,
  market,
  referenceClass: market === "naver" || market === "coupang" ? market : "china-cross-border",
  allowedEntries: ["search-results", "product-detail", "seller-store"],
  access: {
    mode: "public-page",
    requiresUserInitiatedConsent: true,
    allowStoredCredentials: false,
    allowCookieExport: false,
    allowCaptchaSolving: false,
  },
  rateLimit: {
    profile: "conservative",
    retryAfterHeader: "honored-when-present",
    defaultBackoff: "conservative",
  },
  selectors: {
    primary: commonSelectorCandidates,
    fallbacks: commonFallbacks,
    blockedSignals,
  },
  output: {
    raw: "sanitized-metadata-only",
    normalized: "market-collector-result",
    partialFailures: "explicit",
  },
}));

export function getCollectorContract(market: SupportedCollectorMarket): CollectorContract {
  const contract = collectorContracts.find((candidate) => candidate.market === market);
  if (contract === undefined) {
    throw new Error(`Collector contract is missing for supported market: ${market}`);
  }

  return contract;
}

export function createEmptyRawSnapshot(request: CollectorRunRequest): RawCollectorSnapshot {
  return {
    kind: "collector-raw-snapshot",
    schemaVersion: contractSchemaVersion,
    jobId: request.jobId,
    market: request.market,
    capturedAt: request.requestedAt,
    entry: request.entry,
    headers: [],
    fields: [],
    body: {
      kind: "raw-body",
      serialization: "not-persisted",
      redaction: "html-and-script-content-excluded",
    },
    credentialBoundary: {
      cookies: "not-collected",
      credentials: "not-collected",
      sessionMaterial: "metadata-only",
    },
  };
}

export function createCollectorFailure(
  request: CollectorRunRequest,
  reason: CollectorFailureReason,
  message: string,
  occurredAt: IsoDateTimeString,
  retry: RetryState,
): PartialFailure {
  return {
    kind: "partial-failure",
    reason,
    severity: reason === "captcha-required" || reason === "access-denied" ? "fatal" : "recoverable",
    message,
    occurredAt,
    location: {
      kind: "market",
      market: request.market,
    },
    retry,
  };
}

export function createSuccessfulCollectorResult(
  request: CollectorRunRequest,
  products: readonly NormalizedProduct[],
  completedAt: IsoDateTimeString,
): MarketCollectorResult {
  return {
    kind: "collector-result",
    status: "success",
    schemaVersion: contractSchemaVersion,
    jobId: request.jobId,
    market: request.market,
    products,
    stats: {
      requestedCount: request.scope.maxProducts,
      collectedCount: products.length,
      skippedCount: Math.max(request.scope.maxProducts - products.length, 0),
      failedCount: 0,
    },
    completedAt,
  };
}

export function createFailedCollectorResult(
  request: CollectorRunRequest,
  failures: readonly PartialFailure[],
  completedAt: IsoDateTimeString,
): MarketCollectorResult {
  return {
    kind: "collector-result",
    status: "failed",
    schemaVersion: contractSchemaVersion,
    jobId: request.jobId,
    market: request.market,
    failures,
    stats: {
      requestedCount: request.scope.maxProducts,
      collectedCount: 0,
      skippedCount: request.scope.maxProducts,
      failedCount: failures.length,
    },
    completedAt,
  };
}
