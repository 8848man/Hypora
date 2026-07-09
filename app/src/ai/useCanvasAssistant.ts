// Implements the Interaction Lifecycle from sdd/ai/04_ai_interaction.md
// (#interaction-lifecycle) for exactly one AI Capability invocation at a time
// (Governing Rule 3). This hook owns AI interaction state only — it never writes
// to Canvas/Project data itself; consuming an accepted suggestion into the
// Feature's own data is the Feature's job (03_ownership_model.md: "Consuming the
// Capability Response into a Feature-specific view model — owned by the Feature").

import { useCallback, useRef, useState } from "react";
import { requestCanvasAssistantSuggestion } from "./canvasAssistantClient.ts";
import type { CanvasAssistantFailureKind, CanvasAssistantOperation, CanvasContextField } from "./types.ts";

export type CanvasAssistantStatus = "idle" | "loading" | "ready" | "failed";

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
// invocation AND again at every Regenerate/Retry, so each of those — each a "new,
// independent invocation" per 04_ai_interaction.md's Suggestion Lifecycle — reads
// the truly current project state (Progressive Context Accumulation), not a
// snapshot frozen at the first click.
export type CanvasAssistantInputBuilder = () => CanvasAssistantInvokeInput;

export type UseCanvasAssistantResult = {
  status: CanvasAssistantStatus;
  suggestionText?: string;
  rationale?: string;
  failureKind?: CanvasAssistantFailureKind;
  // The only entry point into Requesting — nothing else in this hook can start a
  // request (Governing Rule 1, sdd/ai/04_ai_interaction.md).
  invoke: (buildInput: CanvasAssistantInputBuilder, getCurrentFieldValue: () => string) => void;
  regenerate: () => void;
  retry: () => void;
  reject: () => void;
  reset: () => void;
};

export function useCanvasAssistant(): UseCanvasAssistantResult {
  const [status, setStatus] = useState<CanvasAssistantStatus>("idle");
  const [suggestionText, setSuggestionText] = useState<string | undefined>(undefined);
  const [rationale, setRationale] = useState<string | undefined>(undefined);
  const [failureKind, setFailureKind] = useState<CanvasAssistantFailureKind | undefined>(undefined);

  const lastBuildInputRef = useRef<CanvasAssistantInputBuilder | null>(null);
  const getCurrentFieldValueRef = useRef<() => string>(() => "");
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    (buildInput: CanvasAssistantInputBuilder, getCurrentFieldValue: () => string) => {
      // Duplicate-request prevention (sdd/ai/05#duplicate-request-handling): a
      // request already in flight is never joined by a second concurrent one.
      if (status === "loading") return;

      lastBuildInputRef.current = buildInput;
      getCurrentFieldValueRef.current = getCurrentFieldValue;

      // Built fresh right now — this is what makes Progressive Context Accumulation
      // hold for Regenerate/Retry, not only the first invocation.
      const input = buildInput();

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setFailureKind(undefined);

      requestCanvasAssistantSuggestion(
        {
          operation: input.operation,
          canvasContext: input.canvasContext,
          currentField: input.currentField,
          priorAnswers: input.priorAnswers,
          language: input.language,
          projectName: input.projectName,
        },
        controller.signal,
      )
        .then((result) => {
          if (controller.signal.aborted) return;

          // Manual-first / stale-response guard: if the user has edited the
          // target field since this invocation started, the arriving result is
          // discarded outright — never applied over live user input.
          if (getCurrentFieldValue() !== input.fieldValueAtInvocation) {
            setStatus("idle");
            return;
          }

          if (result.ok) {
            setSuggestionText(result.data.suggestionText);
            setRationale(result.data.rationale);
            setStatus("ready");
          } else {
            setFailureKind(result.failureKind);
            setStatus("failed");
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setFailureKind("generic");
          setStatus("failed");
        });
    },
    [status],
  );

  const invoke = useCallback(
    (buildInput: CanvasAssistantInputBuilder, getCurrentFieldValue: () => string) =>
      run(buildInput, getCurrentFieldValue),
    [run],
  );

  const regenerate = useCallback(() => {
    if (!lastBuildInputRef.current) return;
    run(lastBuildInputRef.current, getCurrentFieldValueRef.current);
  }, [run]);

  const retry = useCallback(() => {
    if (!lastBuildInputRef.current) return;
    run(lastBuildInputRef.current, getCurrentFieldValueRef.current);
  }, [run]);

  const reject = useCallback(() => {
    setStatus("idle");
    setSuggestionText(undefined);
    setRationale(undefined);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setSuggestionText(undefined);
    setRationale(undefined);
    setFailureKind(undefined);
    lastBuildInputRef.current = null;
  }, []);

  return { status, suggestionText, rationale, failureKind, invoke, regenerate, retry, reject, reset };
}
