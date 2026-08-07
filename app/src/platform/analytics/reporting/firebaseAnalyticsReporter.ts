// Firebase Analytics (GA4) Reporter — NOT an Analytics Provider under
// sdd/analytics/03_provider_independence.md's Provider Interface (it does not
// implement EventTracker). Per that document's explicit "Firebase Analytics
// (GA4) — A Non-Portable Reporting Sink, Not a Provider" carve-out, this is a
// permanently separate, optional forwarding path used only for GA4's
// out-of-the-box marketing/funnel dashboards. It never becomes the Analytics
// Service's source of truth, and its presence/absence never changes Provider
// selection in ../container.ts. Called directly from ../analyticsService.ts,
// never through the Provider Interface.

import { getFirebaseApp } from "../firebaseApp";
import type { AnalyticsEvent } from "../eventTracker";
import type { FirebaseAnalyticsReportingConfig } from "../config";

type FirebaseAnalyticsHandle = {
  logEvent: typeof import("firebase/analytics").logEvent;
  analytics: import("firebase/analytics").Analytics;
};

let handlePromise: Promise<FirebaseAnalyticsHandle> | undefined;

async function initialize(config: FirebaseAnalyticsReportingConfig): Promise<FirebaseAnalyticsHandle> {
  const { getAnalytics, logEvent } = await import("firebase/analytics");
  const app = await getFirebaseApp(config);
  return { logEvent, analytics: getAnalytics(app) };
}

function getHandle(config: FirebaseAnalyticsReportingConfig): Promise<FirebaseAnalyticsHandle> {
  if (!handlePromise) {
    handlePromise = initialize(config);
  }
  return handlePromise;
}

export function reportToFirebaseAnalytics(event: AnalyticsEvent, config: FirebaseAnalyticsReportingConfig): void {
  void getHandle(config)
    .then(({ logEvent, analytics }) => {
      // Cast past the GA4 SDK's reserved-event-name overloads (e.g. its own
      // "screen_view" expects {firebase_screen, firebase_screen_class}) —
      // this reporter forwards every eventName as an opaque custom event per
      // this project's own Event Catalog, never GA4's reserved semantics.
      logEvent(analytics, event.eventName as string, {
        sessionId: event.sessionId,
        anonymousUserId: event.anonymousUserId,
        ...(event.pagePath !== undefined ? { pagePath: event.pagePath } : {}),
        ...(event.feature !== undefined ? { feature: event.feature } : {}),
        ...(event.screen !== undefined ? { screen: event.screen } : {}),
        ...event.properties,
      });
    })
    .catch((error: unknown) => {
      console.error("[analytics:ga4] failed to report event", event.eventName, error);
    });
}
