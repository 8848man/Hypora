// Onboarding Preset Assistant — the seventh real AI Capability
// (sdd/ai/capabilities/07_onboarding_preset_assistant.md). Contract Version
// 2.0, Stable, per ADR-0021 (1.0's Sufficiency/Thinking-Prompts
// discriminated union removed entirely -- see that capability's Contract
// Version History). Distinct from Canvas Assistant per the Capability
// Promotion Rules -- see the capability spec's own framing note.
//
// No responseSchema hint is passed to AiApplicationService.invoke() -- this
// capability's Response Contract contains an array (presets:
// QuestionPresetSet[]), which the flat-object structured-output hint
// cannot express. Same minimal-change resolution Feature Suggestion
// Assistant (05) already established -- see that capability's own header
// comment. The prompt alone instructs the model to return the required
// JSON shape; assertShape below validates both structural correctness and
// Content Quality (ADR-0021 Decision 3) before a Response is accepted.

import type { AiApplicationService } from "../../AiApplicationService.js";
import { createTemplate } from "../../prompt/PromptRenderer.js";
import { parseJson } from "../../response/ResponseParser.js";
import { assertNonEmptyText, assertShape } from "../../response/ResponseValidator.js";
import { ONBOARDING_PRESET_TEMPLATE } from "./prompts.js";
import { ONBOARDING_QUESTION_IDS } from "./types.js";
import type {
  OnboardingPresetAssistantRequest,
  OnboardingPresetAssistantResponse,
  OnboardingQuestionId,
  QuestionPresetSet,
} from "./types.js";

export const ONBOARDING_PRESET_ASSISTANT = {
  capabilityId: "onboarding-preset-assistant",
  contractVersion: "2.0",
};

const QUESTION_ID_SET: ReadonlySet<string> = new Set(ONBOARDING_QUESTION_IDS);

const MIN_VALID_OPTIONS_PER_QUESTION = 3;

// Content Quality Validation (ADR-0021 Decision 3): rejects placeholder/
// template syntax and generic category-naming openers. An option failing
// this check is dropped, never repaired or reworded -- there is no second
// Provider call to fix rejected content (see the capability spec's
// Response Contract).
const PLACEHOLDER_PATTERN = /[[\]{}<>]/;
const GENERIC_OPENER_PATTERN =
  /^(the\s+)?(process|workflow|feature|system|platform|프로세스|워크플로우|기능|시스템|플랫폼)\b/i;

function isValidOptionContent(option: string): boolean {
  const trimmed = option.trim();
  if (trimmed.length === 0) return false;
  if (PLACEHOLDER_PATTERN.test(trimmed)) return false;
  if (GENERIC_OPENER_PATTERN.test(trimmed)) return false;
  return true;
}

function isRawQuestionPresetSetShape(
  candidate: unknown,
): candidate is { questionId: unknown; options: unknown } {
  return typeof candidate === "object" && candidate !== null && "questionId" in candidate && "options" in candidate;
}

// Structural validation (shape/count) + Content Quality Validation
// (filtering) in one pass, per question -- returns null if the question
// fails structural checks or drops below MIN_VALID_OPTIONS_PER_QUESTION
// after filtering, which the caller treats as the whole Response being
// invalid (ADR-0021's all-or-nothing rule, unchanged from 1.0).
function toValidatedPresetSet(candidate: unknown): QuestionPresetSet | null {
  if (!isRawQuestionPresetSetShape(candidate)) return null;
  const { questionId, options } = candidate;
  if (typeof questionId !== "string" || !QUESTION_ID_SET.has(questionId)) return null;
  if (!Array.isArray(options)) return null;

  const validOptions = options.filter((o): o is string => typeof o === "string" && isValidOptionContent(o));
  if (validOptions.length < MIN_VALID_OPTIONS_PER_QUESTION) return null;

  return { questionId: questionId as OnboardingQuestionId, options: validOptions.slice(0, 5) };
}

function isOnboardingPresetAssistantResponseShape(
  candidate: unknown,
): candidate is OnboardingPresetAssistantResponse {
  if (typeof candidate !== "object" || candidate === null) return false;
  const item = candidate as Record<string, unknown>;
  if (!Array.isArray(item.presets) || item.presets.length !== ONBOARDING_QUESTION_IDS.length) return false;

  const validated: QuestionPresetSet[] = [];
  for (const raw of item.presets) {
    const set = toValidatedPresetSet(raw);
    if (!set) return false;
    validated.push(set);
  }

  const presetQuestionIds = new Set(validated.map((p) => p.questionId));
  if (!ONBOARDING_QUESTION_IDS.every((id) => presetQuestionIds.has(id as OnboardingQuestionId))) return false;

  // Mutates the candidate in place with the filtered option lists so the
  // return value below reflects post-validation content, not the raw
  // (possibly partially-rejected) options the Provider returned.
  item.presets = validated;
  return true;
}

export class OnboardingPresetAssistantCapability {
  private readonly service: AiApplicationService;

  constructor(service: AiApplicationService) {
    this.service = service;
  }

  async invoke(request: OnboardingPresetAssistantRequest): Promise<OnboardingPresetAssistantResponse> {
    const prompt = createTemplate(ONBOARDING_PRESET_TEMPLATE).render({
      projectName: request.projectName,
      // Absent and empty-string both render as "(none given)" -- the
      // capability spec's Request Contract treats them identically.
      projectDescription: request.projectDescription?.trim() ? request.projectDescription : "(none given)",
      language: request.language,
    });

    const providerResponse = await this.service.invoke(
      ONBOARDING_PRESET_ASSISTANT.capabilityId,
      ONBOARDING_PRESET_ASSISTANT.contractVersion,
      prompt,
    );

    assertNonEmptyText(providerResponse.text);

    const parsed = parseJson(providerResponse.text);

    return assertShape(
      parsed,
      isOnboardingPresetAssistantResponseShape,
      "Onboarding Preset Assistant response did not match the {presets:[{questionId, options[3-5]}, ...]} " +
        "shape, or too many options failed Content Quality Validation",
    );
  }
}
