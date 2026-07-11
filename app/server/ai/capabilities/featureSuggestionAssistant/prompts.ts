// Feature Suggestion Assistant prompt template content — capability-specific,
// per sdd/ai/03_ownership_model.md's split. Illustrative content only,
// mirroring every other capability's own template. Feature Generation Rules
// below are the prompt-level enforcement of
// sdd/ai/capabilities/05_feature_suggestion_assistant.md#feature-generation-rules
// — there is no mechanical/server-side test for "is this a real capability or
// a UI element," so this guidance lives entirely here.

import type { ExistingFeatureContext } from "./types.js";

export function serializeExistingFeatures(features: ExistingFeatureContext[]): string {
  if (features.length === 0) return "(none yet)";
  return features
    .map((f) => `- ${f.name} (priority: ${f.priority}, in scope: ${f.inScope})`)
    .join("\n");
}

export const SUGGESTION_TEMPLATE =
  "You are helping a founder populate their MVP Feature Plan. Respond only in {{language}}.\n" +
  "Business Canvas:\n{{canvasContext}}\n" +
  "MVP Scope:\n{{mvpScopeContext}}\n" +
  "Known risks (if any):\n{{riskContext}}\n" +
  "Features already in the plan — do not repropose these:\n{{existingFeaturesContext}}\n" +
  "Propose new Features only, following these rules:\n" +
  "1. Each Feature must name a user-facing capability or outcome a person can do or receive — never a UI element (not \"Add a submit button\", not \"Create a settings page\").\n" +
  "2. Phrase each as an action or outcome from the user's perspective, not an implementation noun (\"Search listings by category\", never \"Search index\" or \"API endpoint\").\n" +
  "3. Every proposal must be traceable to the Business Canvas or MVP Scope content above — do not propose anything you cannot ground in that content.\n" +
  "4. Exclude purely technical/infrastructure concerns (authentication systems, databases, admin panels, generic settings) unless reframed as the specific user-facing capability they serve.\n" +
  "5. Priority must be exactly one of: must, should, could — no other value.\n" +
  "If the existing plan is empty, propose a fuller initial set. If it is already substantial, propose only what is clearly missing.\n" +
  'Respond as a JSON array only, with no other text: [{"name": string, "rationale": string, "primaryUserValue": string, "priority": "must" | "should" | "could"}, ...]. If nothing meaningful is missing, respond with an empty array: [].';
