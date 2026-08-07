// Operational Health panel — presentation only, per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope. Answers "is
// analytics working today": events received today, the most recent event's
// timestamp, and which core events have gone silent. Explicitly not a
// performance/latency monitor (see that document's Non-Goals) — every number
// here comes from the same Event Model envelope every other panel reads.

import { useEffect, useState } from "react";
import { Alert, Badge, Card, LoadingIndicator, Stack } from "../../../design-system";
import {
  getEventBreakdown,
  getTimeline,
  type EventBreakdownRow,
} from "../../../platform/analytics/query/analyticsQueryService";
import type { AnalyticsEvent, AnalyticsEventName } from "../../../platform/analytics/eventTracker";
import { formatKst, formatRelativeTime } from "./kstTime";

// Curated, not the full Event Catalog: a "missing" check is only meaningful
// for events already known to fire in the current implementation. Several
// catalogued events (e.g. signup_started, template_selected) are explicitly
// "Anticipated, not yet wired" per sdd/analytics/04_event_catalog.md --
// including them here would always show red for a reason that isn't a real
// ingestion problem.
const MONITORED_EVENTS: AnalyticsEventName[] = [
  "landing_page_view",
  "cta_clicked",
  "workspace_started",
  "project_created",
  "canvas_field_updated",
  "ai_request_sent",
];
const HEALTH_WINDOW_DAYS = 7;

export function OperationalHealthPanel() {
  const [breakdown, setBreakdown] = useState<EventBreakdownRow[]>();
  const [latestEvent, setLatestEvent] = useState<AnalyticsEvent | undefined>();
  const [eventsToday, setEventsToday] = useState<number>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const windowSince = new Date(Date.now() - HEALTH_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const todaySince = new Date();
    todaySince.setHours(0, 0, 0, 0);

    Promise.all([
      getEventBreakdown({ since: windowSince }, MONITORED_EVENTS),
      getTimeline({ since: windowSince }, undefined, 1),
      getEventBreakdown({ since: todaySince }, MONITORED_EVENTS),
    ])
      .then(([breakdownResult, latest, todayBreakdown]) => {
        setBreakdown(breakdownResult);
        setLatestEvent(latest[0]);
        setEventsToday(todayBreakdown.reduce((sum, row) => sum + row.eventCount, 0));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load operational health"));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!breakdown || eventsToday === undefined) return <LoadingIndicator label="Loading operational health…" />;

  const silentEvents = breakdown.filter((row) => row.eventCount === 0);

  return (
    <Card>
      <Stack direction="row" gap="var(--space-5)" style={{ flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>Events Today</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-heading-1)" }}>{eventsToday}</p>
        </div>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>Most Recent Event</p>
          {latestEvent ? (
            <>
              <p style={{ margin: 0 }}>{latestEvent.eventName}</p>
              <p style={{ margin: 0, fontSize: "var(--font-size-caption)", color: "var(--color-neutral-text-muted)" }}>
                {formatRelativeTime(latestEvent.timestamp)} — {formatKst(latestEvent.timestamp)}
              </p>
            </>
          ) : (
            <p style={{ margin: 0, color: "var(--color-neutral-text-muted)" }}>No events yet</p>
          )}
        </div>
        <div>
          <p style={{ margin: "0 0 var(--space-1)", color: "var(--color-neutral-text-muted)" }}>Ingestion Status</p>
          {silentEvents.length === 0 ? (
            <Badge tone="success">All monitored events firing</Badge>
          ) : (
            <Badge tone="danger">
              {silentEvents.length} silent: {silentEvents.map((e) => e.eventName).join(", ")}
            </Badge>
          )}
        </div>
      </Stack>
    </Card>
  );
}
