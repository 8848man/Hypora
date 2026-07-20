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

// Onboarding Preset Assistant's output, per
// sdd/ai/capabilities/07_onboarding_preset_assistant.md and ADR-0019, as
// simplified by ADR-0021 (no more Sufficiency/Thinking-Prompts branching --
// "ready" always means a full five-question preset batch). Deliberately
// much smaller than ProjectSummary above -- this capability is never
// re-invoked and has no staleness concept, so there is no "outOfSync"
// state to model here.
//
// "generating" IS persisted (unlike an earlier revision of this comment
// claimed) -- this is the fix for a real timing bug: without a persisted
// Generating state, a Project mid-generation is indistinguishable from a
// pre-AI-era Project with no onboarding metadata at all (both read back as
// `undefined`), so the UI had no way to avoid flashing static presets
// before the pending request resolved. Setting `{status:"generating"}`
// synchronously at Project creation (see project-management's
// ProjectListPage) closes that gap -- see this capability spec's own
// Lifecycle section, Frontend Representation subsection.
export type OnboardingPresetsStatus = "generating" | "ready" | "fallback";

export interface OnboardingPresets {
  status: OnboardingPresetsStatus;
  // Present only when status is "ready" -- per-question tailored presets,
  // keyed by the same questionId used in
  // src/features/business-structuring/questionModel.ts. Always covers all
  // five questions when present, per ADR-0021.
  presets?: Partial<Record<string, string[]>>;
}

export interface Project {
  id: string;
  name: string;
  // Optional, freeform, added by ADR-0019 -- distinct from Name and from
  // any Canvas field, per sdd/workspace/02_data_and_state.md. Never
  // localized (src/localization's "not localized" list), never re-derives
  // already-generated onboardingPresets or already-answered Canvas fields
  // when edited after creation.
  description: string;
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

  // Absent = Onboarding Preset Assistant has not (yet, or ever) resolved for
  // this Project -- src/features/business-structuring/questionModel.ts's
  // resolvePresets() already treats "absent" and "fallback" identically
  // (both fall back to the static V1 provider), so no third persisted state
  // is needed for "not started".
  onboardingPresets?: OnboardingPresets;
}

export function createEmptyProject(id: string, name: string, description = ""): Project {
  return {
    id,
    name,
    description,
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
