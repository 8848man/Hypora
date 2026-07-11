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
import type { CanvasContextField } from "../ai/types";
import { QUESTIONS } from "../features/business-structuring/questionModel";

export function buildWorkspaceSnapshot(project: Project): CanvasContextField[] {
  return QUESTIONS.filter((q) => project.canvas[q.relatedCanvasField].trim() !== "").map((q) => ({
    field: q.relatedCanvasField,
    value: project.canvas[q.relatedCanvasField],
  }));
}
