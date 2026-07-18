// Conceptual data shapes, per sdd/workspace/02_data_and_state.md — Data Ownership.
// No persistence/schema concerns here; that lives in src/platform/storage.ts.

export type LifecycleStage =
  | "captured"
  | "structuring"
  | "scoped"
  | "validating"
  | "validated"
  | "build-ready"
  | "archived";

export interface Canvas {
  businessIdea: string;
  problem: string;
  targetCustomer: string;
  solution: string;
  valueProposition: string;
}

export const emptyCanvas: Canvas = {
  businessIdea: "",
  problem: "",
  targetCustomer: "",
  solution: "",
  valueProposition: "",
};

export type FeaturePriority = "must" | "should" | "could";

export interface PlannedFeature {
  id: string;
  name: string;
  priority: FeaturePriority;
  inScope: boolean;
}

// Three independently-addressable, optional fields — never a combined blob.
// Per sdd/workspace/features/06_risk_memo.md: deliberately not named
// "Assumptions" to avoid colliding with ValidationItem.assumption below,
// which owns that concept.
export interface RiskMemo {
  technicalRisks: string;
  businessRisks: string;
  openQuestions: string;
}

export const emptyRiskMemo: RiskMemo = {
  technicalRisks: "",
  businessRisks: "",
  openQuestions: "",
};

export type ValidationStatus = "open" | "validated" | "invalidated";

export interface ValidationItem {
  id: string;
  assumption: string;
  method: string;
  successCriterion: string;
  status: ValidationStatus;
}

// Lightweight, append-only Feature Plan change record — per
// sdd/workspace/features/03_mvp_planning.md#history. Automatic Created/Removed
// events only, never a field-level edit log, and never a Feature's origin
// (manual vs. AI-accepted) -- recording origin would reintroduce the
// AI-provenance marker this project has already rejected (ADR-0009).
export type FeatureHistoryEventType = "created" | "removed";

export interface FeatureHistoryEvent {
  id: string;
  featureId: string;
  // A snapshot, not a live reference -- a removed Feature has no live name to
  // look up afterward.
  featureName: string;
  eventType: FeatureHistoryEventType;
  timestamp: string;
  annotation?: string;
}

// Project Summary's persisted, AI-synthesized artifact — per
// sdd/architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md.
// Feature-local state, orthogonal to LifecycleStage above (never a redefinition
// of it) — see domain/summaryLifecycle.ts for the pure transition logic.
export type SummaryLifecycleStatus = "notGenerated" | "generating" | "generated" | "outOfSync";

export interface ProjectSummary {
  text: string;
  status: SummaryLifecycleStatus;
  generatedAt?: string;
}

export const emptyProjectSummary: ProjectSummary = {
  text: "",
  status: "notGenerated",
};

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  stage: LifecycleStage;

  canvas: Canvas;
  riskNotes: string;
  riskMemo: RiskMemo;

  mvpScope: string;
  mvpScopeComplete: boolean;
  features: PlannedFeature[];
  featurePlanningComplete: boolean;
  featureHistory: FeatureHistoryEvent[];

  validationItems: ValidationItem[];

  summary: ProjectSummary;
}

export function createEmptyProject(id: string, name: string): Project {
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    stage: "captured",
    canvas: { ...emptyCanvas },
    riskNotes: "",
    riskMemo: { ...emptyRiskMemo },
    mvpScope: "",
    mvpScopeComplete: false,
    features: [],
    featurePlanningComplete: false,
    featureHistory: [],
    validationItems: [],
    summary: { ...emptyProjectSummary },
  };
}
