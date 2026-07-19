// Project Summary Synthesis Assistant's own instantiation of the generic AI
// Interaction Lifecycle (useAiAssistant.ts) — capability-specific request/
// response typing only; the lifecycle logic itself lives in useAiAssistant.ts,
// per sdd/ai/04_ai_interaction.md's Purpose.
//
// Unlike every other capability's own wrapper hook, this one has no live
// "targeted field" to protect (Manual-first's overwrite-protection concern —
// sdd/ai/04_ai_interaction.md#manual-first-behavior-and-field-editability —
// does not apply, per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md and ADR-0017
// Decision 5: the target is either an artifact that doesn't yet exist
// [initial_generation] or a dialog-local draft the user hasn't started typing
// into yet [sync]). The stale-response guard is therefore passed a constant
// value that never changes, so it never fires — reusing useAiAssistant's
// generic machinery unchanged rather than forking a second lifecycle
// implementation for this one difference.

import { requestProjectSummaryAssistant } from "./projectSummaryAssistantClient.ts";
import { useAiAssistant, type UseAiAssistantResult } from "./useAiAssistant.ts";
import type {
  ProjectSummaryAssistantFailureKind,
  ProjectSummaryAssistantOperation,
  ProjectSummaryAssistantRequest,
} from "./types.ts";
import type { CanvasContextField } from "../workspace/contextBuilder";

export type { AiAssistantStatus as ProjectSummaryAssistantStatus } from "./useAiAssistant.ts";

export type ProjectSummaryAssistantInvokeInput = {
  operation: ProjectSummaryAssistantOperation;
  canvasContext: CanvasContextField[];
  language: "ko" | "en";
};

// A builder, not a static object — called fresh at the moment of invocation
// (and again at every Retry), consistent with every other capability's own
// Progressive Context Accumulation requirement (sdd/ai/04_ai_interaction.md#conversation-policy).
export type ProjectSummaryAssistantInputBuilder = () => ProjectSummaryAssistantInvokeInput;

export type UseProjectSummaryAssistantResult = Omit<
  UseAiAssistantResult<
    ProjectSummaryAssistantRequest,
    { summaryText: string; rationale?: string },
    ProjectSummaryAssistantFailureKind
  >,
  "invoke" | "data"
> & {
  summaryText?: string;
  rationale?: string;
  invoke: (buildInput: ProjectSummaryAssistantInputBuilder) => void;
};

export function useProjectSummaryAssistant(): UseProjectSummaryAssistantResult {
  const assistant = useAiAssistant(requestProjectSummaryAssistant, "generic" as const);

  return {
    ...assistant,
    summaryText: assistant.data?.summaryText,
    rationale: assistant.data?.rationale,
    invoke: (buildInput: ProjectSummaryAssistantInputBuilder) =>
      assistant.invoke(
        () => ({ request: buildInput(), fieldValueAtInvocation: "" }),
        () => "",
      ),
  };
}
