// Event Timeline panel — presentation only. Requests a time-ordered list from
// the Analytics Query Service; renders a plain table, selecting a row for
// Event Detail (passthrough, no additional query — per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope).

import { useEffect, useState } from "react";
import { Alert, Card, EmptyState, LoadingIndicator } from "../../../design-system";
import { getTimeline } from "../../../platform/analytics/query/analyticsQueryService";
import type { AnalyticsEvent } from "../../../platform/analytics/eventTracker";

const TIMELINE_RANGE_DAYS = 30;
const TIMELINE_LIMIT = 50;

export function EventTimelinePanel({ onSelectEvent }: { onSelectEvent: (event: AnalyticsEvent) => void }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const since = new Date(Date.now() - TIMELINE_RANGE_DAYS * 24 * 60 * 60 * 1000);
    getTimeline({ since }, undefined, TIMELINE_LIMIT)
      .then(setEvents)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load timeline"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingIndicator label="Loading events…" />;
  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!events || events.length === 0) {
    return <EmptyState title="No events yet" description="Events will appear here once Landing/Workspace traffic is recorded." />;
  }

  return (
    <Card>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-neutral-border, #ddd)" }}>
            <th style={{ padding: "var(--space-2)" }}>Timestamp</th>
            <th style={{ padding: "var(--space-2)" }}>Event</th>
            <th style={{ padding: "var(--space-2)" }}>Page</th>
            <th style={{ padding: "var(--space-2)" }}>Placement/Source</th>
            <th style={{ padding: "var(--space-2)" }}>Session</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.eventId}
              onClick={() => onSelectEvent(event)}
              style={{ cursor: "pointer", borderBottom: "1px solid var(--color-neutral-border, #eee)" }}
            >
              <td style={{ padding: "var(--space-2)" }}>{event.timestamp}</td>
              <td style={{ padding: "var(--space-2)" }}>{event.eventName}</td>
              <td style={{ padding: "var(--space-2)" }}>{event.pagePath}</td>
              <td style={{ padding: "var(--space-2)" }}>
                {(event.properties?.placement as string | undefined) ?? (event.properties?.source as string | undefined) ?? "—"}
              </td>
              <td style={{ padding: "var(--space-2)", fontFamily: "monospace", fontSize: "0.85em" }}>
                {event.sessionId.slice(0, 8)}…
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
