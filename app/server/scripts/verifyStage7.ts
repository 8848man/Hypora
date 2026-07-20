// Stage 7 verification script:
//   node --experimental-strip-types server/scripts/verifyStage7.ts
// Exercises the Onboarding Preset Assistant Capability's HTTP layer
// end-to-end (mirroring verifyStage6.ts), its capability-layer Content
// Quality Validation (ADR-0021), and its FakeProvider-driven failure path.
//
// Note on FakeProvider + this capability: per
// OnboardingPresetAssistantCapability.ts's header comment, no
// responseSchema hint is passed (same reasoning as Feature Suggestion
// Assistant, capability 05) because this capability's Response Contract
// contains an array, which the flat-object structured-output hint cannot
// express. FakeProvider's un-hinted branch returns a plain, non-JSON echo
// string ("[fake-provider deterministic response] echo: ..."), so a
// FakeProvider-backed call to this capability *always* fails JSON parsing
// -- this is not a bug, it is the same known, accepted limitation Feature
// Suggestion Assistant already has. What section 1 below verifies is that
// this failure path resolves exactly as the capability spec's Failure
// Scenario Matrix documents: a parsing failure surfaces as HTTP 502, kind
// "invalid_response" -- the deterministic Fallback trigger Project
// Management's triggerOnboardingPresets() (ProjectListPage.tsx) already
// handles. Section 7 below uses a small local fake Provider (not
// FakeProvider) to exercise Content Quality Validation directly, since
// FakeProvider cannot produce valid-JSON-but-bad-content responses.

import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler from "../../api/onboarding-preset-assistant.js";
import { AiApplicationService } from "../ai/AiApplicationService.js";
import { createInMemoryProviderConfig } from "../ai/config/providerConfig.js";
import { OnboardingPresetAssistantCapability, ONBOARDING_PRESET_ASSISTANT } from "../ai/capabilities/onboardingPresetAssistant/OnboardingPresetAssistantCapability.js";
import { ONBOARDING_QUESTION_IDS } from "../ai/capabilities/onboardingPresetAssistant/types.js";
import type { Provider, ProviderRequest, ProviderResponse } from "../ai/provider/ProviderInterface.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`Stage 7 verification: FAIL - ${message}`);
    process.exit(1);
  }
}

function createMockRequest(method: string, body: unknown): IncomingMessage {
  const bodyStr = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  const readable = Readable.from([Buffer.from(bodyStr, "utf8")]) as unknown as IncomingMessage;
  (readable as unknown as { method: string }).method = method;
  return readable;
}

function createMockResponse(): { res: ServerResponse; status: () => number; body: () => string } {
  let statusCode = 0;
  let body = "";
  const res = {
    setHeader: () => {},
    end: (chunk: string) => {
      body = chunk;
    },
  } as unknown as ServerResponse;
  Object.defineProperty(res, "statusCode", {
    get: () => statusCode,
    set: (v: number) => {
      statusCode = v;
    },
  });
  return { res, status: () => statusCode, body: () => body };
}

// A minimal fake Provider (not FakeProvider) that always returns a
// structurally-valid five-question batch, but with content that must fail
// Content Quality Validation (placeholder brackets, generic openers) --
// proving the capability rejects it rather than passing it through.
class BadContentProvider implements Provider {
  readonly id = "bad-content-fake";
  async generate(_request: ProviderRequest): Promise<ProviderResponse> {
    const presets = ONBOARDING_QUESTION_IDS.map((questionId) => ({
      questionId,
      options: ["[Feature] placeholder idea", "Process for handling things", "{template} fragment"],
    }));
    return { text: JSON.stringify({ presets }) };
  }
}

// A minimal fake Provider that returns mostly-good content for every
// question but a few bad options mixed in -- proving bad options are
// dropped and the question still survives with its remaining good ones.
class MixedContentProvider implements Provider {
  readonly id = "mixed-content-fake";
  async generate(_request: ProviderRequest): Promise<ProviderResponse> {
    const presets = ONBOARDING_QUESTION_IDS.map((questionId) => ({
      questionId,
      options: [
        "Automatically reminds customers about upcoming reservations.",
        "[Feature] placeholder that must be dropped",
        "Lets staff confirm bookings with one tap.",
        "Helps customers find available tables based on party size.",
      ],
    }));
    return { text: JSON.stringify({ presets }) };
  }
}

