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

export type ValidationStatus = "open" | "validated" | "invalidated";

export interface ValidationItem {
  id: string;
  assumption: string;
  method: string;
  successCriterion: string;
  status: ValidationStatus;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  stage: LifecycleStage;

  canvas: Canvas;
  riskNotes: string;

  mvpScope: string;
  mvpScopeComplete: boolean;
  features: PlannedFeature[];
  featurePlanningComplete: boolean;

  validationItems: ValidationItem[];
}

export function createEmptyProject(id: string, name: string): Project {
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    stage: "captured",
    canvas: { ...emptyCanvas },
    riskNotes: "",
    mvpScope: "",
    mvpScopeComplete: false,
    features: [],
    featurePlanningComplete: false,
    validationItems: [],
  };
}
