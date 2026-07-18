// Project Summary Synthesis Assistant prompt template content —
// capability-specific, per sdd/ai/03_ownership_model.md's split. Illustrative
// content only, mirroring every other capability's own template shape. One
// shared template for both Operations (initial_generation, sync) — per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md, synthesis is
// identical regardless of which Invocation Mode triggered the call.

export const SUMMARY_TEMPLATE =
  "You are writing a concise project summary for a founder's business plan. " +
  "Synthesize the material below into a short narrative explaining: what the project is, " +
  "who it is for, what problem it solves, and how the founder intends to validate the idea. " +
  "Do not simply restate section completion status — write a real explanation a first-time reader " +
  "would understand immediately. Keep it concise. Respond only in {{language}}.\n" +
  "Business Canvas:\n{{canvasContext}}\n" +
  "MVP Plan:\n{{mvpContext}}\n" +
  "Validation Plan:\n{{validationContext}}\n" +
  'Respond as JSON: {"summaryText": string}.';
