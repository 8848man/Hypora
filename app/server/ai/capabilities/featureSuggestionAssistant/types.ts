// Feature Suggestion Assistant Request/Response Contract — owned by this
// Capability, per sdd/ai/capabilities/05_feature_suggestion_assistant.md.
// Contract Version 1.0. Deliberately a separate contract from every other
// capability's — its Response is a structured array, not the scalar
// {suggestionText, rationale?} shape every other capability uses.

export type CanvasContextField = {
  field: string;
  value: string;
};

export type FeaturePriority = "must" | "should" | "could";

// Intra-Feature sibling context (MVP Planning's own current Feature Plan) —
// never read via the Workspace Context Builder, per this capability's own
// Request Contract note.
export type ExistingFeatureContext = {
  name: string;
  priority: FeaturePriority;
  inScope: boolean;
};

export type FeatureSuggestionAssistantRequest = {
  operation: "suggestion";
  canvasContext: CanvasContextField[];
  mvpScopeContext: CanvasContextField[];
  existingFeatures: ExistingFeatureContext[];
  riskContext: CanvasContextField[];
  language: "ko" | "en";
};

export type FeatureSuggestionItem = {
  name: string;
  rationale: string;
  primaryUserValue: string;
  priority: FeaturePriority;
};

// An ordered array — array order is the suggested implementation order, per
// the capability spec's Response Contract. No id, no duplicate-flag field:
// both are entirely client-computed/client-minted responsibilities.
export type FeatureSuggestionAssistantResponse = FeatureSuggestionItem[];
