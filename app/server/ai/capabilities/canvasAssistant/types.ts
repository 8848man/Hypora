// Canvas Assistant Request/Response Contract — owned by this Capability, per
// sdd/ai/01_architecture.md ("AI Capability ... owns the contract and naming") and
// sdd/ai/capabilities/01_canvas_assistant.md. Contract Version 1.1, Stable (Business
// Structuring is an implemented Consumer — see CANVAS_ASSISTANT in
// CanvasAssistantCapability.ts). 1.1 adds `projectName` (Minor, additive, optional).

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
  // Seed context for AI-first Draft Generation — meaningful primarily when
  // canvasContext is empty (per sdd/ai/capabilities/01_canvas_assistant.md's
  // Responsibility section). The Feature decides when to supply it; the
  // Capability only incorporates it if present.
  projectName?: string;
};

export type CanvasAssistantResponse = {
  suggestionText: string;
  rationale?: string;
};
