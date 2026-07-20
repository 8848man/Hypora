// Implements sdd/workspace/01_architecture.md#navigation-state-semantics
// (ADR-0022) — the roles/states a Project's navigation surface renders.
// Pure, framework-independent, and derives everything from data
// lifecycle.ts already computes; introduces no new persisted state, per
// ADR-0022 Decisions 2/3/4.

import type { Project } from "./types";
import { blockingReason, canEnterValidated, canEnterValidating } from "./lifecycle";

export type RequiredStageId = "canvas" | "mvp" | "validation";

export type NavigationRole = "required" | "optional" | "summary";

// Current and Completed are independent axes, never collapsed into one
// enum -- a required stage can be both at once (a user revisiting an
// already-completed stage), per ADR-0022 Decision 4. `next` is likewise
// independent, but is deliberately suppressed when it coincides with the
// current route (Decision 5) -- see resolveNavigationState below.
export interface NavigationItemState {
  completed: boolean;
  next: boolean;
}

const REQUIRED_STAGES: RequiredStageId[] = ["canvas", "mvp", "validation"];

/**
 * Which required stage, if any, is completed -- derived entirely from
 * existing domain booleans/stage checks (per ADR-0022 Decision 3), never a
 * new field. Canvas completion reuses the same signal
 * WorkspaceProjectLayout's own onboarding-emphasis check already used.
 */
export function isStageCompleted(project: Project, stage: RequiredStageId): boolean {
  switch (stage) {
    case "canvas":
      return project.stage !== "captured" && project.stage !== "structuring";
    case "mvp":
      return canEnterValidating(project);
    case "validation":
      return canEnterValidated(project);
  }
}

/**
 * Which single required stage, if any, blockingReason() currently names as
 * next -- per ADR-0022 Decision 2's mapping table. "confirm" (Validated,
 * awaiting the user's own Build-Ready confirmation) and null (nothing
 * blocking, or already Build-Ready/Archived) both mean no required stage
 * is "next" from the navigation's point of view -- "confirm" belongs to
 * Project Summary, never a sibling nav item.
 */
export function recommendedNextStage(project: Project): RequiredStageId | null {
  const reason = blockingReason(project);
  switch (reason) {
    case "canvas":
      return "canvas";
    case "scope":
    case "feature-planning":
      return "mvp";
    case "validation-empty":
    case "validation-open":
      return "validation";
    default:
      return null;
  }
}

/**
 * The full per-stage state a required item's navigation treatment reads,
 * given which stage is the current route (or null if the current route
 * isn't one of the three required stages). `next` is deliberately false
 * whenever `currentStage === stage` -- redundant with current-page
 * emphasis, per ADR-0022 Decision 5 -- even though recommendedNextStage()
 * itself would still name that stage.
 */
export function resolveNavigationState(
  project: Project,
  stage: RequiredStageId,
  currentStage: RequiredStageId | null,
): NavigationItemState {
  const completed = isStageCompleted(project, stage);
  const recommended = recommendedNextStage(project) === stage;
  const isCurrent = currentStage === stage;
  return { completed, next: recommended && !isCurrent };
}

export { REQUIRED_STAGES };
