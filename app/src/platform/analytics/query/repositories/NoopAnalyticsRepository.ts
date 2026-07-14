// No-op Repository — mirrors the write-side NoopEventTracker precedent.
// Active whenever no real Firestore configuration is present, so the
// Dashboard renders an empty (not crashed) state instead of branching on
// whether the read path is configured.

import type { AnalyticsEvent } from "../../eventTracker";
import type { AnalyticsRepository, EventQueryFilter } from "../analyticsRepository";

export class NoopAnalyticsRepository implements AnalyticsRepository {
  readonly id = "noop";

  async queryEvents(_filter: EventQueryFilter): Promise<AnalyticsEvent[]> {
    return [];
  }
}
