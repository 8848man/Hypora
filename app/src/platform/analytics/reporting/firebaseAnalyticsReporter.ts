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
      logEvent(analytics, event.eventName, {
        sessionId: event.sessionId,
        anonymousUserId: event.anonymousUserId,
        pagePath: event.pagePath,
        ...event.properties,
      });
    })
    .catch((error: unknown) => {
      console.error("[analytics:ga4] failed to report event", event.eventName, error);
    });
}
