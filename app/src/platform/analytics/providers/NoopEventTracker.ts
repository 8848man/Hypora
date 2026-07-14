// No-op Provider — mirrors the AI Platform's FakeProvider precedent
// (sdd/analytics/03_provider_independence.md, "Mock Provider"). Active whenever
// no real Firebase configuration is present (local dev without credentials,
// tests, CI) so Feature/page code never has to branch on whether analytics is
// actually configured.

import type { AnalyticsEvent, EventTracker } from "../eventTracker";

export class NoopEventTracker implements EventTracker {
  readonly id = "noop";

  track(event: AnalyticsEvent): void {
    if (import.meta.env.DEV) {
      console.debug("[analytics:noop]", event.eventName, event);
    }
  }
}
