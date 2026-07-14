// EventTracker Interface — the Feature-facing contract every Analytics Provider
// implements, per sdd/analytics/01_architecture.md (Tracking Model) and
// sdd/analytics/03_provider_independence.md (Zero-Provider-Conditional Rule).
// No code outside a Provider implementation may branch on `id` — `id` exists
// for routing/logging only.

export type AnalyticsEventName =
  | "landing_page_view"
  | "cta_clicked"
  | "workspace_started"
  | "template_selected"
  | "signup_started";

export type AnalyticsEventProperties = Record<string, string | number | boolean>;

// Mirrors sdd/analytics/02_event_model.md's Event Envelope. Landing carries
// `pagePath`, never `feature`/`screen` — see that document's Event Envelope table.
export type AnalyticsEvent = {
  eventId: string;
  eventName: AnalyticsEventName;
  timestamp: string;
  sessionId: string;
  anonymousUserId: string;
  pagePath: string;
  properties?: AnalyticsEventProperties;
};

export type TrackEventInput = {
  eventName: AnalyticsEventName;
  pagePath: string;
  properties?: AnalyticsEventProperties;
};

export interface EventTracker {
  readonly id: string;
  track(event: AnalyticsEvent): void;
}