async function main(): Promise<void> {
  // 1. HTTP layer -- FakeProvider's un-hinted plain-text response fails JSON
  // parsing, which must deterministically resolve to 502 invalid_response
  // (the capability spec's Failure Scenario Matrix "Parsing failure" row) --
  // never a 500, never an unhandled rejection.
  {
    const { res, status, body } = createMockResponse();
    await handler(
      createMockRequest("POST", {
        projectName: "Neighborhood tool-lending app",
        projectDescription: "Helps neighbors lend and borrow tools instead of buying ones they'll rarely use.",
        language: "en",
      }),
      res,
    );
    assert(status() === 502, `expected 502 for FakeProvider's non-JSON response, got ${status()}`);
    assert(JSON.parse(body()).kind === "invalid_response", "expected kind=invalid_response in 502 response");
  }

  // 2. Method validation.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("GET", undefined), res);
    assert(status() === 405, `expected 405 for GET, got ${status()}`);
  }

  // 3. Missing projectName -> 400.
  {
    const { res, status, body } = createMockResponse();
    await handler(createMockRequest("POST", { language: "en" }), res);
    assert(status() === 400, `expected 400 for missing projectName, got ${status()}`);
    assert(JSON.parse(body()).kind === "validation", "expected kind=validation in 400 response");
  }

  // 4. Empty projectName -> 400 (non-empty required, per Request Contract Validation rules).
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("POST", { projectName: "   ", language: "en" }), res);
    assert(status() === 400, `expected 400 for empty projectName, got ${status()}`);
  }

  // 5. Invalid language -> 400.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("POST", { projectName: "x", language: "fr" }), res);
    assert(status() === 400, `expected 400 for invalid language, got ${status()}`);
  }

  // 6. projectDescription omitted entirely -> still valid (optional field).
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("POST", { projectName: "x", language: "en" }), res);
    // Still resolves to 502 (FakeProvider parsing limitation, see header
    // comment) -- the point of this case is that validation itself passes
    // (no 400), proving projectDescription's absence is accepted.
    assert(status() === 502, `expected 502 (validation passed, provider parse failed), got ${status()}`);
  }

  // 7. Content Quality Validation (ADR-0021 Decision 3) -- an entirely
  // placeholder/template response must be rejected (treated as invalid,
  // never passed through to the UI).
  {
    const config = createInMemoryProviderConfig([
      {
        providerId: "bad-content-fake",
        capabilityId: ONBOARDING_PRESET_ASSISTANT.capabilityId,
        contractVersion: ONBOARDING_PRESET_ASSISTANT.contractVersion,
        model: "n/a",
        providerParameters: {},
      },
    ]);
    const service = new AiApplicationService({ provider: new BadContentProvider(), config });
    const capability = new OnboardingPresetAssistantCapability(service);
    let threw = false;
    try {
      await capability.invoke({ projectName: "Test", language: "en" });
    } catch {
      threw = true;
    }
    assert(threw, "expected an all-placeholder Response to be rejected (thrown), but it was accepted");
  }

  // 8. Content Quality Validation filters individual bad options while
  // keeping good ones -- a question with 3 good + 1 bad option out of 4
  // survives with just the 3 good ones (still >= the 3-option minimum).
  {
    const config = createInMemoryProviderConfig([
      {
        providerId: "mixed-content-fake",
        capabilityId: ONBOARDING_PRESET_ASSISTANT.capabilityId,
        contractVersion: ONBOARDING_PRESET_ASSISTANT.contractVersion,
        model: "n/a",
        providerParameters: {},
      },
    ]);
    const service = new AiApplicationService({ provider: new MixedContentProvider(), config });
    const capability = new OnboardingPresetAssistantCapability(service);
    const response = await capability.invoke({ projectName: "Restaurant Reservation Assistant", language: "en" });
    assert(response.presets.length === ONBOARDING_QUESTION_IDS.length, "expected all five questions to survive");
    for (const set of response.presets) {
      assert(set.options.length === 3, `expected the bad option to be filtered, leaving 3, got ${set.options.length}`);
      assert(
        set.options.every((o) => !/[[\]{}<>]/.test(o)),
        "a placeholder-containing option leaked through Content Quality Validation",
      );
    }
  }

  console.log("Stage 7 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 7 verification: FAIL - unexpected error", err);
  process.exit(1);
});
