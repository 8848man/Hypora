// Canvas Assistant Request/Response Contract — owned by this Capability, per
// sdd/ai/01_architecture.md ("AI Capability ... owns the contract and naming") and
// sdd/ai/capabilities/01_canvas_assistant.md. Contract Version 1.0, Draft (no real
// Feature consumes it yet — see CANVAS_ASSISTANT in CanvasAssistantCapability.ts).

export type CanvasAssistantOperation = "suggestion" | "missingInfo" | "followUp" | "refinement";

export type CanvasContextField = {
  field: string;
  value: string;
};

export type CanvasAssistantRequest = {
  operation: CanvasAssistantOperation;
  canvasContext: CanvasContextField[];
  currentField?: string;
  priorAnswers?: CanvasContextField[];
  language: "ko" | "en";
};

export type CanvasAssistantResponse = {
  suggestionText: string;
  rationale?: string;
};
