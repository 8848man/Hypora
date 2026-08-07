// Validation Planning Assistant Request/Response Contract — owned by this
// Capability, per sdd/ai/capabilities/04_validation_planning_assistant.md.
// Contract Version 1.0. Deliberately a separate contract from every other
// capability's.

import type { CanvasContextField } from "../../shared/types.js";

export type { CanvasContextField };

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
