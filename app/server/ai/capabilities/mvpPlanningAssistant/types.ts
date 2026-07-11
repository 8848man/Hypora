// MVP Planning Assistant Request/Response Contract — owned by this Capability,
// per sdd/ai/capabilities/03_mvp_planning_assistant.md. Contract Version 1.0.
// Deliberately a separate contract from Canvas/Risk Memo Assistant's.

export type CanvasContextField = {
  field: string;
  value: string;
};

export type MvpPlanningAssistantRequest = {
  operation: "suggestion";
  canvasContext: CanvasContextField[];
  riskContext: CanvasContextField[];
  language: "ko" | "en";
};

export type MvpPlanningAssistantResponse = {
  suggestionText: string;
  rationale?: string;
};
