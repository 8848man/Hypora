// Implements sdd/workspace/02_data_and_state.md#summary-lifecycle and
// sdd/workspace/features/05_project_summary.md#summary-lifecycle exactly:
// the persisted Summary's own state transitions, per
// sdd/architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md
// and ADR-0017 (Initial Generation's trigger condition). Deliberately a
// separate file from lifecycle.ts — Summary Lifecycle is Feature-local state,
// orthogonal to the Business Idea Lifecycle that file implements, exactly as
// ADR-0016 states.

import type { Project } from "./types";

// ADR-0017 Decision 3: Initial Generation fires exactly once per Project, the
// first time the domain lifecycle stage reaches Validated while Summary is
// still NotGenerated. Reuses the already-computed `stage` rather than a second,
// parallel "are inputs ready" computation.
export function shouldTriggerInitialGeneration(project: Project): boolean {
  return project.stage === "validated" && project.summary.status === "notGenerated";
}

// Only these fields participate in OutOfSync detection, per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md's Read Context
// (Canvas + MVP Scope/Features + Validation Checklist) — Risk Memo and
// Project-identity fields are deliberately excluded, since the synthesis
// capability never reads them.
function summarySourceSlice(project: Project) {
  return {
    canvas: project.canvas,
    mvpScope: project.mvpScope,
    features: project.features,
    validationItems: project.validationItems,
  };
}

// ADR-0016 Decision 3: any Saved change to Canvas, MVP Scope, the Feature
// list, or the Validation Checklist, while Summary is Generated, transitions
// it to OutOfSync. Never mutates the persisted summary text itself, and never
// triggers regeneration. A no-op unless Summary is currently Generated (per
// the Lifecycle diagram — NotGenerated/Generating/OutOfSync are not affected
// by this transition).
export function withSummaryOutOfSyncIfChanged(prev: Project, next: Project): Project {
  if (next.summary.status !== "generated") return next;
  const changed = JSON.stringify(summarySourceSlice(prev)) !== JSON.stringify(summarySourceSlice(next));
  if (!changed) return next;
  return { ...next, summary: { ...next.summary, status: "outOfSync" } };
}
