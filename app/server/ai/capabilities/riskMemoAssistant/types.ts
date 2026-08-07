// Risk Memo Assistant Request/Response Contract — owned by this Capability, per
// sdd/ai/capabilities/02_risk_memo_assistant.md. Contract Version 1.0, Draft.
// Deliberately a separate contract from Canvas Assistant's — see that
// capability spec's Promotion Rules citation for why.

import type { CanvasContextField } from "../../shared/types.js";

export type { CanvasContextField };

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
