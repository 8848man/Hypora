// Workspace Context Builder — sdd/workspace/01_architecture.md#workspace-context-builder.
// Promoted out of Business Structuring's own local module per that section's
// "promote on second need" rule: Risk Memo Assistant is the second consumer
// (sdd/ai/capabilities/02_risk_memo_assistant.md), so this is no longer
// Feature-local. Workspace-owned: this is the single place "how do I read this
// Project's Canvas as Normalized Workspace Context" is implemented, per
// sdd/ai/03_ownership_model.md#context-representation-pipeline.
//
// Built fresh from `project` on every call — never cached, never retaining a
// prior invocation's data. No obsolete values are possible by construction:
// Canvas fields hold only their current value, never a history.

import type { Project } from "../domain/types";
import { QUESTIONS } from "../features/business-structuring/questionModel";

// Normalized Workspace Context's field shape (sdd/ai/03_ownership_model.md#context-representation-pipeline).
// Owned here, not by the AI layer: this is Workspace's own data being
// serialized, per this module's own ownership (sdd/workspace/01_architecture.md#workspace-context-builder).
// src/ai/types.ts imports and re-exports this — the AI layer consumes
// Workspace's shape, never the reverse, per the pipeline's "isolate
// Workspace's own data models from AI contracts" principle.
export type CanvasContextField = {
  field: string;
  value: string;
};

export function buildWorkspaceSnapshot(project: Project): CanvasContextField[] {
  return QUESTIONS.filter((q) => project.canvas[q.relatedCanvasField].trim() !== "").map((q) => ({
    field: q.relatedCanvasField,
    value: project.canvas[q.relatedCanvasField],
  }));
}

// Read-only Risk Memo serialization — added as the real, demand-driven second
// and third consumers (MVP Planning Assistant, Validation Planning Assistant)
// per sdd/workspace/01_architecture.md#context-eligibility-rules Rule 1;
// never built speculatively ahead of those. Only non-empty fields are
// included, mirroring buildWorkspaceSnapshot's own filter.
export function buildRiskMemoContext(project: Project): CanvasContextField[] {
  return (Object.entries(project.riskMemo) as [keyof Project["riskMemo"], string][])
    .filter(([, value]) => value.trim() !== "")
    .map(([field, value]) => ({ field, value }));
}

// Read-only MVP Scope serialization — same Context Eligibility Rules
// discipline as above; a single-field artifact, so this always returns at
// most one entry.
export function buildMvpScopeContext(project: Project): CanvasContextField[] {
  return project.mvpScope.trim() === "" ? [] : [{ field: "mvpScope", value: project.mvpScope }];
}

// Read-only Feature Plan serialization — the Project Summary Synthesis
// Assistant's "MVP context" per
// sdd/ai/capabilities/06_project_summary_synthesis_assistant.md covers both
// the MVP Scope statement (buildMvpScopeContext above) and the planned
// Feature list; callers combine both, per that capability's Request Contract.
export function buildFeaturePlanContext(project: Project): CanvasContextField[] {
  return project.features.map((feature) => ({
    field: `feature:${feature.id}`,
    value: `${feature.name} (priority: ${feature.priority}, ${feature.inScope ? "in scope" : "out of scope"})`,
  }));
}

// Read-only Validation Checklist serialization — the real, demand-driven
// consumer is the Project Summary Synthesis Assistant
// (sdd/ai/capabilities/06_project_summary_synthesis_assistant.md), per
// sdd/workspace/01_architecture.md#context-eligibility-rules Rule 1. One
// context field per Validation item, each carrying its assumption, method,
// success criterion, and resolution status in one flattened value string —
// this module's CanvasContextField shape has no room for per-item structure,
// and flattening here (rather than teaching the AI layer a second, richer
// context shape) keeps Normalized Workspace Context's one shared shape intact.
export function buildValidationContext(project: Project): CanvasContextField[] {
  return project.validationItems.map((item, index) => ({
    field: `validationItem${index + 1}`,
    value: `Assumption: ${item.assumption}; Method: ${item.method}; Success criterion: ${item.successCriterion}; Status: ${item.status}`,
  }));
}
