// Composition root for the Analytics Platform Service (frontend). This is the
// ONLY place a concrete EventTracker Provider is selected — mirrors
// app/server/ai/container.ts's own selectDefaultProvider pattern for the AI
// Platform Service. Swapping which Provider backs the default (Firebase now;
// PostgreSQL/ClickHouse/BigQuery/Mixpanel/Segment later, per
// sdd/analytics/05_migration_strategy.md) never requires touching
// analyticsService.ts or any Feature/page code
// (sdd/analytics/03_provider_independence.md).

import { resolveFirebaseFirestoreConfig } from "./config";
import { FirebaseEventTracker } from "./providers/FirebaseEventTracker";
import { NoopEventTracker } from "./providers/NoopEventTracker";
import type { EventTracker } from "./eventTracker";

function selectDefaultProvider(): EventTracker {
  const config = resolveFirebaseFirestoreConfig();
  if (config) {
    return new FirebaseEventTracker(config);
  }
  return new NoopEventTracker();
}

let activeTracker: EventTracker | undefined;

export function getEventTracker(): EventTracker {
  if (!activeTracker) {
    activeTracker = selectDefaultProvider();
  }
  return activeTracker;
}
