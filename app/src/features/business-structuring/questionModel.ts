// Implements sdd/workspace/features/02_1_question_model.md — the Question domain model and
// Preset Strategy. Framework-independent: no React import here, per that document's instruction.
//
// Per the Question Model's Localization section, this file owns content IDENTITY only
// (questionId, relatedCanvasField, localizationKey, validation, ordering). It never contains
// display text — Purpose/title text and preset options are PRESENTATION CONTENT, resolved via
// localizationKey through the Localization Layer (see src/localization/), not stored here.

import type { Canvas, Project } from "../../domain/types";
import type { Language, Resources } from "../../localization";
import { en } from "../../localization/resources/en";
import { ko } from "../../localization/resources/ko";

export type CanvasFieldKey = keyof Canvas;

export interface Question {
  questionId: string;
  relatedCanvasField: CanvasFieldKey;
  localizationKey: keyof Resources["question"];
  validation: "non-empty";
  ordering: number;
}

/**
 * The V1 Question Set — one question per Canvas field, in the fixed canonical order
 * (per sdd/context/03_personas_and_journey.md's Core User Journey). Identity only; do not add
 * display text here — see resources/ko.ts and resources/en.ts for the Purpose title and presets
 * behind each `localizationKey`.
 */
export const QUESTIONS: Question[] = [
  {
    questionId: "business_idea",
    relatedCanvasField: "businessIdea",
    localizationKey: "businessIdea",
    validation: "non-empty",
    ordering: 0,
  },
  {
    questionId: "problem_definition",
    relatedCanvasField: "problem",
    localizationKey: "problem",
    validation: "non-empty",
    ordering: 1,
  },
  {
    questionId: "target_customer",
    relatedCanvasField: "targetCustomer",
    localizationKey: "targetCustomer",
    validation: "non-empty",
    ordering: 2,
  },
  {
    questionId: "solution_definition",
    relatedCanvasField: "solution",
    localizationKey: "solution",
    validation: "non-empty",
    ordering: 3,
  },
  {
    questionId: "value_proposition",
    relatedCanvasField: "valueProposition",
    localizationKey: "valueProposition",
    validation: "non-empty",
    ordering: 4,
  },
];

/**
 * A Preset Provider resolves 3–5 localized suggested answers for a question. Per the Preset
 * Strategy's localization extension: Input is (questionId, current answers/context, current
 * language); Output is 3–5 preset options already in that language. V1 ships one static,
 * curated provider (Korean-authored, English preserving meaning). V2's AI Canvas Assistant
 * becomes a *different* provider — same signature, same call site — receiving language as an
 * ordinary input parameter and returning presets already localized. Nothing about the guided
 * flow, the Question Model, or the select-or-customize interaction changes when the provider
 * changes.
 */
export type PresetContext = { project: Project; language: Language };
export type PresetProvider = (questionId: string, context: PresetContext) => string[];

const RESOURCES: Record<Language, Resources> = { ko, en };

/** V1's Preset Provider: a fixed, curated list per question per language — no AI, per V1 scope. */
export const v1StaticPresetProvider: PresetProvider = (questionId, { language }) => {
  const question = QUESTIONS.find((q) => q.questionId === questionId);
  if (!question) return [];
  return RESOURCES[language].question[question.localizationKey].presets;
};

/**
 * The Onboarding provider's current status, distinct from whether presets
 * happen to be resolvable — a Feature must be able to tell "generation is
 * pending" apart from "no AI metadata exists" (a pre-AI-era Project) before
 * ever calling resolvePresets(), since both cases read `onboardingPresets`
 * as `undefined`/absent otherwise. `"none"` means this Project was created
 * before Onboarding Preset Assistant existed, or otherwise never had a
 * generation request registered for it — existing-Project compatibility
 * relies on this being a distinct outcome from `"generating"`, never
 * conflated with it.
 */
export type OnboardingUiStatus = "generating" | "ready" | "fallback" | "none";

export function onboardingStatus(project: Project): OnboardingUiStatus {
  return project.onboardingPresets?.status ?? "none";
}

/**
 * The Onboarding provider — third Preset Provider, per
 * sdd/workspace/features/02_1_question_model.md#preset-strategy's three-
 * provider table. Reads Onboarding Preset Assistant's output (per
 * ADR-0019, simplified by ADR-0021), persisted on the Project at creation
 * time; falls back to the static V1 provider whenever that output is
 * absent, `generating`, `fallback`, or simply doesn't cover this question.
 * Per ADR-0021, a question's presets always come from exactly one provider
 * and are always a selectable list — this function never returns an empty
 * array for a question that has a fallback available.
 *
 * Deliberately does NOT special-case `generating` — this function only
 * ever answers "what should a question's presets be if shown right now,"
 * never "should presets be shown at all." A consumer must check
 * onboardingStatus() first (see BusinessStructuringPage) and render its own
 * loading state instead of calling this function while `generating` — the
 * fix for the timing bug this pairing resolves is a rendering decision, not
 * a resolution-priority one.
 */
export const resolvePresets: PresetProvider = (questionId, context) => {
  const onboarding = context.project.onboardingPresets;
  if (onboarding?.status === "ready") {
    const tailored = onboarding.presets?.[questionId];
    if (tailored) return tailored;
  }
  return v1StaticPresetProvider(questionId, context);
};

/**
 * Resume rule (sdd/workspace/02_data_and_state.md): derived from Canvas field completeness,
 * never a separately persisted pointer. Returns the index of the first unanswered question,
 * or QUESTIONS.length if every question is answered (meaning: show Review).
 */
export function resumeQuestionIndex(canvas: Canvas): number {
  const idx = QUESTIONS.findIndex((q) => canvas[q.relatedCanvasField].trim() === "");
  return idx === -1 ? QUESTIONS.length : idx;
}
