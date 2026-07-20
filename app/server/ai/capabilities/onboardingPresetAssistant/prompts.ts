// Onboarding Preset Assistant prompt template content — capability-specific,
// per sdd/ai/03_ownership_model.md's split.
//
// No responseSchema hint is passed for this capability (see
// OnboardingPresetAssistantCapability.ts's header comment) -- same
// minimal-change resolution already established by Feature Suggestion
// Assistant (05) for a Response Contract shape the flat-object structured-
// output hint cannot express. The prompt alone instructs the model to
// return the required JSON shape; assertShape + Content Quality Validation
// (OnboardingPresetAssistantCapability.ts) validate the parsed result
// regardless of whether structured-output mode was used.
//
// Per ADR-0021: every option must be a concrete, specific, immediately
// understandable statement written as if the product already exists --
// never a placeholder, template fragment, or reusable prompt scaffold. The
// good/bad examples below are prompt content (product/content authoring),
// not a Contract change -- see that capability spec's own Decision 5 note.

import { ONBOARDING_QUESTION_IDS } from "./types.js";

export const ONBOARDING_PRESET_TEMPLATE =
  "You are proposing concrete starting-point ideas to a first-time founder for a brand-new " +
  "business idea. You are given only a Project name and, optionally, a short description.\n" +
  "Project name: {{projectName}}\n" +
  "Project description: {{projectDescription}}\n" +
  "Write example answers for five guided questions " +
  `(${ONBOARDING_QUESTION_IDS.join(", ")}), 3 to 5 options each, all customized to this ` +
  "specific project.\n" +
  "\n" +
  "CRITICAL RULES:\n" +
  "- Every option must be a complete, concrete, immediately understandable sentence, written " +
  "as if the product already exists. Invent plausible, specific details (a concrete feature, " +
  "a concrete audience, a concrete mechanism) even if the name/description are thin -- never " +
  "ask the user a question and never leave a detail as a placeholder.\n" +
  "- NEVER use placeholder or template syntax: no square brackets [ ], no curly braces { }, " +
  "no angle brackets < >, no 'X', 'Y', or similar variable stand-ins.\n" +
  "- NEVER start an option with a generic category noun like 'Process', 'Workflow', 'Feature', " +
  "'System', or 'Platform' used as a label -- write the actual idea, not a category name for it.\n" +
  "- Avoid generic startup buzzwords ('customer acquisition strategy', 'digital transformation', " +
  "'AI-powered platform', 'operational efficiency') unless the project genuinely requires that " +
  "exact term -- prefer plain, concrete language over abstract business terminology.\n" +
  "- Do not write questions, prompts, or instructions to the user -- only real example answers.\n" +
  "\n" +
  "Good examples (for a project named 'Restaurant Reservation Assistant'): " +
  '"Automatically reminds customers about upcoming reservations.", ' +
  '"Lets restaurant staff confirm bookings with one tap.", ' +
  '"Helps customers quickly find available tables based on party size and preferred time."\n' +
  "Bad examples (never write like this): " +
  '"[Feature] reminder system", "Customer acquisition strategy", "Define target users", ' +
  '"Business workflow", "AI-powered platform"\n' +
  "\n" +
  "Respond only in {{language}}. Respond with this exact JSON shape, and nothing else: " +
  '{"presets": [{"questionId": string, "options": string[]}, ...one entry per question, ' +
  "in the order listed above]}.";
