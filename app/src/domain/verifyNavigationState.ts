// Standalone verification for Navigation State logic (ADR-0022),
// independent of any HTTP/Provider/React concern. Run via:
//   npm run verify:domain-navigation
// Lives under src/ (not server/scripts/), mirroring
// verifySummaryLifecycle.ts's own placement and its reasoning.

import { createEmptyProject } from "./types.js";
import type { Project, ValidationItem } from "./types.js";
import { isStageCompleted, recommendedNextStage, resolveNavigationState } from "./navigationState.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Navigation State verification: FAIL - ${message}`);
  }
}

function withCompleteCanvas(project: Project): Project {
  return {
    ...project,
    stage: "scoped",
    canvas: {
      businessIdea: "x",
      problem: "x",
      targetCustomer: "x",
      solution: "x",
      valueProposition: "x",
    },
  };
}

function main(): void {
  // Scenario 1 -- new project: nothing completed, "canvas" is next.
  const fresh = createEmptyProject("proj_1", "Fresh Project");
  assert(!isStageCompleted(fresh, "canvas"), "fresh project: canvas must not be completed");
  assert(!isStageCompleted(fresh, "mvp"), "fresh project: mvp must not be completed");
  assert(!isStageCompleted(fresh, "validation"), "fresh project: validation must not be completed");
  assert(recommendedNextStage(fresh) === "canvas", "fresh project: next recommended must be canvas");
  const s1 = resolveNavigationState(fresh, "canvas", "canvas");
  assert(s1.next === false, "Scenario 1: next must be suppressed when current === recommended (dedup rule)");
  assert(s1.completed === false, "Scenario 1: canvas must not show completed on a fresh project");

  // Scenario 2 -- idea completed, current = mvp ("scope"), next = mvp.
  const ideaDone = withCompleteCanvas(createEmptyProject("proj_2", "Idea Done"));
  assert(isStageCompleted(ideaDone, "canvas"), "Scenario 2: canvas must be completed once all 5 fields are filled");
  assert(recommendedNextStage(ideaDone) === "mvp", "Scenario 2: next recommended must be mvp (blocked on scope)");
  const s2Canvas = resolveNavigationState(ideaDone, "canvas", "mvp");
  assert(s2Canvas.completed === true, "Scenario 2: canvas item must show completed while viewing mvp");
  assert(s2Canvas.next === false, "Scenario 2: canvas item must not show next (it's already completed)");
  const s2Mvp = resolveNavigationState(ideaDone, "mvp", "mvp");
  assert(s2Mvp.next === false, "Scenario 2: mvp is both current and recommended -- next suppressed (dedup rule)");
  assert(s2Mvp.completed === false, "Scenario 2: mvp must not show completed yet");

  // Scenario 3 -- revisiting a completed stage: completed=idea, current=idea, next=mvp.
  // This is the key ADR-0022 Decision 4 case: current and completed together.
  const revisit = withCompleteCanvas(createEmptyProject("proj_3", "Revisit"));
  const s3Canvas = resolveNavigationState(revisit, "canvas", "canvas");
  assert(s3Canvas.completed === true, "Scenario 3: canvas must show completed even while it is the current page");
  assert(s3Canvas.next === false, "Scenario 3: canvas must not also show next (it's completed, not blocking)");
  const s3Mvp = resolveNavigationState(revisit, "mvp", "canvas");
  assert(s3Mvp.next === true, "Scenario 3: mvp must show next while canvas (completed) is current");
  assert(s3Mvp.completed === false, "Scenario 3: mvp must not show completed yet");

  // Scenario 6 -- all required stages completed: no misleading next-step marker.
  const allDone: Project = {
    ...withCompleteCanvas(createEmptyProject("proj_6", "All Done")),
    mvpScopeComplete: true,
    featurePlanningComplete: true,
    stage: "validated",
    validationItems: [
      { id: "v1", assumption: "a", method: "b", successCriterion: "c", status: "validated" } as ValidationItem,
    ],
  };
  assert(isStageCompleted(allDone, "canvas"), "Scenario 6: canvas must be completed");
  assert(isStageCompleted(allDone, "mvp"), "Scenario 6: mvp must be completed");
  assert(isStageCompleted(allDone, "validation"), "Scenario 6: validation must be completed");
  assert(recommendedNextStage(allDone) === null, "Scenario 6: no required stage may be 'next' once all are complete");
  for (const stage of ["canvas", "mvp", "validation"] as const) {
    const state = resolveNavigationState(allDone, stage, "validation");
    assert(state.next === false, `Scenario 6: ${stage} must never show next once every stage is complete`);
  }

  // "confirm" blockingReason (Validated, awaiting Build-Ready) must not name
  // any required nav item as next -- it belongs to Project Summary, not a sibling.
  const validatedNotYetConfirmed: Project = {
    ...withCompleteCanvas(createEmptyProject("proj_confirm", "Awaiting Confirm")),
    mvpScopeComplete: true,
    featurePlanningComplete: true,
    stage: "validated",
    validationItems: [{ id: "v1", assumption: "a", method: "b", successCriterion: "c", status: "validated" } as ValidationItem],
  };
  assert(
    recommendedNextStage(validatedNotYetConfirmed) === null,
    "'confirm' blockingReason must not map to any required nav item",
  );

  // Scenario 7/8 -- legacy/missing-data project: derivation must not throw,
  // and must fail safely to "nothing completed, canvas is next" for a
  // Captured-stage project with no navigation-specific field ever added.
  const legacy = createEmptyProject("proj_legacy", "Legacy Project");
  // Deliberately no onboardingPresets, no summary beyond the default -- this
  // project never knew navigationState.ts existed, and must still resolve.
  assert(recommendedNextStage(legacy) === "canvas", "legacy project must resolve safely, defaulting to canvas as next");
  assert(!isStageCompleted(legacy, "mvp"), "legacy project must not crash resolving mvp completion");

  console.log("Navigation State verification: PASS");
}

main();
