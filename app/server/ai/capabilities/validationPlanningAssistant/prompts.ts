// Validation Planning Assistant prompt template content — capability-specific,
// per sdd/ai/03_ownership_model.md's split. Illustrative content only.

export const SUGGESTION_TEMPLATE =
  "You are helping a founder draft a new testable Assumption for their Validation Checklist. " +
  "Respond only in {{language}}.\n" +
  "Business Canvas:\n{{canvasContext}}\n" +
  "Known risks (if any):\n{{riskContext}}\n" +
  "MVP Scope (if any):\n{{mvpContext}}\n" +
  'Suggest one new Assumption statement — something specific and testable, not the MVP Scope itself. ' +
  'Respond as JSON: {"suggestionText": string}.';
