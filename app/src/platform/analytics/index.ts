// Public surface of the Analytics Platform Service. Feature/page code imports
// only from here — never from ./providers/*, ./container, or the Firebase SDK
// directly (sdd/analytics/03_provider_independence.md).

export { trackEvent } from "./analyticsService";
export type { AnalyticsEventName, AnalyticsEventProperties, TrackEventInput } from "./eventTracker";
