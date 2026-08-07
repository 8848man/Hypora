// Risk Memo Assistant's own instantiation of the generic AI Interaction
// Lifecycle (useAiAssistant.ts) — identical pattern to useCanvasAssistant.ts,
// confirming sdd/ai/04_ai_interaction.md's lifecycle genuinely generalizes
// across capabilities rather than being Canvas-Assistant-specific in practice.

import { requestRiskMemoAssistantSuggestion } from "./riskMemoAssistantClient.ts";
import { useAiAssistant, type UseAiAssistantResult } from "./useAiAssistant.ts";
import type {
  CanvasContextField,
  RiskMemoAssistantFailureKind,
  RiskMemoAssistantRequest,
  RiskMemoSiblingField,
  RiskMemoTargetField,
} from "./types.ts";

export type { AiAssistantStatus as RiskMemoAssistantStatus } from "./useAiAssistant.ts";

export type RiskMemoAssistantInvokeInput = {
  canvasContext: CanvasContextField[];
  targetField: RiskMemoTargetField;
  siblingFields?: RiskMemoSiblingField[];
  language: "ko" | "en";
  // See useAiAssistant.ts's Manual-first stale-response guard.
  fieldValueAtInvocation: string;
};

export type RiskMemoAssistantInputBuilder = () => RiskMemoAssistantInvokeInput;

export type UseRiskMemoAssistantResult = Omit<
  UseAiAssistantResult<RiskMemoAssistantRequest, { suggestionText: string; rationale?: string }, RiskMemoAssistantFailureKind>,
  "invoke" | "data"
> & {
  suggestionText?: string;
  rationale?: string;
  invoke: (buildInput: RiskMemoAssistantInputBuilder, getCurrentFieldValue: () => string) => void;
};

export function useRiskMemoAssistant(): UseRiskMemoAssistantResult {
  const assistant = useAiAssistant(requestRiskMemoAssistantSuggestion, "generic" as const, "risk-memo-assistant");

  return {
    ...assistant,
    // See useCanvasAssistant.ts's identical comment on this re-derivation.
    suggestionText: assistant.data?.suggestionText,
    rationale: assistant.data?.rationale,
    invoke: (buildInput: RiskMemoAssistantInputBuilder, getCurrentFieldValue: () => string) =>
      assistant.invoke(() => {
        const { fieldValueAtInvocation, ...rest } = buildInput();
        return { request: { operation: "suggestion", ...rest }, fieldValueAtInvocation };
      }, getCurrentFieldValue),
  };
}
