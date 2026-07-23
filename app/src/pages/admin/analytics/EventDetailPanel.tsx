// Event Detail panel — presentation only. Direct passthrough of a single
// Timeline result already fetched; no additional query, per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope.

import { Button, Card, Stack } from "../../../design-system";
import type { AnalyticsEvent } from "../../../platform/analytics/eventTracker";

export function EventDetailPanel({
  event,
  onClose,
  onFilterSession,
}: {
  event: AnalyticsEvent;
  onClose: () => void;
  // Replaces a dedicated Session Explorer (rejected during this dashboard's
  // design review as expensive relative to its value at current traffic):
  // one click filters the Timeline to this event's session instead.
  onFilterSession?: (sessionId: string) => void;
}) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Event Detail</h3>
        <Button variant="text" onClick={onClose} aria-label="Close">
          ×
        </Button>
      </div>
      {onFilterSession && (
        <Stack direction="row" style={{ marginBottom: "var(--space-2)" }}>
          <Button variant="secondary" onClick={() => onFilterSession(event.sessionId)}>
            View this session in Timeline
          </Button>
        </Stack>
      )}
      <pre style={{ overflowX: "auto", background: "var(--color-neutral-surface)", padding: "var(--space-3)" }}>
        {JSON.stringify(event, null, 2)}
      </pre>
    </Card>
  );
}
