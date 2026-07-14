// Analytics Query Service — the read-side equivalent of the Analytics
// Service, per sdd/analytics/06_query_and_reporting.md. Owns aggregation,
// filtering, and funnel calculation; calls the Analytics Repository
// Interface only, never a concrete Repository — mirrors how the write-side
// Analytics Service calls EventTracker, never a concrete Provider. This is
// the single import surface the Dashboard uses; it never imports a
// Repository or the Firebase SDK directly.

import { getAnalyticsRepository } from "./queryContainer";
import type { AnalyticsEvent, AnalyticsEventName } from "../eventTracker";

export type TimeRange = {
  since: Date;
  until?: Date;
};

export type AggregateCountResult = {
  eventCount: number;
  distinctSessionCount: number;
};

export type FunnelStepResult = {
  eventName: AnalyticsEventName;
  sessionCount: number;
  // Percentage of the previous step's sessions that reached this step;
  // null for the funnel's first step, which has no "previous."
  conversionFromPreviousPercent: number | null;
};

export type FunnelResult = {
  steps: FunnelStepResult[];
};

export async function getAggregateCount(
  eventNames: AnalyticsEventName[],
  range: TimeRange,
): Promise<AggregateCountResult> {
  const events = await getAnalyticsRepository().queryEvents({
    eventNames,
    since: range.since,
    until: range.until,
  });
  const distinctSessionCount = new Set(events.map((event) => event.sessionId)).size;
  return { eventCount: events.length, distinctSessionCount };
}

export async function getTimeline(
  range: TimeRange,
  eventNames?: AnalyticsEventName[],
  limit = 50,
): Promise<AnalyticsEvent[]> {
  return getAnalyticsRepository().queryEvents({ eventNames, since: range.since, until: range.until, limit });
}

// Session-presence funnel, not a strict per-session sequential-order funnel:
// a step's count is "how many distinct sessions have this event at all in
// range," not "...and in this order relative to the previous step." A known,
// documented simplification adequate for this MVP's own three-step funnel
// (landing_page_view precedes cta_clicked precedes workspace_started by
// construction, per how the events are actually emitted) — revisit if a
// future funnel needs strict ordering.
export async function getFunnel(steps: AnalyticsEventName[], range: TimeRange): Promise<FunnelResult> {
  const events = await getAnalyticsRepository().queryEvents({
    eventNames: steps,
    since: range.since,
    until: range.until,
  });

  const sessionsByStep = new Map<AnalyticsEventName, Set<string>>();
  for (const step of steps) {
    sessionsByStep.set(step, new Set());
  }
  for (const event of events) {
    sessionsByStep.get(event.eventName)?.add(event.sessionId);
  }

  const result: FunnelStepResult[] = [];
  let previousCount: number | undefined;
  for (const step of steps) {
    const sessionCount = sessionsByStep.get(step)?.size ?? 0;
    const conversionFromPreviousPercent =
      previousCount === undefined ? null : previousCount === 0 ? 0 : Math.round((sessionCount / previousCount) * 1000) / 10;
    result.push({ eventName: step, sessionCount, conversionFromPreviousPercent });
    previousCount = sessionCount;
  }

  return { steps: result };
}
