// Stage 1 verification script. Runnable directly via:
//   node --experimental-strip-types server/scripts/verifyStage1.ts
// (or `npm run verify:stage1`). Exercises the skeleton end-to-end without a live
// deployment: container wiring, health round-trip, and FakeProvider determinism.

import { createContainer } from "../ai/container.ts";
import { checkAiPlatformHealth } from "../ai/health.ts";
import { FakeProvider } from "../ai/provider/FakeProvider.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`Stage 1 verification: FAIL - ${message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  // Explicitly inject FakeProvider rather than relying on createContainer()'s
  // default, so this script stays valid unmodified once Stage 4 changes that
  // default to Gemini (Audit 9, Stage 1 audit fix).
  const fakeProvider = new FakeProvider();
  const container = createContainer(fakeProvider);

  const health = await checkAiPlatformHealth(container);
  assert(health.status === "ok", `expected health status "ok", got "${health.status}" (${health.detail ?? ""})`);
  assert(container.providerId === fakeProvider.id, `expected "${fakeProvider.id}" provider, got "${container.providerId}"`);

  const first = await container.aiApplicationService.invoke("platform.health-check", "0.0", "same-prompt");
  const second = await container.aiApplicationService.invoke("platform.health-check", "0.0", "same-prompt");
  assert(first.text === second.text, "FakeProvider response was not deterministic for an identical prompt");

  const unknown = await container.aiApplicationService
    .invoke("platform.health-check", "9.9", "x")
    .then(() => null)
    .catch((err: unknown) => err);
  assert(unknown instanceof Error, "expected an error when resolving an unregistered contract version");

  console.log("Stage 1 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 1 verification: FAIL - unexpected error", err);
  process.exit(1);
});
