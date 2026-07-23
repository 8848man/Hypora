// Event Timeline panel — presentation only. Requests a time-ordered list from
// the Analytics Query Service; renders a plain table, selecting a row for
// Event Detail (passthrough, no additional query — per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope).

import { useEffect, useState } from "react";
import { Alert, Card, EmptyState, LoadingIndicator, TextField } from "../../../design-system";
import { getTimeline } from "../../../platform/analytics/query/analyticsQueryService";
import type { AnalyticsEvent } from "../../../platform/analytics/eventTracker";
import { formatKst, formatRelativeTime } from "./kstTime";

const TIMELINE_RANGE_DAYS = 30;
const TIMELINE_LIMIT = 50;

export function EventTimelinePanel({
  onSelectEvent,
  sessionFilter,
  onClearSessionFilter,
}: {
  onSelectEvent: (event: AnalyticsEvent) => void;
  // Set when the operator jumps here from an Event Detail's session link
  // (Section 5's session-drill-down replacement for a dedicated Session
  // Explorer) — filters this same Timeline to one session instead of
  // building a second view.
  sessionFilter?: string;
  onClearSessionFilter?: () => void;
}) {
  const [events, setEvents] = useState<AnalyticsEvent[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [eventNameFilter, setEventNameFilter] = useState("");

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

  const filtered = events.filter((event) => {
    if (sessionFilter && event.sessionId !== sessionFilter) return false;
    if (eventNameFilter && !event.eventName.includes(eventNameFilter)) return false;
    return true;
  });

  return (
    <Card>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end", marginBottom: "var(--space-3)" }}>
        <TextField
          label="Filter by event name"
          value={eventNameFilter}
          onChange={(e) => setEventNameFilter(e.target.value)}
          placeholder="e.g. ai_"
        />
        {sessionFilter && onClearSessionFilter && (
          <button
            type="button"
            onClick={onClearSessionFilter}
            style={{ background: "none", border: "none", color: "var(--color-primary, #3b82f6)", cursor: "pointer" }}
          >
            Clear session filter ({sessionFilter.slice(0, 8)}…)
          </button>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-neutral-border, #ddd)" }}>
            <th style={{ padding: "var(--space-2)" }}>Timestamp (KST)</th>
            <th style={{ padding: "var(--space-2)" }}>Event</th>
            <th style={{ padding: "var(--space-2)" }}>Page / Feature</th>
            <th style={{ padding: "var(--space-2)" }}>Session</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((event) => (
            <tr
              key={event.eventId}
              onClick={() => onSelectEvent(event)}
              style={{ cursor: "pointer", borderBottom: "1px solid var(--color-neutral-border, #eee)" }}
            >
              <td style={{ padding: "var(--space-2)" }}>
                {formatKst(event.timestamp)}
                <span style={{ marginLeft: "var(--space-2)", color: "var(--color-neutral-text-muted)" }}>
                  ({formatRelativeTime(event.timestamp)})
                </span>
              </td>
              <td style={{ padding: "var(--space-2)" }}>{event.eventName}</td>
              <td style={{ padding: "var(--space-2)" }}>{event.pagePath ?? event.feature ?? "—"}</td>
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
