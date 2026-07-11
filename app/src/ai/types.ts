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
  // Seed context for AI-first Draft Generation — send only when canvasContext is
  // empty (per sdd/ai/capabilities/01_canvas_assistant.md).
  projectName?: string;
};

export type CanvasAssistantResponse = {
  suggestionText: string;
  rationale?: string;
};

// UX-facing failure taxonomy, per sdd/ai/05_ai_feedback_and_error_experience.md's
// Failure Taxonomy table — capability-agnostic (the taxonomy itself is Platform-wide,
// not Canvas-Assistant-specific), reused as-is by every capability's own alias below.
// "generic" deliberately covers validation / malformed response / unknown, matching
// that document's uniform framing for all three.
export type AiFailureKind = "timeout" | "rate_limited" | "unavailable" | "safety_refusal" | "generic";

export type CanvasAssistantFailureKind = AiFailureKind;

// Risk Memo Assistant's own outward contract (sdd/ai/capabilities/02_risk_memo_assistant.md,
// Contract Version 1.0). Deliberately a separate type from Canvas Assistant's — their
// Request/Response shapes diverge, per that capability spec's Promotion Rules citation.

export type RiskMemoTargetField = "technical_risks" | "business_risks" | "open_questions";

export type RiskMemoSiblingField = {
  field: RiskMemoTargetField;
  value: string;
};

export type RiskMemoAssistantRequest = {
  operation: "suggestion";
  canvasContext: CanvasContextField[];
  targetField: RiskMemoTargetField;
  siblingFields?: RiskMemoSiblingField[];
  language: "ko" | "en";
};

export type RiskMemoAssistantResponse = {
  suggestionText: string;
  rationale?: string;
};

export type RiskMemoAssistantFailureKind = AiFailureKind;
