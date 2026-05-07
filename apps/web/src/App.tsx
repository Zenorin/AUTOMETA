import { contractSchemaVersion } from "../../../packages/contracts/src/index";
import type {
  ApiResponseEnvelope,
  ExtensionMessageEnvelope,
  LocalOnlySessionBoundaryMarker,
  LocalOnlySecretRef,
  PipelineStage,
  SourcingJobCreatedResponse,
  SourcingJobStatusResponse,
  SourcingRequest,
} from "../../../packages/contracts/src/index";

type ShellStatus = "contract-ready" | "planned" | "blocked" | "local-only";
type StatusTone = "ready" | "planned" | "blocked" | "guarded";
type JobUiState = "idle" | "creating" | "queued" | "completed" | "failed" | "invalid-source-rejected";

type HealthStatusSnapshot = {
  readonly kind: "health-status";
  readonly status: ShellStatus;
  readonly service: "api";
  readonly checkMode: "static-shell";
};

type SessionBoundaryMessage = {
  readonly type: "autometa.session.boundary.mark";
  readonly payload: LocalOnlySessionBoundaryMarker;
};

type ShellSection = {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly status: ShellStatus;
  readonly tone: StatusTone;
  readonly summary: string;
  readonly items: readonly string[];
};

const shellTimestamp = "2026-05-06T00:00:00Z";

export const apiHealthSnapshot: ApiResponseEnvelope<HealthStatusSnapshot> = {
  kind: "api-response",
  ok: true,
  data: {
    kind: "health-status",
    status: "contract-ready",
    service: "api",
    checkMode: "static-shell",
  },
  meta: {
    schemaVersion: contractSchemaVersion,
    correlationId: "shell-local-correlation",
    emittedAt: shellTimestamp,
  },
};

function requireApiResponseData<TData>(response: ApiResponseEnvelope<TData>): TData {
  if (response.ok === true) {
    return response.data;
  }

  throw new Error(response.error.message);
}

function requireApiResponseError<TData>(response: ApiResponseEnvelope<TData>) {
  if (response.ok === false) {
    return response.error;
  }

  throw new Error("Expected an API error envelope.");
}

export const apiHealthData = requireApiResponseData(apiHealthSnapshot);

export const shellSourcingRequest: SourcingRequest = {
  kind: "sourcing-request",
  schemaVersion: contractSchemaVersion,
  requestId: "shell-request-placeholder",
  correlationId: apiHealthSnapshot.meta.correlationId,
  requestedAt: shellTimestamp,
  mode: "discover",
  seed: {
    kind: "keyword",
    value: "clean-room-placeholder",
  },
  scope: {
    markets: ["unknown"],
    locale: "ko-KR",
    currency: "KRW",
    maxProducts: 0,
  },
  policy: {
    consent: "user-initiated",
    collectionMode: "public-page",
    rateLimitProfile: "conservative",
    allowStoredCredentials: false,
    allowCaptchaSolving: false,
  },
};

export const extensionBoundaryEnvelope: ExtensionMessageEnvelope<SessionBoundaryMessage> = {
  kind: "extension-message-envelope",
  schemaVersion: contractSchemaVersion,
  messageId: "shell-extension-boundary-placeholder",
  correlationId: apiHealthSnapshot.meta.correlationId,
  source: "web",
  target: "extension-background",
  sentAt: shellTimestamp,
  message: {
    type: "autometa.session.boundary.mark",
    payload: {
      kind: "local-only-session-boundary",
      sessionRef: "local-session-marker-only",
      owner: "extension",
      market: "unknown",
      containsAuthCookies: false,
      transfer: "same-device-only",
      serialization: "metadata-only",
    },
  },
};

export const localOnlySecretNotice: LocalOnlySecretRef = {
  kind: "local-only-secret-ref",
  refId: "local-secret-marker-only",
  owner: "web",
  storage: "local-keychain",
  material: "never-serialized",
};

export const fixtureJobCreatedEnvelope: ApiResponseEnvelope<SourcingJobCreatedResponse> = {
  kind: "api-response",
  ok: true,
  data: {
    kind: "sourcing-job-created-response",
    schemaVersion: contractSchemaVersion,
    jobId: "job-fixture-core-validation",
    requestId: "req-api-fixture",
    correlationId: apiHealthSnapshot.meta.correlationId,
    status: "queued",
    createdAt: "2026-05-07T00:00:00.000Z",
  },
  meta: {
    schemaVersion: contractSchemaVersion,
    correlationId: apiHealthSnapshot.meta.correlationId,
    emittedAt: "2026-05-07T00:00:00.000Z",
  },
};

