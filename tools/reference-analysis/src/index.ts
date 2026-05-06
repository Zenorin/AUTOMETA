export const packageReady = true;

export type CleanRoomTargetModule =
  | "apps/web"
  | "apps/api"
  | "apps/extension"
  | "packages/contracts"
  | "packages/core"
  | "packages/collectors"
  | "tools/reference-analysis";

export type ReferenceRole = {
  readonly modulePath: CleanRoomTargetModule;
  readonly role: string;
  readonly allowedEvidence: readonly string[];
  readonly forbiddenInputs: readonly string[];
};

export const cleanRoomReferencePolicy = {
  referenceOnly: true,
  copySourceText: false,
  copyAssets: false,
  localOnlySecrets: true,
  blockedInputs: [
    "background.js",
    "preload.js",
    "source maps",
    "recovered source text",
    "static chunks",
    "screenshots",
    "logos",
    "templates",
    "credentials",
    "cookies",
    "tokens"
  ]
} as const;

export const referenceRoles: readonly ReferenceRole[] = [
  {
    modulePath: "apps/web",
    role: "Commerce workspace route shells and UI states.",
    allowedEvidence: ["route inventory", "state names", "failure states"],
    forbiddenInputs: ["branded copy", "screenshots", "static chunks"]
  },
  {
    modulePath: "apps/api",
    role: "Job, product, keyword, report, settings, and account-boundary API surface.",
    allowedEvidence: ["API roles", "DTO fields", "typed error cases"],
    forbiddenInputs: ["credential handling code", "hidden login behavior", "reference implementation source"]
  },
  {
    modulePath: "apps/extension",
    role: "Chrome MV3 browser-session bridge that replaces Electron IPC as a user-controlled boundary.",
    allowedEvidence: ["message roles", "permission categories", "progress and cancel semantics"],
    forbiddenInputs: ["Electron preload code", "wildcard trust patterns", "session secrets"]
  },
  {
    modulePath: "packages/contracts",
    role: "Shared DTO, event, API, and extension message schemas.",
    allowedEvidence: ["field names", "event categories", "error envelopes"],
    forbiddenInputs: ["reference source text", "private identifiers", "runtime credentials"]
  },
  {
    modulePath: "packages/core",
    role: "Deterministic sourcing pipeline stages for normalization, ranking, recommendations, and import/export transforms.",
    allowedEvidence: ["pipeline stage roles", "fixture shapes", "failure modes"],
    forbiddenInputs: ["reference algorithms", "generated chunks", "proprietary comments"]
  },
  {
    modulePath: "packages/collectors",
    role: "Market collector contracts with raw and normalized result separation.",
    allowedEvidence: ["collector role inventory", "blocked/challenge states", "selector-empty states"],
    forbiddenInputs: ["market session secrets", "bypass behavior", "copied scraper source"]
  },
  {
    modulePath: "tools/reference-analysis",
    role: "Read-only reference inventory, role reporting, fixture extraction, and source-copy audit evidence.",
    allowedEvidence: ["file inventories", "hashes", "clean-room policy decisions"],
    forbiddenInputs: ["reference source copies", "branded assets", "real credentials"]
  }
];

export function getReferenceRole(modulePath: CleanRoomTargetModule): ReferenceRole {
  const role = referenceRoles.find((item) => item.modulePath === modulePath);

  if (!role) {
    throw new Error(`No clean-room reference role is registered for ${modulePath}`);
  }

  return role;
}
