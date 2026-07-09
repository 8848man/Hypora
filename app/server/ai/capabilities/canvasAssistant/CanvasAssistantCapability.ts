// Canvas Assistant — the first real AI Capability (sdd/ai/capabilities/01_canvas_assistant.md).
// Contract Version 1.0, Draft (per sdd/ai/capabilities/000_index.md#contract-versioning —
// becomes Stable only once a real Feature/Frontend consumes it, at Stage 5).
//
// This module owns the Request/Response Contract and capability-specific content
// (operations, prompt template text, response shape). It knows nothing about which
// Provider executes it: it only ever calls AiApplicationService.invoke(), per
// ADR-0006/ADR-0007. Rendering/serialization/parsing/validation mechanics are
// generic, shared utilities this module composes but does not reimplement, per
// sdd/ai/03_ownership_model.md.

import type { AiApplicationService } from "../../AiApplicationService.ts";
import { createTemplate } from "../../prompt/PromptRenderer.ts";
import { serializeContext } from "../../context/ContextTransformer.ts";
import { parseJson } from "../../response/ResponseParser.ts";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.ts";
import { OPERATION_TEMPLATES } from "./prompts.ts";
import type { CanvasAssistantRequest, CanvasAssistantResponse } from "./types.ts";

export const CANVAS_ASSISTANT = {
  capabilityId: "canvas-assistant",
  contractVersion: "1.0",
};

function isCanvasAssistantResponseShape(
  candidate: unknown,
): candidate is { suggestionText: string; rationale?: string } {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as Record<string, unknown>).suggestionText === "string"
  );
}

export class CanvasAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: CanvasAssistantRequest): Promise<CanvasAssistantResponse> {
    const template = OPERATION_TEMPLATES[request.operation];

    const prompt = createTemplate(template).render({
      canvasContext: serializeContext(request.canvasContext),
      currentField: request.currentField ?? "",
      priorAnswers: serializeContext(request.priorAnswers ?? []),
      language: request.language,
    });

    // Structured-output request is a generic hint carried through the Service's
    // opaque `parameters` bag — only the Provider interprets it (ADR-0007). This
    // Capability never knows or cares which Provider is behind the call.
    const providerResponse = await this.service.invoke(
      CANVAS_ASSISTANT.capabilityId,
      CANVAS_ASSISTANT.contractVersion,
      prompt,
      { responseSchema: { requiredKeys: ["suggestionText"] } },
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    const validated = assertShape(
      parsed,
      isCanvasAssistantResponseShape,
      "Canvas Assistant response did not match the expected {suggestionText, rationale?} shape",
    );

    return {
      suggestionText: validated.suggestionText,
      rationale: validated.rationale,
    };
  }
}
