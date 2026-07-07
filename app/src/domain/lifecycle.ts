// Implements sdd/domain/01_business_idea_lifecycle.md exactly: states, transitions, guards,
// and the Stickiness Rule (stage is sticky/stored, never silently recomputed from current data).

import type { Canvas, LifecycleStage, Project } from "./types";

// Stage display labels are presentation content, not domain identity — they live in
// src/localization/resources/ (t.lifecycleStage), not here, per the same content-identity vs.
// presentation-content separation this project already applies to the Question Model
// (see sdd/workspace/features/02_1_question_model.md#localization). This file stays
// language-independent, exactly as its header states.

function isCanvasComplete(canvas: Canvas): boolean {
  return (
    canvas.businessIdea.trim() !== "" &&
    canvas.problem.trim() !== "" &&
    canvas.targetCustomer.trim() !== "" &&
    canvas.solution.trim() !== "" &&
    canvas.valueProposition.trim() !== ""
  );
}

function hasAnyCanvasContent(canvas: Canvas): boolean {
  return Object.values(canvas).some((v) => v.trim() !== "");
}

/**
 * Called after any Canvas edit. Advances Captured -> Structuring -> Scoped
 * per the domain guards. Never regresses (Stickiness Rule) — if the project
 * has already advanced past Structuring, editing the Canvas again does not
 * move it backward.
 */
export function advanceAfterCanvasEdit(project: Project): LifecycleStage {
  if (project.stage !== "captured" && project.stage !== "structuring") {
    return project.stage; // sticky — already advanced past Canvas authoring
  }
  if (isCanvasComplete(project.canvas)) return "scoped";
  if (hasAnyCanvasContent(project.canvas)) return "structuring";
  return "captured";
}

/** Scoped -> Validating guard: both MVP Scope and Feature Planning explicitly marked complete. */
export function canEnterValidating(project: Project): boolean {
  return project.mvpScopeComplete && project.featurePlanningComplete;
}

export function advanceToValidating(project: Project): LifecycleStage {
  if (project.stage === "scoped" && canEnterValidating(project)) return "validating";
  return project.stage;
}

/** Explicit reopen — the one named backward transition (Validating -> Scoped). */
export function reopenScope(project: Project): LifecycleStage {
  if (project.stage === "validating") return "scoped";
  return project.stage;
}

/** Validating -> Validated guard: every Validation Checklist item explicitly resolved. */
export function canEnterValidated(project: Project): boolean {
  return (
    project.validationItems.length > 0 &&
    project.validationItems.every((i) => i.status !== "open")
  );
}

export function advanceToValidated(project: Project): LifecycleStage {
  if (project.stage === "validating" && canEnterValidated(project)) return "validated";
  return project.stage;
}

/** Validated -> Build-Ready: the sole user-confirmed transition, never automatic. */
export function canConfirmBuildReady(project: Project): boolean {
  return project.stage === "validated";
}

export function confirmBuildReady(project: Project): LifecycleStage {
  if (canConfirmBuildReady(project)) return "build-ready";
  return project.stage;
}

/** Archive is allowed from any non-Archived state; archiving is terminal in V1 (no unarchive). */
export function canArchive(project: Project): boolean {
  return project.stage !== "archived";
}

export function archiveProject(project: Project): LifecycleStage {
  return canArchive(project) ? "archived" : project.stage;
}

/**
 * Names which artifact is currently blocking progress to the next stage — a language-independent
 * code, not display text (per the content-identity/presentation-content separation this project
 * applies consistently — see sdd/workspace/features/02_1_question_model.md#localization). The
 * caller (Project Summary) resolves this code into localized text via the Localization Layer.
 * Returns null once Build-Ready.
 */
export type BlockingReasonCode =
  | "canvas"
  | "scope"
  | "feature-planning"
  | "validation-empty"
  | "validation-open"
  | "confirm";

export function blockingReason(project: Project): BlockingReasonCode | null {
  switch (project.stage) {
    case "captured":
    case "structuring":
      return "canvas";
    case "scoped":
      if (!project.mvpScopeComplete) return "scope";
      if (!project.featurePlanningComplete) return "feature-planning";
      return null;
    case "validating":
      if (project.validationItems.length === 0) return "validation-empty";
      return "validation-open";
    case "validated":
      return "confirm";
    case "build-ready":
    case "archived":
      return null;
  }
}
