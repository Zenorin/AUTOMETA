import {
  collectorFailureReasons,
  contractSchemaVersion,
  marketIds,
  type CollectorFailureReason,
  type CorrelationId,
  type FixtureCollectorInput,
  type FixtureCollectorResult,
  type FixtureProvenance,
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

export type DeterministicFixtureCollectorExample = {
  readonly kind: "deterministic-fixture-collector-example";
  readonly provenanceNote: string;
  readonly input: FixtureCollectorInput;
  readonly raw: readonly RawCollectorSnapshot[];
  readonly normalized: FixtureCollectorResult;
};

const deterministicFixtureProvenance: FixtureProvenance = {
  kind: "fixture-provenance",
  fixtureId: "deterministic-collector-fixtures",
  revision: "wbs-13.2026-05-07",
  source: "synthetic",
  containsSecrets: false,
  containsSessionMaterial: false,
};

const deterministicRequestedAt = "2026-05-07T00:00:00.000Z";
const deterministicCompletedAt = "2026-05-07T00:00:05.000Z";

const retryableFixtureBackoff: RetryState = {
  kind: "retry-state",
  status: "scheduled",
  attempt: 1,
  runAfter: "2026-05-07T00:05:00.000Z",
};

const fatalFixtureStop: RetryState = {
  kind: "retry-state",
  status: "not-retryable",
  reason: "fatal-error",
};

export const deterministicFixtureCollectorExamples = [
  {
    kind: "deterministic-fixture-collector-example",
    provenanceNote:
      "Synthetic fixture authored for WBS-13; it uses reserved fixture.invalid URLs and contains no marketplace data, secrets, cookies, tokens, credentials, or session material.",
    input: {
      kind: "fixture-collector-input",
      schemaVersion: contractSchemaVersion,
      jobId: "job-fixture-naver-success",
      requestId: "req-fixture-naver-success",
      correlationId: "corr-fixture-naver-success",
      sourceType: "fixture",
      fixture: deterministicFixtureProvenance,
      seed: {
        kind: "keyword",
        value: "synthetic desk lamp",
      },
      scope: {
        markets: ["naver"],
        locale: "ko-KR",
        currency: "KRW",
        maxProducts: 1,
      },
      requestedAt: deterministicRequestedAt,
    },
    raw: [
      {
        kind: "collector-raw-snapshot",
        schemaVersion: contractSchemaVersion,
        jobId: "job-fixture-naver-success",
        market: "naver",
        capturedAt: deterministicRequestedAt,
        entry: {
          kind: "search-results",
          url: "https://fixture.invalid/naver/search/synthetic-desk-lamp",
          market: "naver",
        },
        statusCode: 200,
        headers: [
          {
            name: "content-type",
            value: "text/html; charset=utf-8",
          },
        ],
        fields: [
          {
            purpose: "market-product-id",
            source: "structured-data",
            value: "NAVER-FIXTURE-001",
          },
          {
            purpose: "title",
            source: "visible-text",
            value: "Synthetic Desk Lamp",
          },
          {
            purpose: "price",
            source: "visible-text",
            value: "129900 KRW",
          },
          {
            purpose: "canonical-url",
            source: "metadata",
            value: "https://fixture.invalid/naver/products/NAVER-FIXTURE-001",
          },
        ],
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
      },
    ],
    normalized: {
      kind: "fixture-collector-result",
      schemaVersion: contractSchemaVersion,
      jobId: "job-fixture-naver-success",
      requestId: "req-fixture-naver-success",
      correlationId: "corr-fixture-naver-success",
      sourceType: "fixture",
      fixture: deterministicFixtureProvenance,
      result: {
        kind: "collector-result",
        status: "success",
        schemaVersion: contractSchemaVersion,
        jobId: "job-fixture-naver-success",
        market: "naver",
        products: [
          {
            kind: "normalized-product",
            schemaVersion: contractSchemaVersion,
            productId: "normalized-fixture-naver-001",
            source: {
              market: "naver",
              marketProductId: "NAVER-FIXTURE-001",
              collectedAt: deterministicRequestedAt,
              canonicalUrl: "https://fixture.invalid/naver/products/NAVER-FIXTURE-001",
            },
            title: "Synthetic Desk Lamp",
            brand: "Autometa Fixture",
            categoryPath: ["Fixtures", "Lighting"],
            offer: {
              price: {
                amountMinor: 129900,
                currency: "KRW",
              },
              availability: "in-stock",
              seller: {
                sellerId: "fixture-seller-001",
                name: "Fixture Seller",
              },
            },
            images: [
              {
                url: "https://fixture.invalid/assets/naver-fixture-001.png",
                role: "primary",
                altText: "Synthetic fixture product image",
              },
            ],
            attributes: [
              {
                name: "fixtureSource",
                value: "synthetic",
                source: "derived",
              },
            ],
          },
        ],
        stats: {
          requestedCount: 1,
          collectedCount: 1,
          skippedCount: 0,
          failedCount: 0,
        },
        completedAt: deterministicCompletedAt,
      },
      completedAt: deterministicCompletedAt,
    },
  },
  {
    kind: "deterministic-fixture-collector-example",
    provenanceNote:
      "Synthetic partial fixture for rate-limit handling; raw metadata is sanitized and normalized output carries the typed partial failure.",
    input: {
      kind: "fixture-collector-input",
      schemaVersion: contractSchemaVersion,
      jobId: "job-fixture-coupang-partial",
      requestId: "req-fixture-coupang-partial",
      correlationId: "corr-fixture-coupang-partial",
      sourceType: "fixture",
      fixture: deterministicFixtureProvenance,
      seed: {
        kind: "market-product-id",
        market: "coupang",
        marketProductId: "COUPANG-FIXTURE-002",
      },
      scope: {
        markets: ["coupang"],
        locale: "ko-KR",
        currency: "KRW",
        maxProducts: 2,
      },
      requestedAt: deterministicRequestedAt,
    },
    raw: [
      {
        kind: "collector-raw-snapshot",
        schemaVersion: contractSchemaVersion,
        jobId: "job-fixture-coupang-partial",
        market: "coupang",
        capturedAt: deterministicRequestedAt,
        entry: {
          kind: "product-detail",
          url: "https://fixture.invalid/coupang/products/COUPANG-FIXTURE-002",
          market: "coupang",
        },
        statusCode: 429,
        headers: [
          {
            name: "retry-after",
            value: "300",
          },
        ],
        fields: [
          {
            purpose: "market-product-id",
            source: "structured-data",
            value: "COUPANG-FIXTURE-002",
          },
          {
            purpose: "title",
            source: "visible-text",
            value: "Synthetic Storage Bin",
          },
        ],
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
      },
    ],
    normalized: {
      kind: "fixture-collector-result",
      schemaVersion: contractSchemaVersion,
      jobId: "job-fixture-coupang-partial",
      requestId: "req-fixture-coupang-partial",
      correlationId: "corr-fixture-coupang-partial",
      sourceType: "fixture",
      fixture: deterministicFixtureProvenance,
      result: {
        kind: "collector-result",
        status: "partial",
        schemaVersion: contractSchemaVersion,
        jobId: "job-fixture-coupang-partial",
        market: "coupang",
        products: [
          {
            kind: "normalized-product",
            schemaVersion: contractSchemaVersion,
            productId: "normalized-fixture-coupang-002",
            source: {
              market: "coupang",
              marketProductId: "COUPANG-FIXTURE-002",
              collectedAt: deterministicRequestedAt,
              canonicalUrl: "https://fixture.invalid/coupang/products/COUPANG-FIXTURE-002",
            },
            title: "Synthetic Storage Bin",
            categoryPath: ["Fixtures", "Organization"],
            offer: {
              price: {
                amountMinor: 25900,
                currency: "KRW",
              },
              availability: "limited",
            },
            images: [],
            attributes: [
              {
                name: "fixtureSource",
                value: "synthetic",
                source: "derived",
              },
            ],
          },
        ],
        failures: [
          {
            kind: "partial-failure",
            reason: "rate-limited",
            severity: "recoverable",
            message: "Synthetic retry-after fixture; no network request was made.",
            occurredAt: deterministicRequestedAt,
            location: {
              kind: "market",
              market: "coupang",
            },
            retry: retryableFixtureBackoff,
          },
        ],
        stats: {
          requestedCount: 2,
          collectedCount: 1,
          skippedCount: 1,
          failedCount: 1,
        },
        completedAt: deterministicCompletedAt,
      },
      completedAt: deterministicCompletedAt,
    },
  },
  {
    kind: "deterministic-fixture-collector-example",
    provenanceNote:
      "Synthetic unsupported-market fixture; it has no raw snapshot because no marketplace page is accessed.",
    input: {
      kind: "fixture-collector-input",
      schemaVersion: contractSchemaVersion,
      jobId: "job-fixture-unsupported-market",
      requestId: "req-fixture-unsupported-market",
      correlationId: "corr-fixture-unsupported-market",
      sourceType: "fixture",
      fixture: deterministicFixtureProvenance,
      seed: {
        kind: "market-product-id",
        market: "unknown",
        marketProductId: "UNKNOWN-FIXTURE-003",
      },
      scope: {
        markets: ["unknown"],
        locale: "ko-KR",
        currency: "KRW",
        maxProducts: 1,
      },
      requestedAt: deterministicRequestedAt,
    },
    raw: [],
    normalized: {
      kind: "fixture-collector-result",
      schemaVersion: contractSchemaVersion,
      jobId: "job-fixture-unsupported-market",
      requestId: "req-fixture-unsupported-market",
      correlationId: "corr-fixture-unsupported-market",
      sourceType: "fixture",
      fixture: deterministicFixtureProvenance,
      result: {
        kind: "collector-result",
        status: "failed",
        schemaVersion: contractSchemaVersion,
        jobId: "job-fixture-unsupported-market",
        market: "unknown",
        failures: [
          {
            kind: "partial-failure",
            reason: "unsupported-market",
            severity: "fatal",
            message: "Synthetic unsupported-market fixture; no network request was made.",
            occurredAt: deterministicRequestedAt,
            location: {
              kind: "market",
              market: "unknown",
            },
            retry: fatalFixtureStop,
          },
        ],
        stats: {
          requestedCount: 1,
          collectedCount: 0,
          skippedCount: 1,
          failedCount: 1,
        },
        completedAt: deterministicCompletedAt,
      },
      completedAt: deterministicCompletedAt,
    },
  },
] as const satisfies readonly DeterministicFixtureCollectorExample[];

export const deterministicFixtureCollectorInputs = deterministicFixtureCollectorExamples.map(
  (example) => example.input,
) satisfies readonly FixtureCollectorInput[];

export const deterministicFixtureCollectorResults = deterministicFixtureCollectorExamples.map(
  (example) => example.normalized,
) satisfies readonly FixtureCollectorResult[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function isFixtureCollectorResultContract(value: unknown): value is FixtureCollectorResult {
  if (!isRecord(value) || value.kind !== "fixture-collector-result") {
    return false;
  }

  if (
    value.schemaVersion !== contractSchemaVersion ||
    value.sourceType !== "fixture" ||
    typeof value.jobId !== "string" ||
    typeof value.requestId !== "string" ||
    typeof value.correlationId !== "string" ||
    typeof value.completedAt !== "string" ||
    !isRecord(value.fixture) ||
    value.fixture.containsSecrets !== false ||
    value.fixture.containsSessionMaterial !== false ||
    !isRecord(value.result)
  ) {
    return false;
  }

  const result = value.result;
  if (
    result.kind !== "collector-result" ||
    result.schemaVersion !== contractSchemaVersion ||
    typeof result.jobId !== "string" ||
    typeof result.market !== "string" ||
    !marketIds.includes(result.market as (typeof marketIds)[number]) ||
    typeof result.completedAt !== "string" ||
    !isRecord(result.stats)
  ) {
    return false;
  }

  if (result.status === "success") {
    return Array.isArray(result.products) && !("failures" in result);
  }

  if (result.status === "partial") {
    return (
      Array.isArray(result.products) &&
      Array.isArray(result.failures) &&
      result.failures.every(isFixturePartialFailureContract)
    );
  }

  if (result.status === "failed") {
    return Array.isArray(result.failures) && result.failures.every(isFixturePartialFailureContract);
  }

  return false;
}

function isFixturePartialFailureContract(value: unknown): value is PartialFailure {
  if (!isRecord(value) || value.kind !== "partial-failure" || typeof value.reason !== "string") {
    return false;
  }

  return collectorFailureReasons.includes(value.reason as (typeof collectorFailureReasons)[number]);
}
