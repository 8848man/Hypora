// Feature Suggestion Assistant — the fifth real AI Capability
// (sdd/ai/capabilities/05_feature_suggestion_assistant.md). Contract Version
// 1.0.
//
// This module owns the Request/Response Contract and capability-specific
// content. It knows nothing about which Provider executes it: it only ever
// calls AiApplicationService.invoke(), per ADR-0006/ADR-0007. Rendering/
// serialization/parsing/validation mechanics are generic, shared utilities
// this module composes but does not reimplement.
//
// SDD Priority note (this project's own Specification-First Procedure):
// every other capability passes a `responseSchema: { requiredKeys: [...] }`
// hint to AiApplicationService.invoke(), which FakeProvider/GeminiProvider
// translate into a flat-OBJECT structured-output request
// ({type:"object", properties, required}). That mechanism has no array-of-
// objects variant — it cannot express this capability's Response Contract
// (an array). Extending FakeProvider/GeminiProvider to support an array
// schema would touch shared Provider infrastructure two other capabilities
// don't need, which is a larger change than this capability requires.
// Minimal-change resolution, applied here: no responseSchema hint is passed
// at all. The prompt alone instructs the model to return a JSON array, and
// assertShape below still fully validates the parsed result regardless —
// structured-output mode is a quality optimization other capabilities use,
// never the sole source of correctness (assertShape already provided that
// for every capability). This does not modify any capability's existing
// behavior, per the frozen architecture; it is a narrower application of an
// already-optional parameter.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { serializeContext } from "../../context/ContextTransformer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.js";
import { SUGGESTION_TEMPLATE, serializeExistingFeatures } from "./prompts.js";
import type {
  FeaturePriority,
  FeatureSuggestionAssistantRequest,
  FeatureSuggestionAssistantResponse,
  FeatureSuggestionItem,
} from "./types.js";

export const FEATURE_SUGGESTION_ASSISTANT = {
  capabilityId: "feature-suggestion-assistant",
  contractVersion: "1.0",
};

const VALID_PRIORITIES: readonly FeaturePriority[] = ["must", "should", "could"];

function isFeatureSuggestionItem(candidate: unknown): candidate is FeatureSuggestionItem {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as Record<string, unknown>;
  return (
    typeof item.name === "string" &&
    typeof item.rationale === "string" &&
    typeof item.primaryUserValue === "string" &&
    typeof item.priority === "string" &&
    VALID_PRIORITIES.includes(item.priority as FeaturePriority)
  );
}

// A malformed priority (any value outside must/should/could) fails this
// shape check, which rejects the *entire* response as invalid — never
// silently coerced or defaulted, per the capability spec's Edge Cases.
function isFeatureSuggestionAssistantResponseShape(
  candidate: unknown,
): candidate is FeatureSuggestionAssistantResponse {
  return Array.isArray(candidate) && candidate.every(isFeatureSuggestionItem);
}

export class FeatureSuggestionAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: FeatureSuggestionAssistantRequest): Promise<FeatureSuggestionAssistantResponse> {
    const prompt = createTemplate(SUGGESTION_TEMPLATE).render({
      canvasContext: serializeContext(request.canvasContext),
      mvpScopeContext: serializeContext(request.mvpScopeContext),
      // Read-only sibling context from this same Feature's own current Feature
      // Plan -- never another Feature's data, per capability-independence.
      existingFeaturesContext: serializeExistingFeatures(request.existingFeatures ?? []),
      riskContext: serializeContext(request.riskContext ?? []),
      language: request.language,
    });

    // No responseSchema parameter -- see the SDD Priority note above this class.
    const providerResponse = await this.service.invoke(
      FEATURE_SUGGESTION_ASSISTANT.capabilityId,
      FEATURE_SUGGESTION_ASSISTANT.contractVersion,
      prompt,
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    // An empty array is a valid response ("nothing to suggest," per the
    // capability spec's Failure Model) -- .every() on [] is vacuously true,
    // so no special-casing is needed here for that case.
    const validated = assertShape(
      parsed,
      isFeatureSuggestionAssistantResponseShape,
      "Feature Suggestion Assistant response did not match the expected array of {name, rationale, primaryUserValue, priority} shape",
    );

    return validated;
  }
}
