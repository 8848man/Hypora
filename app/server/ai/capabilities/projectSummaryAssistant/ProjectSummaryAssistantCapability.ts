// Project Summary Synthesis Assistant — the sixth real AI Capability
// (sdd/ai/capabilities/06_project_summary_synthesis_assistant.md). Contract
// Version 2.0, Stable, per ADR-0018 (narrowed to Business Canvas identity
// synthesis; 1.0 additionally read MVP Scope and Validation Checklist).
//
// This module owns the Request/Response Contract and capability-specific
// content (prompt template text, response shape). It knows nothing about
// which Provider executes it, and nothing about Invocation Mode (Automatic
// vs. Manual, per ADR-0017) — that distinction lives entirely on the Frontend
// side (which hook/call-site invokes it), never here. Rendering/serialization/
// parsing/validation mechanics are generic, shared utilities this module
// composes but does not reimplement, identical reuse to every other
// capability's own.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { serializeContext } from "../../context/ContextTransformer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.js";
import { SUMMARY_TEMPLATE } from "./prompts.js";
import type { ProjectSummaryAssistantRequest, ProjectSummaryAssistantResponse } from "./types.js";

export const PROJECT_SUMMARY_ASSISTANT = {
  capabilityId: "project-summary-assistant",
  contractVersion: "2.0",
};

function isProjectSummaryAssistantResponseShape(
  candidate: unknown,
): candidate is { summaryText: string; rationale?: string } {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as Record<string, unknown>).summaryText === "string"
  );
}

export class ProjectSummaryAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: ProjectSummaryAssistantRequest): Promise<ProjectSummaryAssistantResponse> {
    const prompt = createTemplate(SUMMARY_TEMPLATE).render({
      // Business Canvas only, per ADR-0018 — never MVP Scope, the Feature
      // list, the Validation Checklist, or Risk Memo.
      canvasContext: serializeContext(request.canvasContext),
      language: request.language,
    });

    const providerResponse = await this.service.invoke(
      PROJECT_SUMMARY_ASSISTANT.capabilityId,
      PROJECT_SUMMARY_ASSISTANT.contractVersion,
      prompt,
      { responseSchema: { requiredKeys: ["summaryText"] } },
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    const validated = assertShape(
      parsed,
      isProjectSummaryAssistantResponseShape,
      "Project Summary Synthesis Assistant response did not match the expected {summaryText, rationale?} shape",
    );

    return {
      summaryText: validated.summaryText,
      rationale: validated.rationale,
    };
  }
}
