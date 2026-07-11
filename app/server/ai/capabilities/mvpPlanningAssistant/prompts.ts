// MVP Planning Assistant prompt template content — capability-specific, per
// sdd/ai/03_ownership_model.md's split. Illustrative content only, mirroring
// Risk Memo Assistant's own template.

export const SUGGESTION_TEMPLATE =
  "You are helping a founder draft their MVP Scope statement — the boundary of what counts as their first version. " +
  "Respond only in {{language}}.\n" +
  "Business Canvas:\n{{canvasContext}}\n" +
  "Known risks (if any):\n{{riskContext}}\n" +
  'Suggest an MVP Scope statement. Respond as JSON: {"suggestionText": string}.';
