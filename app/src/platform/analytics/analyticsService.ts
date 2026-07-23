// Analytics Service — normalizes every event's envelope
// (sdd/analytics/02_event_model.md) before handing it to the currently active
// EventTracker Provider. This is the single import surface Feature/page code
// uses; it never imports a Provider or the Firebase SDK directly
// (sdd/analytics/03_provider_independence.md, Zero-Provider-Conditional Rule).

import { getEventTracker } from "./container";
import { generateId, getAnonymousUserId, getSessionId } from "./session";
import { resolveFirebaseAnalyticsReportingConfig } from "./config";
import { reportToFirebaseAnalytics } from "./reporting/firebaseAnalyticsReporter";
import type { AnalyticsEvent, TrackEventInput } from "./eventTracker";

export function trackEvent(input: TrackEventInput): void {
  const event: AnalyticsEvent = {
    eventId: generateId(),
    eventName: input.eventName,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    anonymousUserId: getAnonymousUserId(),
    pagePath: input.pagePath,
    feature: input.feature,
    screen: input.screen,
    projectId: input.projectId,
    properties: input.properties,
  };

  getEventTracker().track(event);

  // GA4 is a separate, optional reporting sink, never the Provider itself —
  // see sdd/analytics/03_provider_independence.md's Non-Portable Reporting
  // Sink carve-out. Forwarded here, not through container.ts, so Provider
  // selection stays single-target.
  const reportingConfig = resolveFirebaseAnalyticsReportingConfig();
  if (reportingConfig) {
    reportToFirebaseAnalytics(event, reportingConfig);
  }
}
