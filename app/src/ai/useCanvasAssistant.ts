// Canvas Assistant's own instantiation of the generic AI Interaction Lifecycle
// (useAiAssistant.ts) — capability-specific request/response typing and the
// existing flat CanvasAssistantInvokeInput shape only; the lifecycle logic
// itself lives in useAiAssistant.ts, per sdd/ai/04_ai_interaction.md's
// Purpose ("every current and future AI Capability instantiates this same
// lifecycle... not by each inventing their own").

import { requestCanvasAssistantSuggestion } from "./canvasAssistantClient.ts";
import { useAiAssistant, type UseAiAssistantResult } from "./useAiAssistant.ts";
import type { CanvasAssistantFailureKind, CanvasAssistantOperation, CanvasAssistantRequest, CanvasContextField } from "./types.ts";

export type { AiAssistantStatus as CanvasAssistantStatus } from "./useAiAssistant.ts";

export type CanvasAssistantInvokeInput = {
  operation: CanvasAssistantOperation;
  canvasContext: CanvasContextField[];
  currentField?: string;
  priorAnswers?: CanvasContextField[];
  language: "ko" | "en";
  projectName?: string;
  // The targeted field's live value at the moment of invocation — used only to
  // detect a manual edit made while the request is in flight (Manual-first:
  // sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability).
  fieldValueAtInvocation: string;
};

// A builder, not a static object: called fresh at the moment of the initial
// invocation AND again at every Regenerate/Retry — see useAiAssistant.ts.
export type CanvasAssistantInputBuilder = () => CanvasAssistantInvokeInput;

export type UseCanvasAssistantResult = Omit<
  UseAiAssistantResult<CanvasAssistantRequest, { suggestionText: string; rationale?: string }, CanvasAssistantFailureKind>,
  "invoke"
> & {
  invoke: (buildInput: CanvasAssistantInputBuilder, getCurrentFieldValue: () => string) => void;
};

export function useCanvasAssistant(): UseCanvasAssistantResult {
  const assistant = useAiAssistant(requestCanvasAssistantSuggestion, "generic" as const);

  return {
    ...assistant,
    invoke: (buildInput: CanvasAssistantInputBuilder, getCurrentFieldValue: () => string) =>
      assistant.invoke(() => {
        const { fieldValueAtInvocation, ...request } = buildInput();
        return { request, fieldValueAtInvocation };
      }, getCurrentFieldValue),
  };
}
