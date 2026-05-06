import { renderToStaticMarkup } from "react-dom/server";
import {
  App,
  apiHealthData,
  apiHealthSnapshot,
  extensionBoundaryEnvelope,
  localOnlySecretNotice,
  shellSections,
  shellSourcingRequest,
  sourcingStages,
} from "../src/App";

type Assert = {
  readonly match: (actual: string, expected: RegExp) => void;
  readonly equal: (actual: unknown, expected: unknown) => void;
  readonly deepEqual: (actual: unknown, expected: unknown) => void;
  readonly fail: (message?: string | Error) => never;
};

export function runAppShellAssertions(assert: Assert) {
  const markup = renderToStaticMarkup(<App />);

  for (const section of shellSections) {
    assert.match(markup, new RegExp(section.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(markup, /Scope \/ clean-room boundary/);
  assert.match(markup, /API health status/);
  assert.match(markup, /Sourcing workflow stages/);
  assert.match(markup, /Reference-analysis status/);
  assert.match(markup, /Contracts\/schema readiness/);
  assert.match(markup, /Extension\/browser-session collector boundary/);
  assert.match(markup, /Local-only secret handling notice/);
  assert.match(markup, /No crawling, login, or marketplace automation is active/);
  assert.match(markup, /never-serialized/);
  assert.match(markup, /blocked until integration/);

  assert.equal(apiHealthSnapshot.kind, "api-response");
  assert.equal(apiHealthSnapshot.ok, true);
  if (apiHealthSnapshot.ok === true) {
    assert.equal(apiHealthSnapshot.data.checkMode, "static-shell");
  } else {
    assert.fail(apiHealthSnapshot.error.message);
  }
  assert.equal(apiHealthData.checkMode, "static-shell");
  assert.equal(shellSourcingRequest.policy.allowStoredCredentials, false);
  assert.equal(shellSourcingRequest.policy.allowCaptchaSolving, false);
  assert.deepEqual(shellSourcingRequest.scope.markets, ["unknown"]);
  assert.equal(extensionBoundaryEnvelope.message.type, "autometa.session.boundary.mark");
  assert.equal(extensionBoundaryEnvelope.message.payload.serialization, "metadata-only");
  assert.equal(extensionBoundaryEnvelope.message.payload.transfer, "same-device-only");
  assert.equal(localOnlySecretNotice.material, "never-serialized");
  assert.deepEqual(sourcingStages, [
    "queued",
    "sourcing",
    "collecting",
    "normalizing",
    "persisting",
    "completed",
  ]);
}
