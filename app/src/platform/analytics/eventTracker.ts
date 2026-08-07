// EventTracker Interface — the Feature-facing contract every Analytics Provider
// implements, per sdd/analytics/01_architecture.md (Tracking Model) and
// sdd/analytics/03_provider_independence.md (Zero-Provider-Conditional Rule).
// No code outside a Provider implementation may branch on `id` — `id` exists
// for routing/logging only.

export type AnalyticsEventName =
  // Landing (per sdd/analytics/04_event_catalog.md#landing)
  | "landing_page_view"
  | "cta_clicked"
  | "workspace_started"
  | "template_selected"
  | "signup_started"
  // Project (per sdd/analytics/04_event_catalog.md's Project section)
  | "project_created"
  | "project_opened"
  | "project_archived"
  // Business Structuring
  | "business_structuring_started"
  | "canvas_field_updated"
  | "business_structuring_review_confirmed"
  | "risk_notes_updated"
  // Risk Memo
  | "risk_memo_field_updated"
  // MVP Planning
  | "mvp_scope_updated"
  | "mvp_scope_marked_complete"
  | "feature_created"
  | "feature_planning_marked_complete"
  // Validation Planning
  | "validation_item_created"
  | "validation_item_resolved"
  // AI (per sdd/analytics/04_event_catalog.md#ai — one shared set, properties.capabilityId names which)
  | "ai_request_sent"
  | "ai_suggestion_ready"
  | "ai_request_failed"
  | "ai_suggestion_accepted"
  | "ai_suggestion_rejected"
  | "ai_regenerate_requested"
  // Navigation
  | "screen_view";

export type AnalyticsEventProperties = Record<string, string | number | boolean>;

// Mirrors sdd/analytics/02_event_model.md's Event Envelope. An emitting call
// site supplies exactly one of `pagePath` (Landing, no Feature/Capability
// vocabulary of its own) or `feature`/`screen` (Workspace/AI) — never both,
// per that document's Event Envelope table.
export type AnalyticsEvent = {
  eventId: string;
  eventName: AnalyticsEventName;
  timestamp: string;
  sessionId: string;
  anonymousUserId: string;
  pagePath?: string;
  feature?: string;
  screen?: string;
  projectId?: string;
  properties?: AnalyticsEventProperties;
};

export type TrackEventInput = {
  eventName: AnalyticsEventName;
  pagePath?: string;
  feature?: string;
  screen?: string;
  projectId?: string;
  properties?: AnalyticsEventProperties;
};

export interface EventTracker {
  readonly id: string;
  track(event: AnalyticsEvent): void;
}
