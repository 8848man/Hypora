// Validation Planning Assistant — the fourth real AI Capability
// (sdd/ai/capabilities/04_validation_planning_assistant.md). Contract Version
// 1.0, Stable.
//
// This module owns the Request/Response Contract and capability-specific
// content. It knows nothing about which Provider executes it: it only ever
// calls AiApplicationService.invoke(), per ADR-0006/ADR-0007. Rendering/
// serialization/parsing/validation mechanics are generic, shared utilities
// this module composes but does not reimplement.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { serializeContext } from "../../context/ContextTransformer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape, isObjectWithStringField } from "../../response/ResponseValidator.js";
import { SUGGESTION_TEMPLATE } from "./prompts.js";
import type { ValidationPlanningAssistantRequest, ValidationPlanningAssistantResponse } from "./types.js";

export const VALIDATION_PLANNING_ASSISTANT = {
  capabilityId: "validation-planning-assistant",
  contractVersion: "1.0",
};

function isValidationPlanningAssistantResponseShape(
  candidate: unknown,
): candidate is { suggestionText: string; rationale?: string } {
  return isObjectWithStringField(candidate, "suggestionText");
}

export class ValidationPlanningAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: ValidationPlanningAssistantRequest): Promise<ValidationPlanningAssistantResponse> {
    const prompt = createTemplate(SUGGESTION_TEMPLATE).render({
      canvasContext: serializeContext(request.canvasContext),
      // Read-only context from Risk Memo and MVP Planning, never another
      // Feature's internal state -- per the Capability Matrix in
      // sdd/ai/03_ownership_model.md.
      riskContext: serializeContext(request.riskContext ?? []),
      mvpContext: serializeContext(request.mvpContext ?? []),
      language: request.language,
    });

    const providerResponse = await this.service.invoke(
      VALIDATION_PLANNING_ASSISTANT.capabilityId,
      VALIDATION_PLANNING_ASSISTANT.contractVersion,
      prompt,
      { responseSchema: { requiredKeys: ["suggestionText"] } },
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    const validated = assertShape(
      parsed,
      isValidationPlanningAssistantResponseShape,
      "Validation Planning Assistant response did not match the expected {suggestionText, rationale?} shape",
    );

    return {
      suggestionText: validated.suggestionText,
      rationale: validated.rationale,
    };
  }
}
