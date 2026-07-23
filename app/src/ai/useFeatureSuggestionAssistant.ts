// Feature Suggestion Assistant's own instantiation of the generic AI
// Interaction Lifecycle (useAiAssistant.ts) — identical pattern to every
// other capability's own hook. Its Response Contract is a structured array
// rather than a scalar suggestion, exposed here as `proposals` rather than
// `suggestionText`/`rationale`, per useAiAssistant.ts's widened `data` field.
//
// Per sdd/ai/capabilities/05_feature_suggestion_assistant.md's Backend /
// Frontend Responsibility Boundary: this hook owns only the AI request and
// response mapping. It never mutates Project data and never records a
// History event — both are the consuming page's own responsibility (see
// MvpPlanningPage.tsx's Accept handler).

import { requestFeatureSuggestionAssistantSuggestion } from "./featureSuggestionAssistantClient.ts";
import { useAiAssistant, type UseAiAssistantResult } from "./useAiAssistant.ts";
import type {
  CanvasContextField,
  FeatureSuggestionAssistantFailureKind,
  FeatureSuggestionAssistantRequest,
  FeatureSuggestionExistingFeature,
  FeatureSuggestionItem,
} from "./types.ts";

export type { AiAssistantStatus as FeatureSuggestionAssistantStatus } from "./useAiAssistant.ts";

export type FeatureSuggestionAssistantInvokeInput = {
  canvasContext: CanvasContextField[];
  mvpScopeContext: CanvasContextField[];
  existingFeatures: FeatureSuggestionExistingFeature[];
  riskContext: CanvasContextField[];
  language: "ko" | "en";
};

export type FeatureSuggestionAssistantInputBuilder = () => FeatureSuggestionAssistantInvokeInput;

export type UseFeatureSuggestionAssistantResult = Omit<
  UseAiAssistantResult<FeatureSuggestionAssistantRequest, FeatureSuggestionItem[], FeatureSuggestionAssistantFailureKind>,
  "invoke" | "data"
> & {
  proposals?: FeatureSuggestionItem[];
  invoke: (buildInput: FeatureSuggestionAssistantInputBuilder) => void;
};

export function useFeatureSuggestionAssistant(): UseFeatureSuggestionAssistantResult {
  const assistant = useAiAssistant(
    requestFeatureSuggestionAssistantSuggestion,
    "generic" as const,
    "feature-suggestion-assistant",
  );

  return {
    ...assistant,
    proposals: assistant.data,
    invoke: (buildInput: FeatureSuggestionAssistantInputBuilder) =>
      assistant.invoke(
        () => ({
          request: { operation: "suggestion", ...buildInput() },
          // This capability proposes new items rather than suggesting a
          // replacement for one existing field, so there is no single "current
          // field value" for the Manual-first stale-response guard to compare
          // against (sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability).
          // A constant, always-equal sentinel keeps the guard structurally
          // satisfied — it never spuriously discards an arriving batch —
          // without changing useAiAssistant's own stale-response mechanism.
          fieldValueAtInvocation: "",
        }),
        () => "",
      ),
  };
}
