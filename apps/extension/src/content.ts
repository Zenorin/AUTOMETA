export const contentScriptBoundary = {
  kind: "autometa-content-boundary",
  role: "inert-fixture-readiness-marker",
  pageAccess: "not-used",
  storageAccess: "not-used",
  networkAccess: "not-used",
  note: "Content script does not participate in WBS-17 sourcing readiness messages.",
} as const;