export const fixtureJobStatusEnvelope: ApiResponseEnvelope<SourcingJobStatusResponse> = {
  kind: "api-response",
  ok: true,
  data: {
    kind: "sourcing-job-status-response",
    schemaVersion: contractSchemaVersion,
    jobId: fixtureJobCreatedEnvelope.data.jobId,
    requestId: fixtureJobCreatedEnvelope.data.requestId,
    correlationId: fixtureJobCreatedEnvelope.data.correlationId,
    status: "completed",
    progress: {
      kind: "sourcing-job-progress",
      stage: "completed",
      completedUnits: 8,
      totalUnits: 8,
      updatedAt: "2026-05-07T00:00:05.000Z",
    },
    cancel: {
      kind: "cancel-state",
      status: "not-requested",
    },
    retry: {
      kind: "retry-state",
      status: "scheduled",
      attempt: 1,
      runAfter: "2026-05-07T00:05:00.000Z",
    },
    resultSummary: {
      kind: "sourcing-job-result-summary",
      jobId: fixtureJobCreatedEnvelope.data.jobId,
      status: "completed",
      markets: ["naver", "coupang", "unknown"],
      itemCount: 2,
      failureCount: 2,
      collectorStatuses: ["success", "partial", "failed"],
      completedAt: "2026-05-07T00:00:05.000Z",
    },
    errors: [
      {
        kind: "sourcing-job-error",
        reason: "collector-failed",
        message: "Fixture rate limit path stayed typed and deterministic.",
        retryable: true,
        occurredAt: "2026-05-07T00:00:00.000Z",
      },
      {
        kind: "sourcing-job-error",
        reason: "collector-failed",
        message: "Unsupported market fixture stayed blocked without live access.",
        retryable: false,
        occurredAt: "2026-05-07T00:00:00.000Z",
      },
    ],
    updatedAt: "2026-05-07T00:00:05.000Z",
  },
  meta: {
    schemaVersion: contractSchemaVersion,
    correlationId: apiHealthSnapshot.meta.correlationId,
    emittedAt: "2026-05-07T00:00:05.000Z",
  },
};

export const fixtureJobStatusData = requireApiResponseData(fixtureJobStatusEnvelope);

export const unsupportedLiveSourceEnvelope: ApiResponseEnvelope<never> = {
  kind: "api-response",
  ok: false,
  error: {
    kind: "error-envelope",
    schemaVersion: contractSchemaVersion,
    code: "validation-failed",
    message: "Only fixture-backed sourcing jobs are available in this clean-room UI.",
    correlationId: apiHealthSnapshot.meta.correlationId,
    retryable: false,
    details: [{ kind: "field", field: "sourceType", issue: "unsupported" }],
  },
  meta: {
    schemaVersion: contractSchemaVersion,
    correlationId: apiHealthSnapshot.meta.correlationId,
    emittedAt: "2026-05-07T00:00:00.000Z",
  },
};

export const unsupportedLiveSourceError = requireApiResponseError(unsupportedLiveSourceEnvelope);

const fixtureJobStates: readonly { readonly state: JobUiState; readonly label: string; readonly message: string }[] = [
  {
    state: "idle",
    label: "Ready",
    message: "Fixture job creation is available for synthetic examples only.",
  },
  {
    state: "creating",
    label: "Creating",
    message: "The UI uses the WBS-15 API envelope shape before showing queued state.",
  },
  {
    state: "queued",
    label: "Queued",
    message: `Created job ${fixtureJobCreatedEnvelope.data.jobId} from fixture data.`,
  },
  {
    state: "completed",
    label: "Completed",
    message: "Deterministic status and result summary are ready for review.",
  },
  {
    state: "failed",
    label: "Failed",
    message: "Typed failure copy is reserved for API envelopes instead of silent success.",
  },
  {
    state: "invalid-source-rejected",
    label: "Invalid source rejected",
    message: unsupportedLiveSourceError.message,
  },
];

export const sourcingStages: readonly PipelineStage[] = [
  "queued",
  "sourcing",
  "collecting",
  "normalizing",
  "persisting",
  "completed",
];

