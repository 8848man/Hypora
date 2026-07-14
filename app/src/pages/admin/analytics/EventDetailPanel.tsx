// Event Detail panel — presentation only. Direct passthrough of a single
// Timeline result already fetched; no additional query, per
// sdd/analytics/06_query_and_reporting.md's Dashboard Scope.

import { Card } from "../../../design-system";
import type { AnalyticsEvent } from "../../../platform/analytics/eventTracker";

export function EventDetailPanel({ event, onClose }: { event: AnalyticsEvent; onClose: () => void }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Event Detail</h3>
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <pre style={{ overflowX: "auto", background: "var(--color-neutral-surface-muted, #f5f5f5)", padding: "var(--space-3)" }}>
        {JSON.stringify(event, null, 2)}
      </pre>
    </Card>
  );
}
