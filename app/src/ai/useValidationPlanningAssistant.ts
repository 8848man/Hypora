// Validation Planning Assistant's own instantiation of the generic AI
// Interaction Lifecycle (useAiAssistant.ts) — identical pattern to
// useRiskMemoAssistant.ts / useMvpPlanningAssistant.ts.

import { requestValidationPlanningAssistantSuggestion } from "./validationPlanningAssistantClient.ts";
import { useAiAssistant, type UseAiAssistantResult } from "./useAiAssistant.ts";
import type {
  CanvasContextField,
  ValidationPlanningAssistantFailureKind,
  ValidationPlanningAssistantRequest,
} from "./types.ts";

export type { AiAssistantStatus as ValidationPlanningAssistantStatus } from "./useAiAssistant.ts";

export type ValidationPlanningAssistantInvokeInput = {
  canvasContext: CanvasContextField[];
  riskContext: CanvasContextField[];
  mvpContext: CanvasContextField[];
  language: "ko" | "en";
  // See useAiAssistant.ts's Manual-first stale-response guard.
  fieldValueAtInvocation: string;
};

export type ValidationPlanningAssistantInputBuilder = () => ValidationPlanningAssistantInvokeInput;

export type UseValidationPlanningAssistantResult = Omit<
  UseAiAssistantResult<
    ValidationPlanningAssistantRequest,
    { suggestionText: string; rationale?: string },
    ValidationPlanningAssistantFailureKind
  >,
  "invoke"
> & {
  invoke: (buildInput: ValidationPlanningAssistantInputBuilder, getCurrentFieldValue: () => string) => void;
};

export function useValidationPlanningAssistant(): UseValidationPlanningAssistantResult {
  const assistant = useAiAssistant(requestValidationPlanningAssistantSuggestion, "generic" as const);

  return {
    ...assistant,
    invoke: (buildInput: ValidationPlanningAssistantInputBuilder, getCurrentFieldValue: () => string) =>
      assistant.invoke(() => {
        const { fieldValueAtInvocation, ...rest } = buildInput();
        return { request: { operation: "suggestion", ...rest }, fieldValueAtInvocation };
      }, getCurrentFieldValue),
  };
}
