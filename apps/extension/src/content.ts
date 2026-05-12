export const contentScriptBoundary = {
  kind: "autometa-content-boundary",
  role: "inert-local-api-readiness-marker",
  pageAccess: "not-used",
  storageAccess: "not-used",
  networkAccess: "not-used",
  note: "Content script does not participate in WBS-24 local API lifecycle messages.",
} as const;
