// Onboarding Preset Assistant Request/Response Contract — owned by this
// Capability, per sdd/ai/capabilities/07_onboarding_preset_assistant.md.
// Contract Version 2.0, Stable, per ADR-0021 (1.0's Sufficiency/Thinking-
// Prompts discriminated union was removed entirely; see that capability
// spec's Contract Version History).

export const ONBOARDING_QUESTION_IDS = [
  "business_idea",
  "problem_definition",
  "target_customer",
  "solution_definition",
  "value_proposition",
] as const;

export type OnboardingQuestionId = (typeof ONBOARDING_QUESTION_IDS)[number];

export type OnboardingPresetAssistantRequest = {
  projectName: string;
  // Absent and empty-string are treated identically ("no Description was
  // given") -- see the capability spec's Request Contract Validation rules.
  projectDescription?: string;
  language: "ko" | "en";
};

export type QuestionPresetSet = {
  questionId: OnboardingQuestionId;
  options: string[];
};

// Unconditionally a full five-question batch, per ADR-0021 -- no
// sufficiency discriminant, no alternate content type. A thin Name/
// Description is handled by the prompt instructing the model to invent
// plausible, concrete specifics, never by returning a different shape.
export type OnboardingPresetAssistantResponse = {
  presets: QuestionPresetSet[];
};
