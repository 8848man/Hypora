// MVP Planning Assistant — the third real AI Capability (sdd/ai/capabilities/03_mvp_planning_assistant.md).
// Contract Version 1.0, Stable.
//
// This module owns the Request/Response Contract and capability-specific content
// (prompt template text, response shape). It knows nothing about which Provider
// executes it: it only ever calls AiApplicationService.invoke(), per ADR-0006/
// ADR-0007. Rendering/serialization/parsing/validation mechanics are generic,
// shared utilities this module composes but does not reimplement, identical
// reuse to Canvas Assistant / Risk Memo Assistant's own.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { serializeContext } from "../../context/ContextTransformer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.js";
import { SUGGESTION_TEMPLATE } from "./prompts.js";
import type { MvpPlanningAssistantRequest, MvpPlanningAssistantResponse } from "./types.js";

export const MVP_PLANNING_ASSISTANT = {
  capabilityId: "mvp-planning-assistant",
  contractVersion: "1.0",
};

function isMvpPlanningAssistantResponseShape(
  candidate: unknown,
): candidate is { suggestionText: string; rationale?: string } {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as Record<string, unknown>).suggestionText === "string"
  );
}

export class MvpPlanningAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: MvpPlanningAssistantRequest): Promise<MvpPlanningAssistantResponse> {
    const prompt = createTemplate(SUGGESTION_TEMPLATE).render({
      canvasContext: serializeContext(request.canvasContext),
      // Read-only Risk Memo context, never another Feature's data -- per the
      // frozen architecture's capability-independence rule (sdd/ai/03_ownership_model.md)
      // and the Capability Matrix it now owns.
      riskContext: serializeContext(request.riskContext ?? []),
      language: request.language,
    });

    const providerResponse = await this.service.invoke(
      MVP_PLANNING_ASSISTANT.capabilityId,
      MVP_PLANNING_ASSISTANT.contractVersion,
      prompt,
      { responseSchema: { requiredKeys: ["suggestionText"] } },
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    const validated = assertShape(
      parsed,
      isMvpPlanningAssistantResponseShape,
      "MVP Planning Assistant response did not match the expected {suggestionText, rationale?} shape",
    );

    return {
      suggestionText: validated.suggestionText,
      rationale: validated.rationale,
    };
  }
}
