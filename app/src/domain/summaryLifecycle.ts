// Implements sdd/workspace/02_data_and_state.md#summary-lifecycle and
// sdd/workspace/features/05_project_summary.md#summary-lifecycle exactly:
// the persisted Summary's own state transitions, per
// sdd/architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md,
// ADR-0017 (Initial Generation's Automatic Invocation exception), and
// ADR-0018 (narrows the trigger condition and OutOfSync source to Business
// Canvas only). Deliberately a separate file from lifecycle.ts — Summary
// Lifecycle is Feature-local state, orthogonal to the Business Idea
// Lifecycle that file implements, exactly as ADR-0016 states.

import type { Project } from "./types";

// ADR-0018 Decision 3: Initial Generation fires exactly once per Project, the
// first time the Business Canvas reaches completion — the domain lifecycle's
// own Structuring -> Scoped guard (all five Canvas fields non-empty) — while
// Summary is still NotGenerated. Reuses the already-computed `stage` rather
// than a second, parallel "is Canvas complete" computation: any stage beyond
// Structuring/Captured means the Canvas-complete guard has already fired,
// per the Stickiness Rule (sdd/domain/01_business_idea_lifecycle.md) never
// regressing that fact even if a Canvas field is edited again later.
export function shouldTriggerInitialGeneration(project: Project): boolean {
  const canvasComplete = project.stage !== "captured" && project.stage !== "structuring";
  return canvasComplete && project.summary.status === "notGenerated";
}

// Only Canvas participates in OutOfSync detection, per ADR-0018 and
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md's Read
// Context (Canvas only, Contract Version 2.0) — MVP Scope, the Feature list,
// the Validation Checklist, and Risk Memo are deliberately excluded, since
// the synthesis capability no longer reads them.
function summarySourceSlice(project: Project) {
  return {
    canvas: project.canvas,
  };
}

// ADR-0016 Decision 3, narrowed by ADR-0018: any Saved change to a Canvas
// field, while Summary is Generated, transitions it to OutOfSync. Never
// mutates the persisted summary text itself, and never triggers
// regeneration. A no-op unless Summary is currently Generated (per the
// Lifecycle diagram — NotGenerated/Generating/OutOfSync are not affected by
// this transition).
export function withSummaryOutOfSyncIfChanged(prev: Project, next: Project): Project {
  if (next.summary.status !== "generated") return next;
  const changed = JSON.stringify(summarySourceSlice(prev)) !== JSON.stringify(summarySourceSlice(next));
  if (!changed) return next;
  return { ...next, summary: { ...next.summary, status: "outOfSync" } };
}
