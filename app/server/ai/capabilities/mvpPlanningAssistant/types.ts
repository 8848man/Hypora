// MVP Planning Assistant Request/Response Contract — owned by this Capability,
// per sdd/ai/capabilities/03_mvp_planning_assistant.md. Contract Version 1.0.
// Deliberately a separate contract from Canvas/Risk Memo Assistant's.

import type { CanvasContextField } from "../../shared/types.js";

export type { CanvasContextField };

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
