// Funnel Analysis panel — presentation only. The funnel definition is
// configuration (an ordered eventName array), never bespoke code per funnel,
// per sdd/analytics/06_query_and_reporting.md's Query Model. Seeded with the
// Overview's own three-step funnel; a future funnel is a new array passed to
// the same component, not a new one.

import { useEffect, useState } from "react";
import { Alert, Card, LoadingIndicator } from "../../../design-system";
import { getFunnel } from "../../../platform/analytics/query/analyticsQueryService";
import type { FunnelResult } from "../../../platform/analytics/query/analyticsQueryService";
import type { AnalyticsEventName } from "../../../platform/analytics/eventTracker";

const DEFAULT_FUNNEL: AnalyticsEventName[] = ["landing_page_view", "cta_clicked", "workspace_started"];
const FUNNEL_RANGE_DAYS = 30;

export function FunnelPanel({ steps = DEFAULT_FUNNEL }: { steps?: AnalyticsEventName[] }) {
  const [funnel, setFunnel] = useState<FunnelResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Depend on the serialized value, not the array reference, since `steps`
  // is a configuration value that may be passed as a fresh literal.
  const stepsKey = JSON.stringify(steps);

  useEffect(() => {
    const since = new Date(Date.now() - FUNNEL_RANGE_DAYS * 24 * 60 * 60 * 1000);
    getFunnel(steps, { since })
      .then(setFunnel)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load funnel"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [stepsKey]);

  if (loading) return <LoadingIndicator label="Loading funnel…" />;
  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!funnel) return null;

  return (
    <Card>
      {funnel.steps.map((step, index) => (
        <div key={step.eventName} style={{ marginBottom: index < funnel.steps.length - 1 ? "var(--space-3)" : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{step.eventName}</span>
            <strong>{step.sessionCount}</strong>
          </div>
          {step.conversionFromPreviousPercent !== null && (
            <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-neutral-text-muted)", textAlign: "center" }}>
              ↓ {step.conversionFromPreviousPercent}%
            </p>
          )}
        </div>
      ))}
    </Card>
  );
}
