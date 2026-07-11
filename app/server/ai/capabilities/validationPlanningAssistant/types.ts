// Validation Planning Assistant Request/Response Contract — owned by this
// Capability, per sdd/ai/capabilities/04_validation_planning_assistant.md.
// Contract Version 1.0. Deliberately a separate contract from every other
// capability's.

export type CanvasContextField = {
  field: string;
  value: string;
};

export type ValidationPlanningAssistantRequest = {
  operation: "suggestion";
  canvasContext: CanvasContextField[];
  riskContext: CanvasContextField[];
  mvpContext: CanvasContextField[];
  language: "ko" | "en";
};

export type ValidationPlanningAssistantResponse = {
  suggestionText: string;
  rationale?: string;
};
