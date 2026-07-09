// Canvas Assistant — the first real AI Capability (sdd/ai/capabilities/01_canvas_assistant.md).
// Contract Version 1.1, Stable (Business Structuring is an implemented Consumer, per
// sdd/ai/capabilities/000_index.md#contract-versioning).
//
// This module owns the Request/Response Contract and capability-specific content
// (operations, prompt template text, response shape). It knows nothing about which
// Provider executes it: it only ever calls AiApplicationService.invoke(), per
// ADR-0006/ADR-0007. Rendering/serialization/parsing/validation mechanics are
// generic, shared utilities this module composes but does not reimplement, per
// sdd/ai/03_ownership_model.md.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { serializeContext } from "../../context/ContextTransformer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.js";
import { OPERATION_TEMPLATES } from "./prompts.js";
import type { CanvasAssistantRequest, CanvasAssistantResponse } from "./types.js";

export const CANVAS_ASSISTANT = {
  capabilityId: "canvas-assistant",
  contractVersion: "1.1",
};

// Builds the "canvas so far" text the prompt template receives — conditionally
// prepending a project-title seed line when the Feature has supplied one
// (per AI-first Draft Generation, sdd/ai/capabilities/01_canvas_assistant.md).
// No template placeholder change and no PromptRenderer conditional logic needed:
// this Capability constructs the content; the generic renderer just substitutes it.
function buildCanvasContextText(request: CanvasAssistantRequest): string {
  const canvasText = serializeContext(request.canvasContext);
  if (!request.projectName) return canvasText;

  const titleLine = `Project title: ${request.projectName}`;
  return canvasText ? `${titleLine}\n${canvasText}` : titleLine;
}

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

    // No template renders {{priorAnswers}} as of Context Quality (Step 4):
    // canvasContext already IS the accumulated confirmed state (per Step 1), so a
    // second "prior answers" section would repeat the same information twice —
    // exactly what sdd/ai/04_ai_interaction.md's Context Quality rule forbids. The
    // Request Contract's `priorAnswers` field is untouched (still a legitimate,
    // optional field for a future template that genuinely needs a distinct set);
    // this Capability's current templates simply don't read it.
    const prompt = createTemplate(template).render({
      canvasContext: buildCanvasContextText(request),
      currentField: request.currentField ?? "",
      language: request.language,
    });

    // The structured-output schema must match what the template actually asks
    // for: "refinement" is the only operation whose prose requests a rationale
    // alongside the answer. Requesting only `suggestionText` for it (as every
    // other operation correctly does) left the model no dedicated field for its
    // explanation — observed live (Step 5) to produce a bilingual ko+en answer
    // crammed into one string instead of a clean ko answer plus a separate
    // rationale. This hint is still a generic, capability-agnostic mechanism
    // carried through the Service's opaque `parameters` bag (ADR-0007) — only
    // *which* keys are required varies per operation, not how the Provider
    // interprets the hint.
    const requiredKeys = request.operation === "refinement" ? ["suggestionText", "rationale"] : ["suggestionText"];

    const providerResponse = await this.service.invoke(
      CANVAS_ASSISTANT.capabilityId,
      CANVAS_ASSISTANT.contractVersion,
      prompt,
      { responseSchema: { requiredKeys } },
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
