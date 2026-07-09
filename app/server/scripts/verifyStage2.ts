// Stage 2 verification script. Runnable via:
//   node --experimental-strip-types server/scripts/verifyStage2.ts
// (or `npm run verify:stage2`). Exercises the Canvas Assistant Capability end-to-end
// against FakeProvider only — no HTTP endpoint (that's Stage 3), no Gemini (Stage 4).

import { createContainer } from "../ai/container.ts";
import { FakeProvider } from "../ai/provider/FakeProvider.ts";
import type { CanvasAssistantOperation } from "../ai/capabilities/canvasAssistant/types.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`Stage 2 verification: FAIL - ${message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const container = createContainer(new FakeProvider());

  const operations: CanvasAssistantOperation[] = ["suggestion", "missingInfo", "followUp", "refinement"];

  for (const operation of operations) {
    const response = await container.canvasAssistant.invoke({
      operation,
      canvasContext: [
        { field: "problem", value: "Founders struggle to structure a new idea" },
        { field: "targetCustomer", value: "Solo founders" },
      ],
      currentField: "valueProposition",
      priorAnswers: [{ field: "problem", value: "Founders struggle to structure a new idea" }],
      language: "en",
    });

    assert(
      typeof response.suggestionText === "string" && response.suggestionText.length > 0,
      `operation "${operation}" did not return a non-empty suggestionText`,
    );
  }

  // Korean language path + rationale-tolerant shape (refinement's template requests
  // a rationale field; the validator must not reject a response lacking it, since
  // FakeProvider's schema hint only requires suggestionText).
  const refinement = await container.canvasAssistant.invoke({
    operation: "refinement",
    canvasContext: [{ field: "problem", value: "founders need help" }],
    language: "ko",
  });
  assert(typeof refinement.suggestionText === "string", "refinement response missing suggestionText");

  // AI-first Draft Generation: empty canvasContext + a projectName seed must still
  // produce a valid suggestion (Step 2 of the Context Accumulation implementation).
  const bootstrapped = await container.canvasAssistant.invoke({
    operation: "suggestion",
    canvasContext: [],
    currentField: "businessIdea",
    language: "en",
    projectName: "TravelMate",
  });
  assert(
    typeof bootstrapped.suggestionText === "string" && bootstrapped.suggestionText.length > 0,
    "expected a non-empty draft suggestion when seeded only from projectName",
  );

  // Malformed-response path: a provider that ignores the schema hint entirely must
  // surface a validation error, not a silently wrong result.
  const misbehavingProvider = {
    id: "misbehaving",
    async generate() {
      return { text: "not json at all" };
    },
  };
  const misbehavingContainer = createContainer(misbehavingProvider);
  const failure = await misbehavingContainer.canvasAssistant
    .invoke({ operation: "suggestion", canvasContext: [], language: "en" })
    .then(() => null)
    .catch((err: unknown) => err);
  assert(failure instanceof Error, "expected a validation/parse error for a malformed provider response");

  console.log("Stage 2 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 2 verification: FAIL - unexpected error", err);
  process.exit(1);
});
