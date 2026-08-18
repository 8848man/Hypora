// Amplitude Reporter — NOT an Analytics Provider under
// sdd/analytics/03_provider_independence.md's Provider Interface (it does not
// implement EventTracker). Per that document's "Non-Portable Reporting Sinks"
// carve-out and ADR-0028, this is a permanently separate, optional forwarding
// path used only for Amplitude's own out-of-the-box dashboards. It never
// becomes the Analytics Service's source of truth, and its presence/absence
// never changes Provider selection in ../container.ts. Called directly from
// ../analyticsService.ts, never through the Provider Interface.
//
// Session Replay is deliberately not enabled (sampleRate: 0) — per ADR-0028,
// turning it on is a distinct future decision requiring its own review.
// Autocapture stays on; it is an Amplitude-side-only signal, never a project
// taxonomy (per 03_provider_independence.md's Amplitude section).

import type { AnalyticsEvent } from "../eventTracker";
import type { AmplitudeReportingConfig } from "../config";

let initPromise: Promise<typeof import("@amplitude/unified")> | undefined;

async function initialize(config: AmplitudeReportingConfig): Promise<typeof import("@amplitude/unified")> {
  const amplitude = await import("@amplitude/unified");
  await amplitude.initAll(config.apiKey, {
    analytics: { autocapture: true },
    sessionReplay: { sampleRate: 0 },
  });
  return amplitude;
}

function getClient(config: AmplitudeReportingConfig): Promise<typeof import("@amplitude/unified")> {
  if (!initPromise) {
    initPromise = initialize(config);
  }
  return initPromise;
}

export function reportToAmplitude(event: AnalyticsEvent, config: AmplitudeReportingConfig): void {
  void getClient(config)
    .then(({ track }) => {
      // Forwards the existing Catalog eventName/properties only — no
      // Amplitude-specific event name is introduced, per ADR-0028.
      track(event.eventName as string, {
        sessionId: event.sessionId,
        anonymousUserId: event.anonymousUserId,
        ...(event.pagePath !== undefined ? { pagePath: event.pagePath } : {}),
        ...(event.feature !== undefined ? { feature: event.feature } : {}),
        ...(event.screen !== undefined ? { screen: event.screen } : {}),
        ...event.properties,
        prompt_version: "BA400.4", // helps verify this Amplitude setup — safe to remove once the event lands in Amplitude's live feed
      });
    })
    .catch((error: unknown) => {
      console.error("[analytics:amplitude] failed to report event", event.eventName, error);
    });
}