export const shellSections: readonly ShellSection[] = [
  {
    id: "scope-boundary",
    eyebrow: "Scope / clean-room boundary",
    title: "Clean-room sourcing shell",
    status: "contract-ready",
    tone: "ready",
    summary:
      "This screen documents allowed UI flow, contract shapes, and evidence gates without copying reference source, UI, assets, or generated chunks.",
    items: [
      "Reference behavior is represented as roles and contracts only.",
      "Marketplace automation, crawling, login, and collection are not implemented in this shell.",
      "Dashboard, product, keyword, ad, manage, and settings routes are scaffold categories only.",
    ],
  },
  {
    id: "api-health",
    eyebrow: "API health status",
    title: "Health route contract",
    status: apiHealthData.status,
    tone: "ready",
    summary:
      "The web shell is wired to the shared ApiResponseEnvelope shape and displays static shell readiness, not a live API result.",
    items: [
      `Schema version ${apiHealthSnapshot.meta.schemaVersion}`,
      `Envelope kind ${apiHealthSnapshot.kind}`,
      `Health check mode ${apiHealthData.checkMode}`,
    ],
  },
  {
    id: "reference-analysis",
    eyebrow: "Reference-analysis status",
    title: "Role report gate",
    status: "planned",
    tone: "planned",
    summary:
      "Reference analysis remains an evidence gate. The UI does not ingest screenshots, logos, bundles, text, or branded assets.",
    items: [
      "Use clean-room reports before implementation work.",
      "Keep restricted reference material out of the web bundle.",
      "Show status as planned until WBS-10 integration can provide live evidence.",
    ],
  },
  {
    id: "contracts-readiness",
    eyebrow: "Contracts/schema readiness",
    title: "Shared DTO alignment",
    status: "contract-ready",
    tone: "ready",
    summary:
      "The shell imports shared API, sourcing, extension, and local-only boundary types from packages/contracts.",
    items: [
      `Sourcing request kind ${shellSourcingRequest.kind}`,
      `Policy permits stored credentials: ${String(shellSourcingRequest.policy.allowStoredCredentials)}`,
      `Policy permits captcha solving: ${String(shellSourcingRequest.policy.allowCaptchaSolving)}`,
    ],
  },
  {
    id: "extension-boundary",
    eyebrow: "Extension access collector boundary",
    title: "Access marker only",
    status: "blocked",
    tone: "blocked",
    summary:
      "Authenticated access stays behind the extension boundary. The web app can display markers, but it cannot receive private browser material.",
    items: [
      `Transfer rule ${extensionBoundaryEnvelope.message.payload.transfer}`,
      `Serialization rule ${extensionBoundaryEnvelope.message.payload.serialization}`,
      "Collector handoff is blocked until the extension bridge exists.",
    ],
  },
  {
    id: "credential-handling",
    eyebrow: "Local-only credential handling notice",
    title: "No private material in UI state",
    status: "local-only",
    tone: "guarded",
    summary:
      "Private values are represented only by local markers. Real API keys, passwords, service credentials, and private IDs must not be rendered or stored here.",
    items: [
      `Credential material policy ${localOnlySecretNotice.material}`,
      `Storage marker ${localOnlySecretNotice.storage}`,
      "Any real credential flow must remain local-only and require a later security review.",
    ],
  },
];

const stateRows = [
  ["Loading", "Future live health and job polling will show pending status without implying collection success."],
  ["Empty", "No sourcing request has been submitted in this scaffold shell."],
  ["Error", "Typed ApiResponseEnvelope errors are reserved for API and extension failures."],
  ["Success", "Fixture-only job completion can show success after WBS-15 status envelopes are available."],
  ["Permission", "Extension-mediated collection remains blocked until consent and boundaries exist."],
] as const;

