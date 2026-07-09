// Frontend-side implementation of the Canvas Assistant Capability's outward
// contract (sdd/ai/capabilities/01_canvas_assistant.md, Contract Version 1.0).
// This is the seam Frontend depends on, per ADR-0006 — it never imports server
// code directly (server/ assumes a Node runtime; Frontend is browser-bundled), and
// never leaks Provider concepts (vendor names, HTTP status codes) into this shape.

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

// UX-facing failure taxonomy, per sdd/ai/05_ai_feedback_and_error_experience.md's
// Failure Taxonomy table. "generic" deliberately covers validation / malformed
// response / unknown, matching that document's uniform framing for all three.
export type CanvasAssistantFailureKind =
  | "timeout"
  | "rate_limited"
  | "unavailable"
  | "safety_refusal"
  | "generic";
