// Generic implementation of the Interaction Lifecycle from
// sdd/ai/04_ai_interaction.md (#interaction-lifecycle) for exactly one AI
// Capability invocation at a time (Governing Rule 3). Capability-agnostic by
// design, per sdd/ai/04_ai_interaction.md's Purpose ("every current and
// future AI Capability instantiates this same lifecycle... not by each
// inventing their own"): useCanvasAssistant and useRiskMemoAssistant are both
// thin wrappers around this hook, parameterized only by their own request
// function and wire-request shape. This hook owns AI interaction state only —
// it never writes to Project data itself; consuming an accepted suggestion
// into the Feature's own data is the Feature's job (03_ownership_model.md).

import { useCallback, useRef, useState } from "react";

export type AiAssistantStatus = "idle" | "loading" | "ready" | "failed";

export type AiAssistantResult<TResponse, TFailureKind> =
  | { ok: true; data: TResponse }
  | { ok: false; failureKind: TFailureKind };

export type AiAssistantRequestFn<TRequest, TResponse, TFailureKind> = (
  request: TRequest,
  signal?: AbortSignal,
) => Promise<AiAssistantResult<TResponse, TFailureKind>>;

// Separates the actual wire request (TRequest, capability-specific) from the
// Manual-first stale-response guard's local-only value, so this hook never
// needs to know TRequest's field names to build or destructure it.
export type AiAssistantInvokeInput<TRequest> = {
  request: TRequest;
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
export type AiAssistantInputBuilder<TRequest> = () => AiAssistantInvokeInput<TRequest>;

type SuggestionShape = { suggestionText: string; rationale?: string };

// TResponse is not part of this result's own shape (suggestionText/rationale
// are already flattened below) — it exists only so callers can express which
// response shape produced this result, matching useAiAssistant's own generic
// signature below.
export type UseAiAssistantResult<TRequest, _TResponse extends SuggestionShape, TFailureKind> = {
  status: AiAssistantStatus;
  suggestionText?: string;
  rationale?: string;
  failureKind?: TFailureKind;
  // The only entry point into Requesting — nothing else in this hook can start a
  // request (Governing Rule 1, sdd/ai/04_ai_interaction.md).
  invoke: (buildInput: AiAssistantInputBuilder<TRequest>, getCurrentFieldValue: () => string) => void;
  regenerate: () => void;
  retry: () => void;
  reject: () => void;
  reset: () => void;
};

export function useAiAssistant<TRequest, TResponse extends SuggestionShape, TFailureKind>(
  requestFn: AiAssistantRequestFn<TRequest, TResponse, TFailureKind>,
  // Per sdd/ai/05_ai_feedback_and_error_experience.md's Failure Taxonomy,
  // "generic" is the capability-agnostic bucket every capability's own
  // failure-kind union already includes — passed explicitly rather than a
  // hardcoded string cast, so this hook stays genuinely type-safe over
  // whatever TFailureKind union a given capability defines.
  genericFailureKind: TFailureKind,
): UseAiAssistantResult<TRequest, TResponse, TFailureKind> {
  const [status, setStatus] = useState<AiAssistantStatus>("idle");
  const [suggestionText, setSuggestionText] = useState<string | undefined>(undefined);
  const [rationale, setRationale] = useState<string | undefined>(undefined);
  const [failureKind, setFailureKind] = useState<TFailureKind | undefined>(undefined);

  const lastBuildInputRef = useRef<AiAssistantInputBuilder<TRequest> | null>(null);
  const getCurrentFieldValueRef = useRef<() => string>(() => "");
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    (buildInput: AiAssistantInputBuilder<TRequest>, getCurrentFieldValue: () => string) => {
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

      requestFn(input.request, controller.signal)
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
          setFailureKind(genericFailureKind);
          setStatus("failed");
        });
    },
    [status, requestFn, genericFailureKind],
  );

  const invoke = useCallback(
    (buildInput: AiAssistantInputBuilder<TRequest>, getCurrentFieldValue: () => string) =>
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
