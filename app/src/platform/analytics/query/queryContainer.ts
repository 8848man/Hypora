// Composition root for the Analytics read path. This is the ONLY place a
// concrete AnalyticsRepository is selected — mirrors ../container.ts's own
// selectDefaultProvider pattern for the write path. Swapping which Repository
// backs the default (Firestore now; PostgreSQL/ClickHouse/BigQuery later, per
// sdd/analytics/06_query_and_reporting.md#migration-considerations) never
// requires touching the Analytics Query Service or the Dashboard.

import { resolveFirebaseFirestoreConfig } from "../config";
import { FirebaseAnalyticsRepository } from "./repositories/FirebaseAnalyticsRepository";
import { NoopAnalyticsRepository } from "./repositories/NoopAnalyticsRepository";
import type { AnalyticsRepository } from "./analyticsRepository";

function selectDefaultRepository(): AnalyticsRepository {
  const config = resolveFirebaseFirestoreConfig();
  if (config) {
    return new FirebaseAnalyticsRepository(config);
  }
  return new NoopAnalyticsRepository();
}

let activeRepository: AnalyticsRepository | undefined;

export function getAnalyticsRepository(): AnalyticsRepository {
  if (!activeRepository) {
    activeRepository = selectDefaultRepository();
  }
  return activeRepository;
}
