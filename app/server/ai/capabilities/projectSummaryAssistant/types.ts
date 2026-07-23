// Project Summary Synthesis Assistant Request/Response Contract — owned by
// this Capability, per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md. Contract
// Version 2.0, per ADR-0018 (Contract Version 1.0 additionally carried
// mvpContext/validationContext — removed entirely, not deprecated; see the
// capability spec's own Contract Version History). One shared shape for both
// Operations (initial_generation, sync) — per that capability spec's own
// framing note, they diverge only in which Invocation Mode triggers the
// call and what the Feature does with a successful response, never in
// Request/Response Contract shape.

import type { CanvasContextField } from "../../shared/types.js";

export type { CanvasContextField };

export type ProjectSummaryAssistantOperation = "initial_generation" | "sync";

export type ProjectSummaryAssistantRequest = {
  operation: ProjectSummaryAssistantOperation;
  canvasContext: CanvasContextField[];
  language: "ko" | "en";
};

export type ProjectSummaryAssistantResponse = {
  summaryText: string;
  rationale?: string;
};
