// The single source of truth for "current confirmed Canvas state" used by this
// Feature's AI invocations — per sdd/ai/04_ai_interaction.md's Progressive Context
// Accumulation policy. Context Creation/Selection is Feature-owned (03_ownership_model.md);
// this function is that ownership made concrete for Business Structuring.
//
// Built fresh from `project` on every call — never cached, never retaining a prior
// invocation's data. No obsolete values are possible by construction: Canvas fields
// hold only their current value, never a history.

import type { Project } from "../../domain/types";
import type { CanvasContextField } from "../../ai/types";
import { QUESTIONS } from "./questionModel";

export function buildWorkspaceSnapshot(project: Project): CanvasContextField[] {
  return QUESTIONS.filter((q) => project.canvas[q.relatedCanvasField].trim() !== "").map((q) => ({
    field: q.relatedCanvasField,
    value: project.canvas[q.relatedCanvasField],
  }));
}
