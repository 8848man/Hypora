// Risk Memo Assistant — the second real AI Capability (sdd/ai/capabilities/02_risk_memo_assistant.md).
// Contract Version 1.0, Draft.
//
// This module owns the Request/Response Contract and capability-specific content
// (prompt template text, response shape). It knows nothing about which Provider
// executes it: it only ever calls AiApplicationService.invoke(), per ADR-0006/
// ADR-0007. Rendering/serialization/parsing/validation mechanics are generic,
// shared utilities this module composes but does not reimplement, per
// sdd/ai/03_ownership_model.md -- identical reuse to Canvas Assistant's own,
// confirming the Context Representation Pipeline generalizes as designed.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { serializeContext } from "../../context/ContextTransformer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.js";
import { SUGGESTION_TEMPLATE, targetFieldLabel } from "./prompts.js";
import type { RiskMemoAssistantRequest, RiskMemoAssistantResponse } from "./types.js";

export const RISK_MEMO_ASSISTANT = {
  capabilityId: "risk-memo-assistant",
  contractVersion: "1.0",
};

function isRiskMemoAssistantResponseShape(
  candidate: unknown,
): candidate is { suggestionText: string; rationale?: string } {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as Record<string, unknown>).suggestionText === "string"
  );
}

export class RiskMemoAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: RiskMemoAssistantRequest): Promise<RiskMemoAssistantResponse> {
    const prompt = createTemplate(SUGGESTION_TEMPLATE).render({
      canvasContext: serializeContext(request.canvasContext),
      // Sibling context (the Risk Memo's other two fields), never another
      // Feature's data -- per the frozen architecture's capability-independence
      // rule (sdd/ai/03_ownership_model.md).
      siblingContext: serializeContext(request.siblingFields ?? []),
      targetFieldLabel: targetFieldLabel(request.targetField),
      language: request.language,
    });

    const providerResponse = await this.service.invoke(
      RISK_MEMO_ASSISTANT.capabilityId,
      RISK_MEMO_ASSISTANT.contractVersion,
      prompt,
      { responseSchema: { requiredKeys: ["suggestionText"] } },
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    const validated = assertShape(
      parsed,
      isRiskMemoAssistantResponseShape,
      "Risk Memo Assistant response did not match the expected {suggestionText, rationale?} shape",
    );

    return {
      suggestionText: validated.suggestionText,
      rationale: validated.rationale,
    };
  }
}