function statusLabel(status: ShellStatus) {
  return status.replace("-", " ");
}

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar" aria-label="AUTOMETA workspace header">
        <div>
          <p className="eyebrow">AUTOMETA clean-room rebuild</p>
          <h1>Commerce sourcing control shell</h1>
          <p className="lede">
            A scaffold dashboard for contract-first sourcing, reference-analysis gates,
            extension access boundaries, and local-only credential handling.
          </p>
        </div>
        <div className="schema-pill" aria-label="Active schema version">
          <span>Schema</span>
          <strong>{contractSchemaVersion}</strong>
        </div>
      </header>

      <nav className="route-tabs" aria-label="Workspace route categories">
        {["Dashboard", "Products", "Keywords", "Ads", "Manage", "Settings"].map((label, index) => (
          <a href={`#${index === 0 ? "scope-boundary" : "contracts-readiness"}`} key={label}>
            {label}
          </a>
        ))}
      </nav>

      <section className="summary-grid" aria-label="Workflow summary">
        <div className="summary-panel">
          <span className="panel-label">API envelope</span>
          <strong>{apiHealthSnapshot.ok ? "Contract ready" : "Error envelope"}</strong>
          <p>{apiHealthData.service} uses {apiHealthSnapshot.kind}</p>
        </div>
        <div className="summary-panel">
          <span className="panel-label">Collection mode</span>
          <strong>Scaffold only</strong>
          <p>No crawling, login, or marketplace automation is active.</p>
        </div>
        <div className="summary-panel">
          <span className="panel-label">Credential boundary</span>
          <strong>Local marker</strong>
          <p>{localOnlySecretNotice.material}</p>
        </div>
      </section>

      <section className="job-console" aria-labelledby="fixture-job-console">
        <div className="job-console__header">
          <div>
            <p className="eyebrow">Fixture-only sourcing job</p>
            <h2 id="fixture-job-console">WBS-15 API boundary preview</h2>
            <p>
              Synthetic fixture data drives these states through the shared API envelope vocabulary.
              Live marketplace access is visibly blocked.
            </p>
          </div>
          <div className="job-actions" aria-label="Fixture job actions">
            <button type="button">Create fixture job</button>
            <button type="button" disabled>
              Live source blocked
            </button>
          </div>
        </div>

        <div className="job-state-grid" aria-label="Fixture job UI states">
          {fixtureJobStates.map((jobState) => (
            <article className={`job-state job-state--${jobState.state}`} key={jobState.state}>
              <span>{jobState.label}</span>
              <p>{jobState.message}</p>
            </article>
          ))}
        </div>

        <div className="job-detail-grid">
          <article className="job-detail-panel" aria-label="Fixture job status">
            <p className="panel-label">Job status</p>
            <dl>
              <div>
                <dt>Envelope</dt>
                <dd>{fixtureJobStatusEnvelope.kind}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{fixtureJobStatusData.status}</dd>
              </div>
              <div>
                <dt>Progress</dt>
                <dd>
                  {fixtureJobStatusData.progress.completedUnits} / {fixtureJobStatusData.progress.totalUnits}
                </dd>
              </div>
            </dl>
          </article>

          <article className="job-detail-panel" aria-label="Fixture result summary">
            <p className="panel-label">Fixture result summary</p>
            <dl>
              <div>
                <dt>Items</dt>
                <dd>{fixtureJobStatusData.resultSummary?.itemCount}</dd>
              </div>
              <div>
                <dt>Failures</dt>
                <dd>{fixtureJobStatusData.resultSummary?.failureCount}</dd>
              </div>
              <div>
                <dt>Collector states</dt>
                <dd>{fixtureJobStatusData.resultSummary?.collectorStatuses.join(", ")}</dd>
              </div>
            </dl>
          </article>

          <article className="job-detail-panel blocked-source" aria-label="Unsupported source guard">
            <p className="panel-label">Unsupported source guard</p>
            <strong>Invalid source rejected</strong>
            <p>{unsupportedLiveSourceError.message}</p>
          </article>
        </div>

        <p className="boundary-notice">
          Clean-room boundary: this UI shows fixture-only job envelopes and deterministic summaries.
          It does not request marketplace pages, automate browsers, or collect private browser material.
        </p>
      </section>

      <section className="stage-band" aria-labelledby="workflow-stages">
        <div>
          <p className="eyebrow">Sourcing workflow stages</p>
          <h2 id="workflow-stages">Planned pipeline, no live collection</h2>
        </div>
        <ol className="stage-list">
          {sourcingStages.map((stage) => (
            <li key={stage}>
              <span>{stage}</span>
              <small>{stage === "completed" ? "planned" : "blocked until integration"}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-grid" aria-label="Clean-room shell sections">
        {shellSections.map((section) => (
          <article className={`section-card tone-${section.tone}`} id={section.id} key={section.id}>
            <div className="card-heading">
              <div>
                <p className="eyebrow">{section.eyebrow}</p>
                <h2>{section.title}</h2>
              </div>
              <span className="status-chip">{statusLabel(section.status)}</span>
            </div>
            <p>{section.summary}</p>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="state-table" aria-labelledby="ui-state-coverage">
        <div>
          <p className="eyebrow">UI state coverage</p>
          <h2 id="ui-state-coverage">Scaffold states stay explicit</h2>
        </div>
        <div className="state-rows">
          {stateRows.map(([state, message]) => (
            <div className="state-row" key={state}>
              <strong>{state}</strong>
              <span>{message}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
