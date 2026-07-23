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

export type EventBreakdownRow = {
  eventName: AnalyticsEventName;
  eventCount: number;
  distinctUserCount: number;
};

// Deliberately queries with no eventName filter — the Event Catalog has more
// entries than Firestore's `in` operator supports (10), so this fetches every
// event in range once and groups client-side, per sdd/analytics/06's "prefer
// simple queries over expensive analytics pipelines." `catalog` controls
// which rows are always returned (zero-count included), so a silently-broken
// event is visible as a 0, not an absent row — this is what Operational
// Health's "missing expected events" check reads.
export async function getEventBreakdown(range: TimeRange, catalog: AnalyticsEventName[]): Promise<EventBreakdownRow[]> {
  const events = await getAnalyticsRepository().queryEvents({ since: range.since, until: range.until });

  const rows = new Map<AnalyticsEventName, { count: number; users: Set<string> }>();
  for (const name of catalog) rows.set(name, { count: 0, users: new Set() });

  for (const event of events) {
    const row = rows.get(event.eventName);
    if (!row) continue; // not one of the requested catalog rows
    row.count += 1;
    row.users.add(event.anonymousUserId);
  }

  return catalog.map((eventName) => {
    const row = rows.get(eventName);
    return { eventName, eventCount: row?.count ?? 0, distinctUserCount: row?.users.size ?? 0 };
  });
}

export type AiCapabilityScorecardRow = {
  capabilityId: string;
  totalRequests: number;
  // null when the denominator is 0 — "no data yet," never displayed as 0%.
  acceptRate: number | null;
  failureRate: number | null;
};

// Reads properties.capabilityId, per sdd/analytics/04_event_catalog.md#ai
// ("one shared set of events for every AI Capability... properties.capabilityId
// names which"). Grouping/rate math lives here (Query Service), never in the
// Repository, per that layer's own "must never perform aggregation" rule.
export async function getAiCapabilityScorecard(range: TimeRange): Promise<AiCapabilityScorecardRow[]> {
  const events = await getAnalyticsRepository().queryEvents({
    eventNames: ["ai_request_sent", "ai_suggestion_ready", "ai_request_failed", "ai_suggestion_accepted"],
    since: range.since,
    until: range.until,
  });

  const byCapability = new Map<string, { sent: number; ready: number; failed: number; accepted: number }>();
  for (const event of events) {
    const capabilityId = event.properties?.capabilityId;
    if (typeof capabilityId !== "string") continue;
    const row = byCapability.get(capabilityId) ?? { sent: 0, ready: 0, failed: 0, accepted: 0 };
    if (event.eventName === "ai_request_sent") row.sent += 1;
    else if (event.eventName === "ai_suggestion_ready") row.ready += 1;
    else if (event.eventName === "ai_request_failed") row.failed += 1;
    else if (event.eventName === "ai_suggestion_accepted") row.accepted += 1;
    byCapability.set(capabilityId, row);
  }

  return Array.from(byCapability.entries())
    .map(([capabilityId, counts]) => ({
      capabilityId,
      totalRequests: counts.sent,
      acceptRate: counts.ready > 0 ? Math.round((counts.accepted / counts.ready) * 1000) / 10 : null,
      failureRate: counts.sent > 0 ? Math.round((counts.failed / counts.sent) * 1000) / 10 : null,
    }))
    .sort((a, b) => b.totalRequests - a.totalRequests);
}

export type TimeToFirstValueResult = {
  averageMs: number | null;
  medianMs: number | null;
  sampleSize: number;
};

// Per-session elapsed time between a start event and a milestone event, per
// sdd/analytics/06_query_and_reporting.md's Time to First Value query shape.
// A distribution/histogram is deliberately not computed here — that
// document's own Query Model states one isn't required, and nothing consumes
// it yet.
export async function getTimeToFirstValue(
  startEventName: AnalyticsEventName,
  milestoneEventName: AnalyticsEventName,
  range: TimeRange,
): Promise<TimeToFirstValueResult> {
  const events = await getAnalyticsRepository().queryEvents({
    eventNames: [startEventName, milestoneEventName],
    since: range.since,
    until: range.until,
  });

  const startBySession = new Map<string, number>();
  const milestoneBySession = new Map<string, number>();
  for (const event of events) {
    const t = new Date(event.timestamp).getTime();
    const target = event.eventName === startEventName ? startBySession : milestoneBySession;
    const existing = target.get(event.sessionId);
    if (existing === undefined || t < existing) target.set(event.sessionId, t);
  }

  const deltas: number[] = [];
  for (const [sessionId, startMs] of startBySession) {
    const milestoneMs = milestoneBySession.get(sessionId);
    if (milestoneMs !== undefined && milestoneMs >= startMs) deltas.push(milestoneMs - startMs);
  }

  if (deltas.length === 0) return { averageMs: null, medianMs: null, sampleSize: 0 };

  deltas.sort((a, b) => a - b);
  const averageMs = Math.round(deltas.reduce((sum, d) => sum + d, 0) / deltas.length);
  const mid = Math.floor(deltas.length / 2);
  const medianMs = deltas.length % 2 === 0 ? Math.round((deltas[mid - 1] + deltas[mid]) / 2) : deltas[mid];

  return { averageMs, medianMs, sampleSize: deltas.length };
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
