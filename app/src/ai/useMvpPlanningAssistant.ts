// MVP Planning Assistant's own instantiation of the generic AI Interaction
// Lifecycle (useAiAssistant.ts) — identical pattern to useRiskMemoAssistant.ts.

import { requestMvpPlanningAssistantSuggestion } from "./mvpPlanningAssistantClient.ts";
import { useAiAssistant, type UseAiAssistantResult } from "./useAiAssistant.ts";
import type { CanvasContextField, MvpPlanningAssistantFailureKind, MvpPlanningAssistantRequest } from "./types.ts";

export type { AiAssistantStatus as MvpPlanningAssistantStatus } from "./useAiAssistant.ts";

export type MvpPlanningAssistantInvokeInput = {
  canvasContext: CanvasContextField[];
  riskContext: CanvasContextField[];
  language: "ko" | "en";
  // See useAiAssistant.ts's Manual-first stale-response guard.
  fieldValueAtInvocation: string;
};

export type MvpPlanningAssistantInputBuilder = () => MvpPlanningAssistantInvokeInput;

export type UseMvpPlanningAssistantResult = Omit<
  UseAiAssistantResult<MvpPlanningAssistantRequest, { suggestionText: string; rationale?: string }, MvpPlanningAssistantFailureKind>,
  "invoke" | "data"
> & {
  suggestionText?: string;
  rationale?: string;
  invoke: (buildInput: MvpPlanningAssistantInputBuilder, getCurrentFieldValue: () => string) => void;
};

export function useMvpPlanningAssistant(): UseMvpPlanningAssistantResult {
  const assistant = useAiAssistant(requestMvpPlanningAssistantSuggestion, "generic" as const);

  return {
    ...assistant,
    // See useCanvasAssistant.ts's identical comment on this re-derivation.
    suggestionText: assistant.data?.suggestionText,
    rationale: assistant.data?.rationale,
    invoke: (buildInput: MvpPlanningAssistantInputBuilder, getCurrentFieldValue: () => string) =>
      assistant.invoke(() => {
        const { fieldValueAtInvocation, ...rest } = buildInput();
        return { request: { operation: "suggestion", ...rest }, fieldValueAtInvocation };
      }, getCurrentFieldValue),
  };
}
