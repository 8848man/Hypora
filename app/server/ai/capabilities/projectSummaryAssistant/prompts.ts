// Project Summary Synthesis Assistant prompt template content —
// capability-specific, per sdd/ai/03_ownership_model.md's split. Illustrative
// content only, mirroring every other capability's own template shape. One
// shared template for both Operations (initial_generation, sync) — per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md, synthesis is
// identical regardless of which Invocation Mode triggered the call.
//
// Canvas-only, per ADR-0018 — no MVP Plan or Validation Plan section. Never
// claims or implies a validation approach; that content belongs solely to
// the Validation Planning completion card, per that ADR's Decision 1.

export const SUMMARY_TEMPLATE =
  "You are writing a concise identity summary for a founder's business idea. " +
  "Synthesize the material below into a short narrative explaining: what the project is, " +
  "who it is for, what problem it solves, and what value it provides. " +
  "Do not simply restate field completion status, and do not describe how the idea will be " +
  "validated or built — write a real explanation a first-time reader would understand " +
  "immediately. Keep it concise. Respond only in {{language}}.\n" +
  "Business Canvas:\n{{canvasContext}}\n" +
  'Respond as JSON: {"summaryText": string}.';
