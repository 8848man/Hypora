// Stage 5 verification script — LIVE Gemini validation. Runnable via:
//   node --experimental-strip-types --env-file=.env server/scripts/verifyStage5.ts
// (plain `node script.ts` does not auto-load .env; --env-file is required for this
// script specifically, unlike Stages 1-3 which always inject FakeProvider explicitly
// and never touch the real API).
//
// If GEMINI_API_KEY is not present in process.env when this runs, live checks are
// skipped and reported as skipped — never fabricated as passing.

import { createContainer } from "../ai/container.ts";
import { GeminiProvider } from "../ai/provider/GeminiProvider.ts";
import { FakeProvider } from "../ai/provider/FakeProvider.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`Stage 5 verification: FAIL - ${message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("Stage 5 verification: GEMINI_API_KEY not present in process.env - LIVE checks SKIPPED.");
    console.log("Re-run with: node --experimental-strip-types --env-file=.env server/scripts/verifyStage5.ts");
    return;
  }

  // 1. Provider independence, made concrete: identical Capability code, two
  // different concrete Providers, only the composition root differs.
  const geminiContainer = createContainer(new GeminiProvider({ apiKey, model: "gemini-2.5-flash", temperature: 0.7 }));
  const fakeContainer = createContainer(new FakeProvider());

  const geminiBootstrap = await geminiContainer.canvasAssistant.invoke({
    operation: "suggestion",
    canvasContext: [],
    currentField: "businessIdea",
    language: "en",
    projectName: "TravelMate",
  });
  assert(
    typeof geminiBootstrap.suggestionText === "string" && geminiBootstrap.suggestionText.length > 0,
    "expected a non-empty suggestion from live Gemini",
  );
  console.log("[Provider independence] live Gemini result:", geminiBootstrap.suggestionText);

  const fakeBootstrap = await fakeContainer.canvasAssistant.invoke({
    operation: "suggestion",
    canvasContext: [],
    currentField: "businessIdea",
    language: "en",
    projectName: "TravelMate",
  });
  assert(typeof fakeBootstrap.suggestionText === "string", "expected FakeProvider to still work via the same code path");
  console.log("[Provider independence] same Capability code, FakeProvider result:", fakeBootstrap.suggestionText);

  // 2. Structured response including the optional `rationale` field (refinement).
  const refinement = await geminiContainer.canvasAssistant.invoke({
    operation: "refinement",
    canvasContext: [
      { field: "businessIdea", value: "AI 기반 여행 동반자 앱" },
      { field: "problem", value: "여행 계획이 번거롭다" },
    ],
    language: "ko",
  });
  assert(
    typeof refinement.suggestionText === "string" && refinement.suggestionText.length > 0,
    "expected a non-empty refinement suggestionText from live Gemini",
  );
  console.log("[Structured response / localization ko] refinement:", refinement);

  // 3. Localization — same operation, two languages, against live Gemini.
  const en = await geminiContainer.canvasAssistant.invoke({
    operation: "missingInfo",
    canvasContext: [{ field: "businessIdea", value: "A travel companion app" }],
    currentField: "targetCustomer",
    language: "en",
  });
  const ko = await geminiContainer.canvasAssistant.invoke({
    operation: "missingInfo",
    canvasContext: [{ field: "businessIdea", value: "여행 동반자 앱" }],
    currentField: "targetCustomer",
    language: "ko",
  });
  assert(typeof en.suggestionText === "string" && en.suggestionText.length > 0, "en missingInfo failed");
  assert(typeof ko.suggestionText === "string" && ko.suggestionText.length > 0, "ko missingInfo failed");
  console.log("[Localization en]:", en.suggestionText);
  console.log("[Localization ko]:", ko.suggestionText);

  // 4. Failure handling — a deliberately invalid API key against the REAL Gemini
  // API. A genuine live-service failure, not a simulated one.
  const badKeyContainer = createContainer(new GeminiProvider({ apiKey: "invalid-key-for-testing", model: "gemini-2.5-flash" }));
  const badKeyOutcome = await badKeyContainer.canvasAssistant
    .invoke({ operation: "suggestion", canvasContext: [], currentField: "businessIdea", language: "en", projectName: "X" })
    .then(() => "unexpected-success" as const)
    .catch((err: unknown) => err);
  console.log(
    "[Failure handling: invalid API key] outcome:",
    badKeyOutcome instanceof Error
      ? { name: badKeyOutcome.name, kind: (badKeyOutcome as { kind?: string }).kind, message: badKeyOutcome.message }
      : badKeyOutcome,
  );

  // 5. Failure handling — a deliberately invalid model name against the REAL
  // Gemini API.
  const badModelContainer = createContainer(new GeminiProvider({ apiKey, model: "gemini-does-not-exist" }));
  const badModelOutcome = await badModelContainer.canvasAssistant
    .invoke({ operation: "suggestion", canvasContext: [], currentField: "businessIdea", language: "en", projectName: "X" })
    .then(() => "unexpected-success" as const)
    .catch((err: unknown) => err);
  console.log(
    "[Failure handling: invalid model] outcome:",
    badModelOutcome instanceof Error
      ? { name: badModelOutcome.name, kind: (badModelOutcome as { kind?: string }).kind, message: badModelOutcome.message }
      : badModelOutcome,
  );

  console.log("Stage 5 verification: PASS (see console output above for live details)");
}

main().catch((err) => {
  console.error("Stage 5 verification: FAIL - unexpected error", err);
  process.exit(1);
});
