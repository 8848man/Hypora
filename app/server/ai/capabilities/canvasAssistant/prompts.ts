// Canvas Assistant prompt template content — capability-specific, per
// sdd/ai/03_ownership_model.md's split (rendering mechanics are generic and owned by
// AI Application Service; the template content itself belongs to this Capability).
// Illustrative content only: real prompt engineering happens once a live Provider
// (Stage 4) exists to iterate against.

import type { CanvasAssistantOperation } from "./types.js";

export const OPERATION_TEMPLATES: Record<CanvasAssistantOperation, string> = {
  suggestion:
    "You are helping a founder improve their Business Canvas. Respond only in {{language}}.\n" +
    "Current field: {{currentField}}\nCanvas so far:\n{{canvasContext}}\n" +
    'Suggest an improved answer for the current field. Respond as JSON: {"suggestionText": string}.',
  missingInfo:
    "You are checking a Business Canvas for missing information. Respond only in {{language}}.\n" +
    "Canvas so far:\n{{canvasContext}}\n" +
    'Identify what important information is missing for field {{currentField}}. Respond as JSON: {"suggestionText": string}.',
  followUp:
    "You are helping a founder think through their business idea. Respond only in {{language}}.\n" +
    // Canvas so far already IS the accumulated prior-answers state (per Step 1's
    // context-builder consolidation) — a separate "Prior answers" section here
    // would restate the same field:value lines twice (Context Quality:
    // sdd/ai/04_ai_interaction.md#conversation-policy, "do not repeat the same
    // information more than once within a single request").
    "Canvas so far:\n{{canvasContext}}\n" +
    'Ask one relevant follow-up question about field {{currentField}}. Respond as JSON: {"suggestionText": string}.',
  refinement:
    "You are refining a founder's overall business idea. Respond only in {{language}}.\n" +
    "Canvas so far:\n{{canvasContext}}\n" +
    'Suggest a refinement to the overall idea. Respond as JSON: {"suggestionText": string, "rationale": string}.',
};
