// Shared Context Selection for both of the Project Summary Synthesis
// Assistant's Operations (initial_generation, sync) — per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md's Request
// Contract, both read the identical Canvas + MVP (scope + features) +
// Validation context. Kept as one function so SummaryPage's automatic
// trigger and SyncSummaryDialog's manual trigger never duplicate this
// Context Selection logic (sdd/ai/03_ownership_model.md's Feature-owned
// "Context selection" row).

import type { Project } from "../../domain/types";
import type { Language } from "../../localization/types";
import {
  buildFeaturePlanContext,
  buildMvpScopeContext,
  buildValidationContext,
  buildWorkspaceSnapshot,
} from "../../workspace/contextBuilder";
import type { ProjectSummaryAssistantInvokeInput } from "../../ai/useProjectSummaryAssistant";
import type { ProjectSummaryAssistantOperation } from "../../ai/types";

export function buildProjectSummaryRequest(
  project: Project,
  language: Language,
  operation: ProjectSummaryAssistantOperation,
): ProjectSummaryAssistantInvokeInput {
  return {
    operation,
    canvasContext: buildWorkspaceSnapshot(project),
    mvpContext: [...buildMvpScopeContext(project), ...buildFeaturePlanContext(project)],
    validationContext: buildValidationContext(project),
    language,
  };
}
