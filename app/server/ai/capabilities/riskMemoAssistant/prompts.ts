// Risk Memo Assistant prompt template content — capability-specific, per
// sdd/ai/03_ownership_model.md's split (rendering mechanics are generic and owned by
// AI Application Service; the template content itself belongs to this Capability).
// Illustrative content only, mirroring Canvas Assistant's own templates.

import type { RiskMemoTargetField } from "./types.js";

const FIELD_LABEL: Record<RiskMemoTargetField, string> = {
  technical_risks: "Technical Risks",
  business_risks: "Business Risks",
  open_questions: "Open Questions",
};

export const SUGGESTION_TEMPLATE =
  "You are helping a founder identify risks and open questions for their business idea. " +
  "Respond only in {{language}}.\n" +
  "Business Canvas:\n{{canvasContext}}\n" +
  "Already-noted risks/questions in this Risk Memo:\n{{siblingContext}}\n" +
  "Target field: {{targetFieldLabel}}\n" +
  'Suggest content for the target field only. Respond as JSON: {"suggestionText": string}.';

export function targetFieldLabel(field: RiskMemoTargetField): string {
  return FIELD_LABEL[field];
}
