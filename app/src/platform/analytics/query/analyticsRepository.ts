// Analytics Repository Interface — the read-side equivalent of the Analytics
// Provider Interface, per sdd/analytics/06_query_and_reporting.md. A stable,
// provider-independent contract for retrieving already-stored events, in the
// Event Model's own envelope shape — never a provider-native document/row.
// The Zero-Provider-Conditional Rule applies here identically: no code
// outside a concrete Repository implementation may branch on which backend
// is active. A Repository returns raw matching events only — aggregation and
// funnel math are the Analytics Query Service's job, never this contract's.

import type { AnalyticsEvent, AnalyticsEventName } from "../eventTracker";

export type EventQueryFilter = {
  eventNames?: AnalyticsEventName[];
  since: Date;
  until?: Date;
  limit?: number;
};

export interface AnalyticsRepository {
  readonly id: string;
  queryEvents(filter: EventQueryFilter): Promise<AnalyticsEvent[]>;
}
