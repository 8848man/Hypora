// Project Summary Synthesis Assistant Request/Response Contract — owned by
// this Capability, per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md. Contract
// Version 1.0. One shared shape for both Operations (initial_generation,
// sync) — per that capability spec's own framing note, they diverge only in
// which Invocation Mode triggers the call and what the Feature does with a
// successful response, never in Request/Response Contract shape.

export type CanvasContextField = {
  field: string;
  value: string;
};

export type ProjectSummaryAssistantOperation = "initial_generation" | "sync";

export type ProjectSummaryAssistantRequest = {
  operation: ProjectSummaryAssistantOperation;
  canvasContext: CanvasContextField[];
  mvpContext: CanvasContextField[];
  validationContext: CanvasContextField[];
  language: "ko" | "en";
};

export type ProjectSummaryAssistantResponse = {
  summaryText: string;
  rationale?: string;
};
